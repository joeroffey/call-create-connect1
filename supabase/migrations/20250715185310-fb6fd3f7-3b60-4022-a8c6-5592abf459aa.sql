-- Create the missing search_documents function for React Native search
CREATE OR REPLACE FUNCTION public.search_documents(query text)
RETURNS TABLE(
  id uuid,
  title text,
  content text,
  file_path text,
  snippet text,
  url text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pd.id,
    pd.file_name as title,
    pd.file_name as content,
    pd.file_path,
    CASE 
      WHEN length(pd.file_name) > 100 THEN substring(pd.file_name from 1 for 100) || '...'
      ELSE pd.file_name
    END as snippet,
    pd.file_path as url,
    pd.created_at
  FROM public.project_documents pd
  WHERE 
    pd.file_name ILIKE '%' || query || '%' 
    OR pd.file_type ILIKE '%' || query || '%'
  ORDER BY pd.created_at DESC
  LIMIT 50;
END;
$$;