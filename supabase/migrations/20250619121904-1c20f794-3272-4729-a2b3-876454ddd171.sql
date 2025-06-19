
-- Add missing INSERT policy for subscriptions table
CREATE POLICY "Users can create their own subscription" 
  ON public.subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
