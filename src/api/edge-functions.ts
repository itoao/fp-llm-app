import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { mockCashFlows, mockAssets, mockFinancialAdvice } from '../lib/mockData';;

// Initialize Hono app
const app = new Hono();

// Apply CORS middleware
app.use('*', cors());

// Simulate endpoint request schema
const simulateRequestSchema = z.object({
  prompt: z.string(),
  context: z.object({
    cash_flows: z.array(z.any()).optional(),
    assets: z.array(z.any()).optional(),
  }).optional(),
});

// Mock JWT validation middleware
async function validateJWT(authHeader: string | undefined) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  return {
    id: 'mock-user-id',
    email: 'demo@example.com'
  };
}

// Mock Mastra agent call
async function callMastraAgent(prompt: string): Promise<{
  response: string;
  suggestions: string[];
  analysis: {
    status: string;
    timestamp: string;
  };
  data: {
    cash_flows: typeof mockCashFlows;
    assets: typeof mockAssets;
  };
}> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const responses = [
    `あなたの質問「${prompt}」について分析しました。現在の資産状況は良好ですが、いくつか改善点があります。`,
    `「${prompt}」に関して、現在の収支状況を確認しました。月収50万円に対して支出が適切に管理されています。`,
    `「${prompt}」についてアドバイスします。投資ポートフォリオのバランスを見直すことをお勧めします。`
  ];
  
  return {
    response: responses[Math.floor(Math.random() * responses.length)],
    suggestions: mockFinancialAdvice.slice(0, 3),
    analysis: {
      status: 'completed',
      timestamp: new Date().toISOString(),
    },
    data: {
      cash_flows: mockCashFlows,
      assets: mockAssets
    }
  };
}

// Mock usage counter
let mockUsageCount = 0;

// POST /simulate endpoint
app.post('/simulate', async (c) => {
  try {
    // Validate JWT (mock)
    const authHeader = c.req.header('Authorization');
    const user = await validateJWT(authHeader);

    // Parse and validate request body
    const body = await c.req.json();
    const validatedData = simulateRequestSchema.parse(body);

    // Check mock usage count
    if (mockUsageCount >= 3) {
      return c.json({ code: 'PAYWALL' }, 402);
    }

    // Increment mock usage count
    mockUsageCount++;

    // Call mock Mastra agent
    const agentResponse = await callMastraAgent(validatedData.prompt);

    return c.json({
      ...agentResponse,
      usage: {
        count: mockUsageCount,
        limit: 3,
        remaining: 3 - mockUsageCount
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid request data', details: error.errors }, 400);
    }
    
    if (error instanceof Error && error.message.includes('authorization')) {
      return c.json({ error: error.message }, 401);
    }

    console.error('Simulate endpoint error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Mock reset usage endpoint
app.post('/reset-usage', async (c) => {
  mockUsageCount = 0;
  return c.json({ 
    message: 'Usage count reset',
    usage: {
      count: mockUsageCount,
      limit: 3,
      remaining: 3 - mockUsageCount
    }
  });
});

// Mock Stripe webhook handler
app.post('/webhook/stripe', async (c) => {
  try {
    const body = await c.req.text();
    const event = JSON.parse(body);

    switch (event.type) {
      case 'payment_intent.succeeded':
        mockUsageCount = 0;
        console.log('Payment successful - usage count reset');
        break;
      
      case 'payment_intent.payment_failed':
        console.log('Payment failed');
        break;
      
      default:
        console.log('Unhandled event type:', event.type);
    }

    return c.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;