-- ========================================
-- ADMIN SCHEMA + RBAC MIGRATION (Fixed)
-- Add username/password auth for admins with role-based access control
-- ========================================

-- 1. Create role enum if not exists (extending profile_type)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM (
            'medical_personnel', 
            'organizer', 
            'hospital_admin', 
            'super_admin',
            'admin',
            'personnel',
            'institute', 
            'seller',
            'buyer'
        );
    END IF;
END $$;

-- 2. Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS role user_role;

-- 3. Create unique case-insensitive index on username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_ci 
ON public.profiles (LOWER(username));

-- 4. Add constraints for username (using DO block for conditional constraint creation)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_username_length' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_username_length 
        CHECK (username IS NULL OR (LENGTH(username) BETWEEN 3 AND 32));
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_username_format' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_username_format 
        CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]+$');
    END IF;
END $$;

-- 5. Migrate existing profile_type to role column
UPDATE public.profiles 
SET role = profile_type::user_role 
WHERE role IS NULL AND profile_type IS NOT NULL;

-- 6. Create admin_audit table for logging administrative actions
CREATE TABLE IF NOT EXISTS public.admin_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor UUID NOT NULL, -- The admin performing the action
    action TEXT NOT NULL, -- Description of the action
    target UUID, -- The user being acted upon (nullable for system actions)
    metadata JSONB DEFAULT '{}', -- Additional context
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin_audit
ALTER TABLE public.admin_audit ENABLE ROW LEVEL SECURITY;

-- 7. Create helper functions for role checking
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND role = 'super_admin' 
        AND verified = true
    );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.profiles 
    WHERE user_id = auth.uid() 
    LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.can_manage_users()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND role IN ('super_admin', 'admin')
        AND verified = true
    );
$$;

-- 8. Password validation function
CREATE OR REPLACE FUNCTION public.validate_admin_password(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Minimum 12 characters, 1 number, 1 symbol
    RETURN (
        LENGTH(password) >= 12 AND
        password ~ '[0-9]' AND
        password ~ '[^a-zA-Z0-9]'
    );
END;
$$;

-- 9. Username availability check function
CREATE OR REPLACE FUNCTION public.is_username_available(check_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
    SELECT NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE LOWER(username) = LOWER(check_username)
    );
$$;

-- 10. Drop existing conflicting policies
DROP POLICY IF EXISTS "Enhanced users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Enhanced users can update own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Enhanced users can insert own profile only" ON public.profiles;

-- 11. Create new comprehensive RLS policies for profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.is_super_admin());

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own non-privileged fields" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
    auth.uid() = user_id AND
    -- Prevent users from changing their own role, username, or password_hash
    (role IS NOT DISTINCT FROM OLD.role) AND
    (username IS NOT DISTINCT FROM OLD.username) AND
    (password_hash IS NOT DISTINCT FROM OLD.password_hash)
);

CREATE POLICY "Super admins can update any profile" 
ON public.profiles FOR UPDATE 
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can delete profiles" 
ON public.profiles FOR DELETE 
USING (public.is_super_admin());

-- 12. RLS policies for admin_audit table
CREATE POLICY "Super admins can view all audit logs" 
ON public.admin_audit FOR SELECT 
USING (public.is_super_admin());

CREATE POLICY "Admins can view recent audit logs" 
ON public.admin_audit FOR SELECT 
USING (
    public.can_manage_users() AND 
    created_at >= NOW() - INTERVAL '30 days'
);

CREATE POLICY "System can insert audit logs" 
ON public.admin_audit FOR INSERT 
WITH CHECK (
    actor = auth.uid() AND
    auth.uid() IS NOT NULL
);

-- Block updates and deletes on audit logs
CREATE POLICY "Block audit log modifications" 
ON public.admin_audit FOR UPDATE 
USING (false);

CREATE POLICY "Block audit log deletions" 
ON public.admin_audit FOR DELETE 
USING (false);

-- 13. Audit trigger function for profile changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only log changes made by admins to other users
    IF auth.uid() != NEW.user_id AND public.can_manage_users() THEN
        INSERT INTO public.admin_audit (actor, action, target, metadata)
        VALUES (
            auth.uid(),
            TG_OP || '_PROFILE',
            NEW.user_id,
            jsonb_build_object(
                'old_role', OLD.role,
                'new_role', NEW.role,
                'username_changed', (OLD.username IS DISTINCT FROM NEW.username),
                'password_changed', (OLD.password_hash IS DISTINCT FROM NEW.password_hash)
            )
        );
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger for profile audit logging
DROP TRIGGER IF EXISTS profile_changes_audit ON public.profiles;
CREATE TRIGGER profile_changes_audit
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.audit_profile_changes();

-- 14. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON public.profiles(verified);
CREATE INDEX IF NOT EXISTS idx_admin_audit_actor ON public.admin_audit(actor);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target ON public.admin_audit(target);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON public.admin_audit(created_at);