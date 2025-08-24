import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BootstrapRequest {
  fullName: string;
  email: string;
  username: string;
  password: string;
  botProtection: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { fullName, email, username, password, botProtection }: BootstrapRequest = await req.json();

    console.log('Bootstrap request received for email:', email);

    // Basic bot protection (simple challenge)
    if (botProtection !== 'human') {
      return new Response(
        JSON.stringify({ error: 'Bot protection failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    if (!fullName || !email || !username || !password) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if super admin already exists
    const { count: superAdminCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'super_admin');

    if (superAdminCount && superAdminCount > 0) {
      return new Response(
        JSON.stringify({ error: 'Super admin already exists' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate password strength (12+ chars, 1 number, 1 symbol)
    const passwordRegex = /^(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{12,}$/;
    if (!passwordRegex.test(password)) {
      return new Response(
        JSON.stringify({ 
          error: 'Password must be at least 12 characters with 1 number and 1 special character' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if username is available
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('username')
      .ilike('username', username)
      .single();

    if (existingUsername) {
      return new Response(
        JSON.stringify({ error: 'Username already taken' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if email is already registered
    const { data: existingEmail } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    if (existingEmail) {
      return new Response(
        JSON.stringify({ error: 'Email already registered' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Hash password using bcrypt
    const bcrypt = await import('https://deno.land/x/bcrypt@v0.4.1/mod.ts');
    const passwordHash = await bcrypt.hash(password);

    // Split full name
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Create Supabase auth user (this will require email verification)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: false, // Require email verification
      user_metadata: {
        full_name: fullName,
        first_name: firstName,
        last_name: lastName,
        username: username,
        is_super_admin: true
      }
    });

    if (authError || !authUser.user) {
      console.error('Auth user creation failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Failed to create user account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create profile with super_admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authUser.user.id,
        email: email.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        username: username,
        password_hash: passwordHash,
        role: 'super_admin',
        profile_type: 'admin',
        verified: true,
        organization: 'EverMedical Administration'
      });

    if (profileError) {
      console.error('Profile creation failed:', profileError);
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return new Response(
        JSON.stringify({ error: 'Failed to create user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the bootstrap action in audit trail
    const { error: auditError } = await supabase
      .from('admin_audit')
      .insert({
        actor: authUser.user.id,
        action: 'BOOTSTRAP_SUPER_ADMIN',
        target: authUser.user.id,
        metadata: {
          username: username,
          email: email.toLowerCase(),
          created_via: 'bootstrap_onboarding',
          ip_address: req.headers.get('x-forwarded-for') || 'unknown',
          user_agent: req.headers.get('user-agent') || 'unknown'
        }
      });

    if (auditError) {
      console.error('Audit log creation failed:', auditError);
      // Don't fail the request for audit logging issues
    }

    console.log('Super admin bootstrap successful for:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Super admin created successfully. Please check your email for verification.',
        userId: authUser.user.id
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Bootstrap function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});