-- Clean up existing team logo files and recreate bucket
DELETE FROM storage.objects WHERE bucket_id = 'team-logos';
DELETE FROM storage.buckets WHERE id = 'team-logos';
INSERT INTO storage.buckets (id, name, public) 
VALUES ('team-logos', 'team-logos', true);

-- Create storage policies for team logos
CREATE POLICY "Anyone can view team logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'team-logos');

CREATE POLICY "Authenticated users can upload team logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'team-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update team logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'team-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete team logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'team-logos' AND auth.uid() IS NOT NULL);