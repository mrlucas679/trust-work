-- Migration: Analytics System
-- Description: Create analytics tables, views, and functions for earnings, spending, and performance tracking
-- Date: 2025-11-04

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    CONSTRAINT valid_transaction_type CHECK (
        type IN (
            'earning',           -- Freelancer received payment
            'spending',          -- Client paid for service
            'withdrawal',        -- Freelancer withdrew funds
            'deposit',           -- Client deposited funds
            'refund',            -- Refund issued
            'platform_fee',      -- Platform commission
            'bonus',             -- Bonus payment
            'penalty'            -- Penalty deduction
        )
    ),
    
    CONSTRAINT valid_status CHECK (
        status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')
    ),
    
    CONSTRAINT positive_amount CHECK (amount >= 0)
);

-- =====================================================
-- PROJECT STATS TABLE (Aggregated Performance Data)
-- =====================================================

CREATE TABLE IF NOT EXISTS project_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'freelancer' or 'client'
    
    -- Time tracking
    time_estimated_hours DECIMAL(10, 2),
    time_actual_hours DECIMAL(10, 2),
    time_efficiency_percent DECIMAL(5, 2), -- actual/estimated * 100
    
    -- Quality metrics
    completion_rate DECIMAL(5, 2), -- 0-100
    on_time_delivery BOOLEAN,
    revision_count INTEGER DEFAULT 0,
    
    -- Ratings (1-5 scale)
    quality_rating DECIMAL(3, 2),
    communication_rating DECIMAL(3, 2),
    professionalism_rating DECIMAL(3, 2),
    overall_rating DECIMAL(3, 2),
    
    -- Dates
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_role CHECK (role IN ('freelancer', 'client')),
    CONSTRAINT valid_ratings CHECK (
        (quality_rating IS NULL OR (quality_rating >= 1 AND quality_rating <= 5)) AND
        (communication_rating IS NULL OR (communication_rating >= 1 AND communication_rating <= 5)) AND
        (professionalism_rating IS NULL OR (professionalism_rating >= 1 AND professionalism_rating <= 5)) AND
        (overall_rating IS NULL OR (overall_rating >= 1 AND overall_rating <= 5))
    )
);

-- =====================================================
-- ANALYTICS SUMMARY TABLE (Cached Aggregations)
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    period_type VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Earnings/Spending
    total_earnings DECIMAL(10, 2) DEFAULT 0,
    total_spending DECIMAL(10, 2) DEFAULT 0,
    platform_fees DECIMAL(10, 2) DEFAULT 0,
    net_amount DECIMAL(10, 2) DEFAULT 0,
    
    -- Project counts
    projects_completed INTEGER DEFAULT 0,
    projects_active INTEGER DEFAULT 0,
    projects_cancelled INTEGER DEFAULT 0,
    
    -- Performance metrics
    avg_completion_rate DECIMAL(5, 2),
    avg_rating DECIMAL(3, 2),
    total_hours_worked DECIMAL(10, 2),
    
    -- Metadata
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_period_type CHECK (
        period_type IN ('daily', 'weekly', 'monthly', 'yearly')
    ),
    CONSTRAINT unique_user_period UNIQUE (user_id, period_type, period_start)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_created 
    ON transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_type 
    ON transactions(user_id, type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_status 
    ON transactions(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_assignment 
    ON transactions(assignment_id);

CREATE INDEX IF NOT EXISTS idx_transactions_completed 
    ON transactions(completed_at DESC) WHERE completed_at IS NOT NULL;

-- Project stats indexes
CREATE INDEX IF NOT EXISTS idx_project_stats_user 
    ON project_stats(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_project_stats_assignment 
    ON project_stats(assignment_id);

CREATE INDEX IF NOT EXISTS idx_project_stats_role 
    ON project_stats(role, user_id);

CREATE INDEX IF NOT EXISTS idx_project_stats_completed 
    ON project_stats(completed_at DESC) WHERE completed_at IS NOT NULL;

-- Analytics summary indexes
CREATE INDEX IF NOT EXISTS idx_analytics_summary_user_period 
    ON analytics_summary(user_id, period_type, period_start DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_summary_period 
    ON analytics_summary(period_type, period_start DESC);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Earnings overview for freelancers
CREATE OR REPLACE VIEW v_freelancer_earnings AS
SELECT 
    t.user_id,
    DATE_TRUNC('month', t.created_at) AS month,
    COUNT(*) AS transaction_count,
    SUM(CASE WHEN t.type = 'earning' THEN t.amount ELSE 0 END) AS total_earnings,
    SUM(CASE WHEN t.type = 'platform_fee' THEN t.amount ELSE 0 END) AS total_fees,
    SUM(CASE WHEN t.type = 'earning' THEN t.amount ELSE 0 END) - 
    SUM(CASE WHEN t.type = 'platform_fee' THEN t.amount ELSE 0 END) AS net_earnings,
    AVG(CASE WHEN t.type = 'earning' THEN t.amount ELSE NULL END) AS avg_earning_per_project
FROM transactions t
WHERE t.status = 'completed'
    AND t.type IN ('earning', 'platform_fee')
GROUP BY t.user_id, DATE_TRUNC('month', t.created_at);

-- Spending overview for clients
CREATE OR REPLACE VIEW v_client_spending AS
SELECT 
    t.user_id,
    DATE_TRUNC('month', t.created_at) AS month,
    COUNT(*) AS transaction_count,
    SUM(CASE WHEN t.type = 'spending' THEN t.amount ELSE 0 END) AS total_spending,
    SUM(CASE WHEN t.type = 'platform_fee' THEN t.amount ELSE 0 END) AS total_fees,
    AVG(CASE WHEN t.type = 'spending' THEN t.amount ELSE NULL END) AS avg_spending_per_project
FROM transactions t
WHERE t.status = 'completed'
    AND t.type IN ('spending', 'platform_fee')
GROUP BY t.user_id, DATE_TRUNC('month', t.created_at);

-- Performance metrics view
CREATE OR REPLACE VIEW v_performance_metrics AS
SELECT 
    ps.user_id,
    ps.role,
    COUNT(*) AS total_projects,
    AVG(ps.completion_rate) AS avg_completion_rate,
    AVG(ps.overall_rating) AS avg_rating,
    SUM(ps.time_actual_hours) AS total_hours,
    AVG(ps.time_efficiency_percent) AS avg_efficiency,
    COUNT(*) FILTER (WHERE ps.on_time_delivery = true) AS on_time_count,
    COUNT(*) FILTER (WHERE ps.on_time_delivery = true)::DECIMAL / 
        NULLIF(COUNT(*), 0) * 100 AS on_time_percentage
FROM project_stats ps
WHERE ps.completed_at IS NOT NULL
GROUP BY ps.user_id, ps.role;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Get earnings summary for a user within date range
CREATE OR REPLACE FUNCTION get_earnings_summary(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_earnings DECIMAL,
    total_fees DECIMAL,
    net_earnings DECIMAL,
    transaction_count BIGINT,
    avg_per_transaction DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN t.type = 'earning' THEN t.amount ELSE 0 END), 0) AS total_earnings,
        COALESCE(SUM(CASE WHEN t.type = 'platform_fee' THEN t.amount ELSE 0 END), 0) AS total_fees,
        COALESCE(SUM(CASE WHEN t.type = 'earning' THEN t.amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN t.type = 'platform_fee' THEN t.amount ELSE 0 END), 0) AS net_earnings,
        COUNT(*) FILTER (WHERE t.type = 'earning') AS transaction_count,
        AVG(t.amount) FILTER (WHERE t.type = 'earning') AS avg_per_transaction
    FROM transactions t
    WHERE t.user_id = p_user_id
        AND t.status = 'completed'
        AND t.type IN ('earning', 'platform_fee')
        AND (p_start_date IS NULL OR t.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR t.created_at::DATE <= p_end_date);
END;
$$ LANGUAGE plpgsql STABLE;

-- Get spending summary for a user within date range
CREATE OR REPLACE FUNCTION get_spending_summary(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_spending DECIMAL,
    total_fees DECIMAL,
    transaction_count BIGINT,
    avg_per_transaction DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN t.type = 'spending' THEN t.amount ELSE 0 END), 0) AS total_spending,
        COALESCE(SUM(CASE WHEN t.type = 'platform_fee' THEN t.amount ELSE 0 END), 0) AS total_fees,
        COUNT(*) FILTER (WHERE t.type = 'spending') AS transaction_count,
        AVG(t.amount) FILTER (WHERE t.type = 'spending') AS avg_per_transaction
    FROM transactions t
    WHERE t.user_id = p_user_id
        AND t.status = 'completed'
        AND t.type IN ('spending', 'platform_fee')
        AND (p_start_date IS NULL OR t.created_at::DATE >= p_start_date)
        AND (p_end_date IS NULL OR t.created_at::DATE <= p_end_date);
END;
$$ LANGUAGE plpgsql STABLE;

-- Get project statistics for a user
CREATE OR REPLACE FUNCTION get_project_statistics(
    p_user_id UUID,
    p_role VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    total_projects BIGINT,
    completed_projects BIGINT,
    active_projects BIGINT,
    avg_rating DECIMAL,
    avg_completion_rate DECIMAL,
    total_hours DECIMAL,
    on_time_percentage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT AS total_projects,
        COUNT(*) FILTER (WHERE ps.completed_at IS NOT NULL)::BIGINT AS completed_projects,
        COUNT(*) FILTER (WHERE ps.completed_at IS NULL)::BIGINT AS active_projects,
        AVG(ps.overall_rating) AS avg_rating,
        AVG(ps.completion_rate) AS avg_completion_rate,
        COALESCE(SUM(ps.time_actual_hours), 0) AS total_hours,
        (COUNT(*) FILTER (WHERE ps.on_time_delivery = true)::DECIMAL / 
            NULLIF(COUNT(*) FILTER (WHERE ps.completed_at IS NOT NULL), 0) * 100) AS on_time_percentage
    FROM project_stats ps
    WHERE ps.user_id = p_user_id
        AND (p_role IS NULL OR ps.role = p_role);
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update analytics_summary when transactions are completed
CREATE OR REPLACE FUNCTION update_analytics_summary_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
    v_period_start DATE;
    v_period_end DATE;
BEGIN
    -- Only process completed transactions
    IF NEW.status = 'completed' THEN
        -- Calculate monthly period
        v_period_start := DATE_TRUNC('month', NEW.created_at)::DATE;
        v_period_end := (DATE_TRUNC('month', NEW.created_at) + INTERVAL '1 month - 1 day')::DATE;
        
        -- Insert or update monthly summary
        INSERT INTO analytics_summary (
            user_id,
            period_type,
            period_start,
            period_end,
            total_earnings,
            total_spending,
            platform_fees,
            net_amount,
            currency
        ) VALUES (
            NEW.user_id,
            'monthly',
            v_period_start,
            v_period_end,
            CASE WHEN NEW.type = 'earning' THEN NEW.amount ELSE 0 END,
            CASE WHEN NEW.type = 'spending' THEN NEW.amount ELSE 0 END,
            CASE WHEN NEW.type = 'platform_fee' THEN NEW.amount ELSE 0 END,
            CASE 
                WHEN NEW.type = 'earning' THEN NEW.amount
                WHEN NEW.type = 'spending' THEN -NEW.amount
                WHEN NEW.type = 'platform_fee' THEN -NEW.amount
                ELSE 0 
            END,
            NEW.currency
        )
        ON CONFLICT (user_id, period_type, period_start) 
        DO UPDATE SET
            total_earnings = analytics_summary.total_earnings + 
                CASE WHEN NEW.type = 'earning' THEN NEW.amount ELSE 0 END,
            total_spending = analytics_summary.total_spending + 
                CASE WHEN NEW.type = 'spending' THEN NEW.amount ELSE 0 END,
            platform_fees = analytics_summary.platform_fees + 
                CASE WHEN NEW.type = 'platform_fee' THEN NEW.amount ELSE 0 END,
            net_amount = analytics_summary.net_amount + 
                CASE 
                    WHEN NEW.type = 'earning' THEN NEW.amount
                    WHEN NEW.type = 'spending' THEN -NEW.amount
                    WHEN NEW.type = 'platform_fee' THEN -NEW.amount
                    ELSE 0 
                END,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_analytics_summary
    AFTER INSERT OR UPDATE OF status ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_summary_on_transaction();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_analytics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

CREATE TRIGGER tr_project_stats_updated_at
    BEFORE UPDATE ON project_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

CREATE TRIGGER tr_analytics_summary_updated_at
    BEFORE UPDATE ON analytics_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_analytics_timestamp();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
    ON transactions FOR UPDATE
    USING (auth.uid() = user_id);

-- Project stats policies
CREATE POLICY "Users can view their own project stats"
    ON project_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own project stats"
    ON project_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own project stats"
    ON project_stats FOR UPDATE
    USING (auth.uid() = user_id);

-- Analytics summary policies
CREATE POLICY "Users can view their own analytics"
    ON analytics_summary FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
    ON analytics_summary FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics"
    ON analytics_summary FOR UPDATE
    USING (auth.uid() = user_id);

-- =====================================================
-- SEED DATA (Optional - for testing)
-- =====================================================

COMMENT ON TABLE transactions IS 'Records all financial transactions for earnings, spending, withdrawals, etc.';
COMMENT ON TABLE project_stats IS 'Tracks performance metrics and statistics for completed projects';
COMMENT ON TABLE analytics_summary IS 'Cached aggregations of analytics data by time period';
COMMENT ON FUNCTION get_earnings_summary IS 'Get earnings summary for a user within optional date range';
COMMENT ON FUNCTION get_spending_summary IS 'Get spending summary for a user within optional date range';
COMMENT ON FUNCTION get_project_statistics IS 'Get project statistics and performance metrics for a user';
