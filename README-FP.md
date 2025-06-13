# Financial Planner LLM Application

## Database Setup

### Running Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually via SQL editor in Supabase Dashboard
# Copy contents of supabase/migrations/20250111_create_financial_planner_schema.sql
```

### Seeding Demo Data

Create a demo user with three free calls:

```sql
-- Insert demo user
INSERT INTO users (email, name)
VALUES ('demo@example.com', 'Demo User')
RETURNING id;

-- Note the returned user ID and use it below
-- Example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

-- Create an active session for the demo user
INSERT INTO sessions (user_id, expires_at, token_hash, usage_count)
VALUES (
  'YOUR_USER_ID_HERE',
  NOW() + INTERVAL '30 days',
  'demo_token_hash_' || gen_random_uuid(),
  0
);

-- Add some sample cash flows
INSERT INTO cash_flows (user_id, trans_date, category, amount, memo)
VALUES 
  ('YOUR_USER_ID_HERE', CURRENT_DATE, 'Salary', 5000.00, 'Monthly salary'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '1 day', 'Food', -50.00, 'Lunch'),
  ('YOUR_USER_ID_HERE', CURRENT_DATE - INTERVAL '2 days', 'Transport', -20.00, 'Train fare');

-- Add some sample assets
INSERT INTO assets (user_id, asset_type, name, balance, valuation_date)
VALUES 
  ('YOUR_USER_ID_HERE', 'Bank', 'Checking Account', 10000.00, CURRENT_DATE),
  ('YOUR_USER_ID_HERE', 'Investment', 'Stock Portfolio', 50000.00, CURRENT_DATE);
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

## API Endpoints

### POST /simulate
Simulates financial planning advice using the Mastra agent.

**Headers:**
- `Authorization: Bearer YOUR_JWT_TOKEN`

**Request Body:**
```json
{
  "prompt": "Help me plan my monthly budget",
  "context": {
    "cash_flows": [],
    "assets": []
  }
}
```

**Response (Success):**
```json
{
  "response": "Processing prompt: Help me plan my monthly budget",
  "suggestions": ["Track your expenses", "Review your budget", "Plan for retirement"],
  "analysis": {
    "status": "placeholder",
    "timestamp": "2025-01-11T10:00:00.000Z"
  }
}
```

**Response (Paywall - 402):**
```json
{
  "code": "PAYWALL"
}
```

### POST /webhook/stripe
Handles Stripe webhook events for payment processing.

## Usage Limits

- Free tier: 3 calls per session
- After 3 calls, users hit the paywall
- Successful payment resets the usage counter

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **API**: Hono (Edge Functions)
- **Database**: Supabase (PostgreSQL + RLS)
- **AI**: Mastra Agent Framework
- **Payments**: Stripe
- **Types**: Zod + TypeScript