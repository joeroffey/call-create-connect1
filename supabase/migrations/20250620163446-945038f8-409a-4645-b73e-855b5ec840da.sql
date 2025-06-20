
-- Add pinned column to projects table
ALTER TABLE public.projects 
ADD COLUMN pinned boolean NOT NULL DEFAULT false;
