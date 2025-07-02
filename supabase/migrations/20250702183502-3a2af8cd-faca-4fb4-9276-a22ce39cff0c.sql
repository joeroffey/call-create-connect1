-- Check and fix team logo storage policies
-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Team owners can upload team logos" ON storage.objects;
DROP POLICY IF EXISTS "Team logos are publicly viewable" ON storage.objects;
DROP POLICY IF EXISTS "Team owners can update team logos" ON storage.objects;
DROP POLICY IF EXISTS "Team owners can delete team logos" ON storage.objects;
DROP POLICY IF EXISTS "Team logos are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Team owners and admins can upload logos" ON storage.objects;
DROP POLICY IF EXISTS "Team owners and admins can update logos" ON storage.objects;
DROP POLICY IF EXISTS "Team owners and admins can delete logos" ON storage.objects;

-- Create simple, permissive policies for team logos
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