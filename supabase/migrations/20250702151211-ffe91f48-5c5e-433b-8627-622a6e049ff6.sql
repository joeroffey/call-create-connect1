-- Add customer details fields to projects table
ALTER TABLE public.projects 
ADD COLUMN customer_name text,
ADD COLUMN customer_address text,
ADD COLUMN customer_phone text;