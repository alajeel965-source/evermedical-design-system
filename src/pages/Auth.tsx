import { useState, useEffect } from "react";
import { AppShell } from "@/components/shared/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Building, ShoppingCart, Stethoscope, Heart, CheckCircle } from "lucide-react";

type SubscriptionPlan = 'medical_institute_buyers' | 'medical_sellers_monthly' | 'medical_sellers_yearly' | 'medical_personnel';

interface PlanInfo {
  title: string;
  price: string;
  period: string;
  icon: any;
  features: string[];
  dbValue: SubscriptionPlan;
  priceValue: number;
}

const plans: Record<string, PlanInfo> = {
  'free': {
    title: 'Medical Institute Buyers',
    price: 'Free',
    period: '',
    icon: Building,
    features: ['Browse suppliers', 'Post RFQs', 'Team management'],
    dbValue: 'medical_institute_buyers',
    priceValue: 0,
  },
  'sellers-monthly': {
    title: 'Medical Sellers',
    price: '$100',
    period: 'month',
    icon: ShoppingCart,
    features: ['List products', 'Generate leads', 'Analytics'],
    dbValue: 'medical_sellers_monthly',
    priceValue: 10000,
  },
  'sellers-yearly': {
    title: 'Medical Sellers',
    price: '$1,000',
    period: 'year',
    icon: ShoppingCart,
    features: ['List products', 'Generate leads', 'Analytics', 'Save $200/year'],
    dbValue: 'medical_sellers_yearly',
    priceValue: 100000,
  },
  'personnel': {
    title: 'Medical Personnel',
    price: '$100',
    period: 'year',
    icon: Stethoscope,
    features: ['CME events', 'Professional profile', 'Networking'],
    dbValue: 'medical_personnel',
    priceValue: 10000,
  },
};

export default function Auth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("signup");
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') || 'free';
  const planInfo = plans[selectedPlan];

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    organization: '',
    title: '',
    specialty: '',
    country: '',
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user && event === 'SIGNED_IN') {
        // Defer profile creation to avoid callback issues
        setTimeout(() => {
          createUserProfile(session.user, selectedPlan);
        }, 100);
      }
    });

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, selectedPlan]);

  const createUserProfile = async (user: User, plan: string) => {
    try {
      const planInfo = plans[plan];
      
      const { error } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          email: user.email!,
          first_name: formData.firstName || 'User',
          last_name: formData.lastName || 'Name',
          title: formData.title,
          specialty: formData.specialty,
          organization: formData.organization,
          country: formData.country,
          profile_type: planInfo?.dbValue === 'medical_institute_buyers' ? 'buyer' : 
                        planInfo?.dbValue.includes('sellers') ? 'seller' : 'medical_professional',
          subscription_plan: planInfo?.dbValue,
          subscription_price: planInfo?.priceValue || 0,
          subscription_status: 'active',
        });
      
      if (error) throw error;
      
      setSuccess('Account created successfully! Welcome to EverMedical.');
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
        }
      });

      if (error) throw error;
      
      setSuccess('Check your email for the confirmation link!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      navigate('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (user) {
    return (
      <AppShell>
        <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-surface flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
              <CardTitle>Welcome to EverMedical!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                You're successfully logged in. Redirecting you to the dashboard...
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-surface">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Heart className="h-4 w-4" />
                Join EverMedical
              </div>
              <h1 className="text-3xl font-bold text-heading mb-2">Create Your Account</h1>
              <p className="text-muted-foreground">
                Start your journey with EverMedical today
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Selected Plan Info */}
              <div className="bg-card/80 backdrop-blur-sm border rounded-3xl p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-heading mb-2">Selected Plan</h3>
                  {planInfo && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                          <planInfo.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{planInfo.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {planInfo.price}{planInfo.period && `/${planInfo.period}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {planInfo.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate('/pricing')}
                        className="w-full"
                      >
                        Change Plan
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Auth Form */}
              <Card className="bg-card/80 backdrop-blur-sm border">
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                      <TabsTrigger value="signin">Sign In</TabsTrigger>
                    </TabsList>

                    {error && (
                      <Alert className="mb-4 border-destructive/50 bg-destructive/10">
                        <AlertDescription className="text-destructive">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="mb-4 border-success/50 bg-success/10">
                        <AlertDescription className="text-success">
                          {success}
                        </AlertDescription>
                      </Alert>
                    )}

                    <TabsContent value="signup" className="space-y-4">
                      <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={(e) => handleInputChange('firstName', e.target.value)}
                              placeholder="John"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={(e) => handleInputChange('lastName', e.target.value)}
                              placeholder="Doe"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="john@example.com"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="organization">Organization</Label>
                            <Input
                              id="organization"
                              value={formData.organization}
                              onChange={(e) => handleInputChange('organization', e.target.value)}
                              placeholder="Hospital Name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              value={formData.title}
                              onChange={(e) => handleInputChange('title', e.target.value)}
                              placeholder="Doctor, Nurse, etc."
                            />
                          </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signin" className="space-y-4">
                      <form onSubmit={handleSignIn} className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="john@example.com"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? 'Signing In...' : 'Sign In'}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}