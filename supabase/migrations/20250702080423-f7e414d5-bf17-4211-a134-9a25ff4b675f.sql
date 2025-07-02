-- Create proper storage policies for team logos
-- First, remove any existing policies
DROP POLICY IF EXISTS "Team logo access policy" ON storage.objects;
DROP POLICY IF EXISTS "Team logo upload policy" ON storage.objects;
DROP POLICY IF EXISTS "Team logo update policy" ON storage.objects;
DROP POLICY IF EXISTS "Team logo delete policy" ON storage.objects;

-- Create comprehensive policies for team-logos bucket
CREATE POLICY "Team logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'team-logos');

CREATE POLICY "Team owners and admins can upload logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'team-logos' AND 
  EXISTS (
    SELECT 1 FROM public.teams t
    JOIN public.team_members tm ON t.id = tm.team_id
    WHERE (t.owner_id = auth.uid() OR (tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')))
    AND name LIKE '%' || t.id || '%'
  )
);

CREATE POLICY "Team owners and admins can update logos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'team-logos' AND 
  EXISTS (
    SELECT 1 FROM public.teams t
    JOIN public.team_members tm ON t.id = tm.team_id
    WHERE (t.owner_id = auth.uid() OR (tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')))
    AND name LIKE '%' || t.id || '%'
  )
);

CREATE POLICY "Team owners and admins can delete logos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'team-logos' AND 
  EXISTS (
    SELECT 1 FROM public.teams t
    JOIN public.team_members tm ON t.id = tm.team_id
    WHERE (t.owner_id = auth.uid() OR (tm.user_id = auth.uid() AND tm.role IN ('owner', 'admin')))
    AND name LIKE '%' || t.id || '%'
  )
);