-- Fix Security Definer View issue by removing problematic views

-- Drop the postgres-owned view that's causing the security issue
DROP VIEW IF EXISTS public.safe_public_profiles CASCADE;

-- Check for any other postgres-owned views that need to be addressed
SELECT 
    schemaname, 
    viewname, 
    viewowner,
    'View owned by postgres - security risk' as issue
FROM pg_views 
WHERE schemaname = 'public' 
AND viewowner = 'postgres';