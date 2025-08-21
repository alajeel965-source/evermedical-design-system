-- Add username field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username TEXT UNIQUE;

-- Create index for username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Create function to validate username format
CREATE OR REPLACE FUNCTION public.validate_username(username_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  -- Username must be 3-30 characters, alphanumeric + underscore, no spaces
  RETURN username_input ~ '^[a-zA-Z0-9_]{3,30}$' AND username_input NOT LIKE '%__%';
END;
$$;

-- Add constraint to ensure username follows format rules
ALTER TABLE public.profiles 
ADD CONSTRAINT check_username_format 
CHECK (username IS NULL OR validate_username(username));

-- Update sync trigger to include username in public_profiles
CREATE OR REPLACE FUNCTION public.sync_public_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Handle INSERT/UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.public_profiles (
      id, user_id, first_name, last_name, username, avatar_url, title, 
      specialty, primary_specialty_slug, organization, country, 
      profile_type, verified, created_at
    ) VALUES (
      NEW.id, NEW.user_id, NEW.first_name, NEW.last_name, NEW.username, NEW.avatar_url, NEW.title,
      NEW.specialty, NEW.primary_specialty_slug, NEW.organization, NEW.country,
      NEW.profile_type, NEW.verified, NEW.created_at
    )
    ON CONFLICT (id) DO UPDATE SET
      user_id = NEW.user_id,
      first_name = NEW.first_name,
      last_name = NEW.last_name,
      username = NEW.username,
      avatar_url = NEW.avatar_url,
      title = NEW.title,
      specialty = NEW.specialty,
      primary_specialty_slug = NEW.primary_specialty_slug,
      organization = NEW.organization,
      country = NEW.country,
      profile_type = NEW.profile_type,
      verified = NEW.verified,
      created_at = NEW.created_at;
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.public_profiles WHERE id = OLD.id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Add username column to public_profiles table
ALTER TABLE public.public_profiles 
ADD COLUMN username TEXT;

-- Create function to get profile by username
CREATE OR REPLACE FUNCTION public.get_profile_by_username(username_input TEXT)
RETURNS SETOF public_profiles
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.public_profiles 
  WHERE username = username_input AND verified = true
  LIMIT 1;
$$;

-- Create function to check username availability
CREATE OR REPLACE FUNCTION public.is_username_available(username_input TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE username = username_input
  );
$$;