-- Fix the specific policy conflict by dropping existing policies first
DROP POLICY IF EXISTS "Public profile information is viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;  
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create the corrected policies  
CREATE POLICY "Public profile information is viewable" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() <> user_id AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);