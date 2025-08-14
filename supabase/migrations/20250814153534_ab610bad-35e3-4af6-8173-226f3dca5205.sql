-- Add subscription fields to profiles table for pricing plans
-- This enables connecting pricing plans with user signups

-- First, create enum for subscription plans
CREATE TYPE public.subscription_plan AS ENUM (
  'medical_institute_buyers',
  'medical_sellers_monthly', 
  'medical_sellers_yearly',
  'medical_personnel'
);

-- Add subscription fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_plan public.subscription_plan,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_start_date timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS subscription_end_date timestamptz,
ADD COLUMN IF NOT EXISTS subscription_price integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS subscription_currency text DEFAULT 'usd';

-- Update RLS policies to allow users to view their own subscription info
DROP POLICY IF EXISTS "Users can view their own subscription info" ON public.profiles;
CREATE POLICY "Users can view their own subscription info"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to update their own subscription info
DROP POLICY IF EXISTS "Users can update their own subscription info" ON public.profiles;
CREATE POLICY "Users can update their own subscription info"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to handle subscription signup
CREATE OR REPLACE FUNCTION public.handle_subscription_signup(
  user_email text,
  user_password text,
  user_name text,
  plan_type public.subscription_plan,
  plan_price integer DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- This function will be called from the frontend to handle subscription signups
  -- The actual user creation will happen in the frontend using Supabase Auth
  -- This function is for any additional subscription logic needed
  
  -- Return success response
  result := json_build_object(
    'success', true,
    'message', 'Subscription signup initialized'
  );
  
  RETURN result;
END;
$$;