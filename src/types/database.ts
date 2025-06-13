import { z } from 'zod';

// User Schema
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type User = z.infer<typeof userSchema>;

// Session Schema
export const sessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
  expires_at: z.string().datetime(),
  token_hash: z.string(),
  usage_count: z.number().int().min(0),
});

export type Session = z.infer<typeof sessionSchema>;

// CashFlow Schema
export const cashFlowSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  trans_date: z.string().date(),
  category: z.string(),
  amount: z.number(), // positive = income, negative = expense
  currency: z.string().default('JPY'),
  memo: z.string().nullable(),
  created_at: z.string().datetime(),
});

export type CashFlow = z.infer<typeof cashFlowSchema>;

// Asset Schema
export const assetSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  asset_type: z.string(),
  name: z.string(),
  balance: z.number(),
  currency: z.string().default('JPY'),
  valuation_date: z.string().date(),
  created_at: z.string().datetime(),
});

export type Asset = z.infer<typeof assetSchema>;

// BillingLog Schema
export const billingLogEventTypeSchema = z.enum(['free_call', 'billed_call', 'payment', 'refund']);

export const billingLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  session_id: z.string().uuid().nullable(),
  event_type: billingLogEventTypeSchema,
  tokens_used: z.number().int().nullable(),
  amount: z.number().nullable(),
  currency: z.string().default('JPY'),
  occurred_at: z.string().datetime(),
});

export type BillingLog = z.infer<typeof billingLogSchema>;
export type BillingLogEventType = z.infer<typeof billingLogEventTypeSchema>;

// Database Tables type mapping for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      sessions: {
        Row: Session;
        Insert: Omit<Session, 'id' | 'created_at' | 'usage_count'> & {
          id?: string;
          created_at?: string;
          usage_count?: number;
        };
        Update: Partial<Omit<Session, 'id' | 'user_id' | 'created_at'>>;
      };
      cash_flows: {
        Row: CashFlow;
        Insert: Omit<CashFlow, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<CashFlow, 'id' | 'user_id' | 'created_at'>>;
      };
      assets: {
        Row: Asset;
        Insert: Omit<Asset, 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Asset, 'id' | 'user_id' | 'created_at'>>;
      };
      billing_logs: {
        Row: BillingLog;
        Insert: Omit<BillingLog, 'id' | 'occurred_at'> & {
          id?: string;
          occurred_at?: string;
        };
        Update: Partial<Omit<BillingLog, 'id' | 'user_id' | 'occurred_at'>>;
      };
    };
  };
}