
-- Add has_used_trial column to subscribers table to track trial usage
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT false;
