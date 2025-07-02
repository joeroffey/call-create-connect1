-- Add logo_url column to teams table for team logo upload functionality
ALTER TABLE public.teams 
ADD COLUMN logo_url TEXT;

-- Create storage bucket for team logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('team-logos', 'team-logos', true);

-- Create storage policies for team logo uploads
CREATE POLICY "Team owners can upload team logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'team-logos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Team logos are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'team-logos');

CREATE POLICY "Team owners can update team logos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'team-logos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Team owners can delete team logos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'team-logos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);