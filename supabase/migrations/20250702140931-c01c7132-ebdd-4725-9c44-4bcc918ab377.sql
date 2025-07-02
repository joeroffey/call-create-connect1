-- Add assigned_to column to project_schedule_of_works table
ALTER TABLE public.project_schedule_of_works 
ADD COLUMN assigned_to UUID REFERENCES auth.users(id);