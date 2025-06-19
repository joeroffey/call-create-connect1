
-- Create table to track building regulations updates
CREATE TABLE IF NOT EXISTS building_regs_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    update_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    pages_crawled INTEGER,
    chunks_processed INTEGER,
    vectors_created INTEGER,
    status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS building_regs_updates_update_date_idx ON building_regs_updates(update_date DESC);
CREATE INDEX IF NOT EXISTS building_regs_updates_status_idx ON building_regs_updates(status);

-- Enable Row Level Security
ALTER TABLE building_regs_updates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role access
CREATE POLICY "Service role can manage building_regs_updates" ON building_regs_updates
    FOR ALL USING (auth.role() = 'service_role');
