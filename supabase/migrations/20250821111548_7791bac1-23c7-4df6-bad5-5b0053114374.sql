-- Secure product_categories table by requiring authentication

-- Drop the existing public access policy that exposes business intelligence
DROP POLICY IF EXISTS "Product categories are publicly viewable" ON public.product_categories;

-- Create new policy requiring authentication to protect business data
CREATE POLICY "Authenticated users can view product categories" 
ON public.product_categories 
FOR SELECT 
TO authenticated
USING (true);

-- Add additional policy for verified users only (optional enhanced security)
CREATE POLICY "Verified users can view all categories" 
ON public.product_categories 
FOR SELECT 
TO authenticated
USING (
    auth.uid() IN (
        SELECT user_id FROM public.profiles 
        WHERE verified = true
    )
);

-- Remove the basic authenticated policy and keep only verified user access
DROP POLICY IF EXISTS "Authenticated users can view product categories" ON public.product_categories;

-- Log this security enhancement
INSERT INTO public.security_audit_log (
    table_name, 
    operation, 
    user_id, 
    timestamp, 
    details
) VALUES (
    'product_categories',
    'SECURITY_ENHANCEMENT', 
    auth.uid(),
    NOW(),
    jsonb_build_object(
        'action', 'Restricted public access to product categories',
        'reason', 'Prevent competitor access to business intelligence',
        'new_policy', 'Verified users only'
    )
);