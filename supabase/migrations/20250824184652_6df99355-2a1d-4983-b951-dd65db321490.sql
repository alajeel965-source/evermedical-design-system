-- Fix search_path security warning for functions
-- All admin functions should have immutable search_path for security

-- Fix all functions to have proper search_path set
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

CREATE OR REPLACE FUNCTION public.validate_admin_password(password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
    RETURN (
        LENGTH(password) >= 12 AND
        password ~ '[0-9]' AND
        password ~ '[^a-zA-Z0-9]'
    );
END;
$$;

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

CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only log changes made by admins to other users for UPDATE operations
    IF TG_OP = 'UPDATE' AND auth.uid() != NEW.user_id AND public.can_manage_users() THEN
        INSERT INTO public.admin_audit (actor, action, target, metadata)
        VALUES (
            auth.uid(),
            'UPDATE_PROFILE',
            NEW.user_id,
            jsonb_build_object(
                'old_role', OLD.role,
                'new_role', NEW.role,
                'username_changed', (OLD.username IS DISTINCT FROM NEW.username),
                'password_changed', (OLD.password_hash IS DISTINCT FROM NEW.password_hash)
            )
        );
    END IF;
    
    -- Log INSERT operations by admins for other users
    IF TG_OP = 'INSERT' AND auth.uid() != NEW.user_id AND public.can_manage_users() THEN
        INSERT INTO public.admin_audit (actor, action, target, metadata)
        VALUES (
            auth.uid(),
            'CREATE_PROFILE',
            NEW.user_id,
            jsonb_build_object(
                'role', NEW.role,
                'username', NEW.username,
                'created_by_admin', true
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$;