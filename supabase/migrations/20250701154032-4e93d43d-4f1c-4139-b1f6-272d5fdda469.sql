
-- Add mobile number fields to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN mobile_number TEXT,
ADD COLUMN mobile_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN mobile_verification_code TEXT,
ADD COLUMN mobile_verification_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index for verification lookups
CREATE INDEX idx_profiles_mobile_verification ON public.profiles(mobile_verification_code) WHERE mobile_verification_code IS NOT NULL;
