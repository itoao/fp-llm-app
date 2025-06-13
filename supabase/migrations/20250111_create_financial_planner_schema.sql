-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    usage_count INT NOT NULL DEFAULT 0
);

-- Create cash_flows table
CREATE TABLE cash_flows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trans_date DATE NOT NULL,
    category TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL, -- positive=income, negative=expense
    currency TEXT NOT NULL DEFAULT 'JPY',
    memo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    asset_type TEXT NOT NULL,
    name TEXT NOT NULL,
    balance NUMERIC(15,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'JPY',
    valuation_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create billing_logs table
CREATE TABLE billing_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('free_call', 'billed_call', 'payment', 'refund')),
    tokens_used INT,
    amount NUMERIC(15,2),
    currency TEXT NOT NULL DEFAULT 'JPY',
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_cash_flows_user_id ON cash_flows(user_id);
CREATE INDEX idx_cash_flows_trans_date ON cash_flows(trans_date);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_assets_valuation_date ON assets(valuation_date);
CREATE INDEX idx_billing_logs_user_id ON billing_logs(user_id);
CREATE INDEX idx_billing_logs_session_id ON billing_logs(session_id);
CREATE INDEX idx_billing_logs_occurred_at ON billing_logs(occurred_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for sessions table
CREATE POLICY "Users can view own sessions" ON sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for cash_flows table
CREATE POLICY "Users can view own cash flows" ON cash_flows
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cash flows" ON cash_flows
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cash flows" ON cash_flows
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cash flows" ON cash_flows
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for assets table
CREATE POLICY "Users can view own assets" ON assets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets" ON assets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets" ON assets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets" ON assets
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for billing_logs table
CREATE POLICY "Users can view own billing logs" ON billing_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Only system can insert billing logs (no user INSERT policy)

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON sessions TO authenticated;
GRANT ALL ON cash_flows TO authenticated;
GRANT ALL ON assets TO authenticated;
GRANT SELECT ON billing_logs TO authenticated;

-- Grant permissions to service role for billing operations
GRANT ALL ON billing_logs TO service_role;