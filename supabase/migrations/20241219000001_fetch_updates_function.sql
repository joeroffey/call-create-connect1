
-- Create a function to fetch building regulations updates
CREATE OR REPLACE FUNCTION public.fetch_building_regs_updates()
RETURNS TABLE (
  id UUID,
  update_date TIMESTAMPTZ,
  pages_crawled INTEGER,
  chunks_processed INTEGER,
  vectors_created INTEGER,
  status TEXT,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bru.id,
    bru.update_date,
    bru.pages_crawled,
    bru.chunks_processed,
    bru.vectors_created,
    bru.status,
    bru.error_message
  FROM public.building_regs_updates bru
  ORDER BY bru.update_date DESC
  LIMIT 10;
END;
$$;
