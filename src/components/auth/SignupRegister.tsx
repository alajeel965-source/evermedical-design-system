import React, { useState, useEffect, useMemo } from 'react';
import { Eye, EyeOff, Apple, Linkedin, Globe, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { getCountriesByLanguage, type Country } from '@/lib/countries';

// Types
interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string; // This will store the country code
  countryName?: string; // For display purposes
  role: string;
  specialty: string;
  phone: string;
  agreeToTerms: boolean;
  inviteCode?: string;
}

interface RoleOption {
  key: string;
  name: string;
  subscription: {
    type: 'free' | 'yearly' | 'monthly' | 'internal';
    price?: number;
    period?: string;
  };
  requiresPayment: boolean;
  restricted?: boolean;
}

interface SignupRegisterProps {
  onSubmit?: (formData: FormData & { subscriptionPlan?: string; countryCode?: string }) => Promise<void>;
  onOAuth?: (provider: 'apple' | 'google' | 'linkedin') => Promise<void>;
  onSuccess?: (next: 'verifyEmail' | 'browseEvents' | 'completeProfile' | 'payment') => void;
  locale?: 'en' | 'ar';
  redirectUrls?: {
    verifyEmail?: string;
    browseEvents?: string;
    completeProfile?: string;
    payment?: string;
  };
  className?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

// Translations
const translations = {
  en: {
    signUp: 'Sign Up',
    signIn: 'Sign In',
    fullName: 'Full Name',
    email: 'Email Address',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    country: 'Country',
    selectCountry: 'Select your country',
    role: 'Role',
    specialty: 'Specialty',
    phone: 'Phone (Optional)',
    agreeToTerms: 'I agree to the Terms of Service and Privacy Policy',
    continueWith: 'Continue with',
    createAccount: 'Create Account',
    signInAccount: 'Sign In',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    forgotPassword: 'Forgot password?',
    passwordStrength: 'Password Strength',
    language: 'Language',
    search: 'Search',
    selectRole: 'Select your role',
    roles: {
      medicalPersonnel: 'Medical Personnel',
      instituteBuyer: 'Medical Institute Buyer',
      medicalSeller: 'Medical Seller',
      superAdmin: 'Super Admin'
    },
    subscriptions: {
      free: 'Free',
      yearly100: '$100/year',
      monthly100: '$100/month',
      yearly1000: '$1,000/year',
      internal: 'Internal use only'
    },
    inviteCode: 'Invite Code',
    inviteCodeRequired: 'Super Admin role requires an invite code',
    specialties: [
      'Cardiology', 'Dermatology', 'Emergency Medicine', 'Endocrinology',
      'Gastroenterology', 'Neurology', 'Oncology', 'Orthopedics',
      'Pediatrics', 'Psychiatry', 'Radiology', 'Surgery'
    ],
    success: {
      title: 'Welcome to EverMedical!',
      subtitle: 'Your account has been created successfully.',
      verifyEmail: 'Verify Email',
      browseEvents: 'Browse Events',
      completeProfile: 'Complete Profile'
    },
    errors: {
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      passwordMismatch: 'Passwords do not match',
      weakPassword: 'Password must be at least 8 characters with upper, lower, and number',
      termsRequired: 'You must agree to the terms to continue',
      invalidCountry: 'Please select a valid country'
    }
  },
  ar: {
    signUp: 'إنشاء حساب',
    signIn: 'تسجيل دخول',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    country: 'البلد',
    selectCountry: 'اختر بلدك',
    role: 'الدور',
    specialty: 'التخصص',
    phone: 'الهاتف (اختياري)',
    agreeToTerms: 'أوافق على شروط الخدمة وسياسة الخصوصية',
    continueWith: 'المتابعة باستخدام',
    createAccount: 'إنشاء حساب',
    signInAccount: 'تسجيل دخول',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    forgotPassword: 'نسيت كلمة المرور؟',
    passwordStrength: 'قوة كلمة المرور',
    language: 'اللغة',
    selectRole: 'اختر دورك',
    roles: {
      medicalPersonnel: 'الطاقم الطبي',
      instituteBuyer: 'مشتري المؤسسة الطبية',
      medicalSeller: 'بائع طبي',
      superAdmin: 'مدير عام'
    },
    subscriptions: {
      free: 'مجاني',
      yearly100: '100 دولار/سنة',
      monthly100: '100 دولار/شهر',
      yearly1000: '1000 دولار/سنة',
      internal: 'للاستخدام الداخلي فقط'
    },
    inviteCode: 'رمز الدعوة',
    inviteCodeRequired: 'دور المدير العام يتطلب رمز دعوة',
    specialties: [
      'أمراض القلب', 'الأمراض الجلدية', 'طب الطوارئ', 'الغدد الصماء',
      'أمراض الجهاز الهضمي', 'الأمراض العصبية', 'الأورام', 'العظام',
      'طب الأطفال', 'الطب النفسي', 'الأشعة', 'الجراحة'
    ],
    success: {
      title: 'مرحباً بك في EverMedical!',
      subtitle: 'تم إنشاء حسابك بنجاح.',
      verifyEmail: 'تحقق من البريد الإلكتروني',
      browseEvents: 'تصفح الفعاليات',
      completeProfile: 'إكمال الملف الشخصي'
    },
    errors: {
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      weakPassword: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل مع أحرف كبيرة وصغيرة ورقم',
      termsRequired: 'يجب الموافقة على الشروط للمتابعة',
      invalidCountry: 'يرجى اختيار بلد صحيح'
    }
  }
};

// Password strength checker
const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  
  return {
    score,
    label: score <= 2 ? 'weak' : score <= 3 ? 'medium' : 'strong',
    color: score <= 2 ? 'bg-destructive' : score <= 3 ? 'bg-warning' : 'bg-success'
  };
};

// Email validation
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const SignupRegister: React.FC<SignupRegisterProps> = ({
  onSubmit,
  onOAuth,
  onSuccess,
  locale = 'en',
  redirectUrls = {},
  className
}) => {
  const [currentLocale, setCurrentLocale] = useState<'en' | 'ar'>(locale);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    role: '',
    specialty: '',
    phone: '',
    agreeToTerms: false,
    inviteCode: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [success, setSuccess] = useState(false);
  const [specialtySearch, setSpecialtySearch] = useState('');
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  const t = translations[currentLocale];
  const isRTL = currentLocale === 'ar';

  // Get sorted countries for current language
  const sortedCountries = useMemo(() => {
    return getCountriesByLanguage(currentLocale);
  }, [currentLocale]);

  // Get country display name
  const getCountryDisplayName = (countryCode: string): string => {
    const country = sortedCountries.find(c => c.code === countryCode);
    return country ? (currentLocale === 'ar' ? country.name_ar : country.name_en) : '';
  };

  // Role options with subscription information
  const roleOptions: RoleOption[] = [
    {
      key: 'medicalPersonnel',
      name: t.roles.medicalPersonnel,
      subscription: { type: 'yearly', price: 100, period: 'year' },
      requiresPayment: true
    },
    {
      key: 'instituteBuyer',
      name: t.roles.instituteBuyer,
      subscription: { type: 'free' },
      requiresPayment: false
    },
    {
      key: 'medicalSeller',
      name: t.roles.medicalSeller,
      subscription: { type: 'yearly', price: 1000, period: 'year' },
      requiresPayment: true
    },
    {
      key: 'superAdmin',
      name: t.roles.superAdmin,
      subscription: { type: 'internal' },
      requiresPayment: false,
      restricted: true
    }
  ];

  const getSubscriptionDisplay = (option: RoleOption) => {
    switch (option.subscription.type) {
      case 'free':
        return t.subscriptions.free;
      case 'yearly':
        return option.subscription.price === 100 ? t.subscriptions.yearly100 : t.subscriptions.yearly1000;
      case 'internal':
        return t.subscriptions.internal;
      default:
        return '';
    }
  };

  // Validate form
  const validateForm = (data: FormData, isSignIn = false) => {
    const newErrors: ValidationErrors = {};

    if (!isSignIn) {
      if (!data.fullName.trim()) newErrors.fullName = t.errors.required;
      if (!data.country) newErrors.country = t.errors.required;
      if (!data.role) newErrors.role = t.errors.required;
      if (data.role === 'medicalPersonnel' && !data.specialty) newErrors.specialty = t.errors.required;
      if (data.role === 'superAdmin' && !data.inviteCode?.trim()) {
        newErrors.inviteCode = t.inviteCodeRequired;
      }
      if (!data.agreeToTerms) newErrors.agreeToTerms = t.errors.termsRequired;
      if (data.password !== data.confirmPassword) newErrors.confirmPassword = t.errors.passwordMismatch;
    }

    if (!data.email.trim()) newErrors.email = t.errors.required;
    else if (!isValidEmail(data.email)) newErrors.email = t.errors.invalidEmail;

    if (!data.password) newErrors.password = t.errors.required;
    else if (!isSignIn && getPasswordStrength(data.password).score < 3) {
      newErrors.password = t.errors.weakPassword;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSignIn = activeTab === 'signin';
    
    if (!validateForm(formData, isSignIn)) return;

    setIsLoading(true);
    try {
      // Analytics tracking
      if (!isSignIn && formData.role) {
        const selectedRole = roleOptions.find(r => r.key === formData.role);
        if (selectedRole) {
          // Track role selection
          console.log('Analytics: role_selected', {
            role: selectedRole.name,
            subscription_type: selectedRole.subscription.type,
            requires_payment: selectedRole.requiresPayment
          });
        }
      }

      // Placeholder API call
      if (isSignIn) {
        // POST /api/auth/login
        console.log('Login attempt:', { email: formData.email, password: formData.password });
      } else {
        // POST /api/auth/register
        const selectedRole = roleOptions.find(r => r.key === formData.role);
        const subscriptionPlan = selectedRole ? 
          `${selectedRole.subscription.type}_${selectedRole.subscription.price || 'free'}` : 'free';
        
        console.log('Registration attempt:', { ...formData, subscriptionPlan });
        
        if (onSubmit) {
          await onSubmit({ 
            ...formData, 
            subscriptionPlan,
            countryCode: formData.country 
          });
        }

        // Analytics tracking for country selection
        if (formData.country && formData.role) {
          console.log('Analytics: country_selected', {
            country_code: formData.country,
            country_name: getCountryDisplayName(formData.country),
            role: formData.role
          });
        }
      }
      
      if (!isSignIn) {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'apple' | 'google' | 'linkedin') => {
    setIsLoading(true);
    try {
      if (onOAuth) {
        await onOAuth(provider);
      }
      console.log(`OAuth ${provider} clicked`);
    } catch (error) {
      console.error('OAuth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessAction = (action: 'verifyEmail' | 'browseEvents' | 'completeProfile' | 'payment') => {
    if (onSuccess) {
      onSuccess(action);
    }
    console.log(`Success action: ${action}`);
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Show invite code field for Super Admin role
    if (field === 'role') {
      setShowInviteCode(value === 'superAdmin');
      if (value !== 'superAdmin') {
        setFormData(prev => ({ ...prev, inviteCode: '' }));
      }
    }

    // Update country name for display
    if (field === 'country') {
      setFormData(prev => ({ 
        ...prev, 
        countryName: getCountryDisplayName(value)
      }));
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const filteredSpecialties = t.specialties.filter(spec => 
    spec.toLowerCase().includes(specialtySearch.toLowerCase())
  );

  if (success) {
    return (
      <Card 
        className={cn(
          "w-full max-w-md mx-auto backdrop-blur-sm bg-card/80 border-border shadow-medical rounded-medical-md",
          isRTL && "text-right",
          className
        )}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <CardContent className="p-lg text-center space-y-lg">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-success" />
            </div>
          </div>
          <div className="space-y-md">
            <h3 className="text-heading font-semibold text-medical-xl">{t.success.title}</h3>
            <p className="text-body text-medical-base">{t.success.subtitle}</p>
          </div>
          <div className="space-y-sm">
            {(() => {
              const selectedRole = roleOptions.find(r => r.key === formData.role);
              const requiresPayment = selectedRole?.requiresPayment;
              
              if (requiresPayment) {
                return (
                  <>
                    <Button 
                      onClick={() => handleSuccessAction('payment')}
                      className="w-full"
                      data-analytics="auth-signup-payment"
                    >
                      Complete Payment Setup
                    </Button>
                    <div className="flex gap-sm">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleSuccessAction('verifyEmail')}
                        data-analytics="auth-signup-verify-email"
                      >
                        {t.success.verifyEmail}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleSuccessAction('browseEvents')}
                        data-analytics="auth-signup-browse-events"
                      >
                        {t.success.browseEvents}
                      </Button>
                    </div>
                  </>
                );
              }
              
              return (
                <>
                  <Button 
                    onClick={() => handleSuccessAction('verifyEmail')}
                    className="w-full"
                    data-analytics="auth-signup-verify-email"
                  >
                    {t.success.verifyEmail}
                  </Button>
                  <div className="flex gap-sm">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleSuccessAction('completeProfile')}
                      data-analytics="auth-signup-complete-profile"
                    >
                      {t.success.completeProfile}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleSuccessAction('browseEvents')}
                      data-analytics="auth-signup-browse-events"
                    >
                      {t.success.browseEvents}
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "w-full max-w-md mx-auto backdrop-blur-sm bg-card/80 border-border shadow-medical rounded-medical-md",
        isRTL && "text-right",
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <CardHeader className="p-lg pb-md">
        <div className="flex justify-between items-center">
          <CardTitle className="text-heading text-medical-2xl font-semibold">
            EverMedical
          </CardTitle>
          <div className="flex items-center gap-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentLocale(currentLocale === 'en' ? 'ar' : 'en')}
              className="h-auto p-xs"
              aria-label={t.language}
            >
              <Globe className="w-4 h-4" />
              <span className="text-medical-sm ml-xs">{currentLocale.toUpperCase()}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-lg pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-lg">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup" data-analytics="auth-tab-signup">
              {t.signUp}
            </TabsTrigger>
            <TabsTrigger value="signin" data-analytics="auth-tab-signin">
              {t.signIn}
            </TabsTrigger>
          </TabsList>

          {/* OAuth Buttons */}
          <div className="space-y-sm">
            <div className="grid grid-cols-3 gap-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOAuth('apple')}
                disabled={isLoading}
                className="flex items-center justify-center"
                data-analytics="auth-oauth-apple"
              >
                <Apple className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOAuth('google')}
                disabled={isLoading}
                className="flex items-center justify-center"
                data-analytics="auth-oauth-google"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOAuth('linkedin')}
                disabled={isLoading}
                className="flex items-center justify-center"
                data-analytics="auth-oauth-linkedin"
              >
                <Linkedin className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-medical-sm">
                <span className="bg-card px-md text-muted-foreground">or</span>
              </div>
            </div>
          </div>

          <TabsContent value="signup" className="space-y-lg">
            <form onSubmit={handleSubmit} className="space-y-lg">
              {/* Full Name */}
              <div className="space-y-xs">
                <Label htmlFor="fullName">{t.fullName} *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateFormData('fullName', e.target.value)}
                  className={cn(errors.fullName && "border-destructive")}
                  disabled={isLoading}
                  data-analytics="auth-field-name"
                />
                {errors.fullName && (
                  <p className="text-destructive text-medical-sm" role="alert">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-xs">
                <Label htmlFor="email">{t.email} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={cn(errors.email && "border-destructive")}
                  disabled={isLoading}
                  data-analytics="auth-field-email"
                />
                {errors.email && (
                  <p className="text-destructive text-medical-sm" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-xs">
                <Label htmlFor="password">{t.password} *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className={cn(errors.password && "border-destructive", "pr-10")}
                    disabled={isLoading}
                    data-analytics="auth-field-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formData.password && (
                  <div className="space-y-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-medical-sm text-muted-foreground">
                        {t.passwordStrength}
                      </span>
                      <Badge variant={passwordStrength.label === 'weak' ? 'destructive' : 
                                   passwordStrength.label === 'medium' ? 'secondary' : 'default'}>
                        {passwordStrength.label}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={cn("h-2 rounded-full transition-all", passwordStrength.color)}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-destructive text-medical-sm" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-xs">
                <Label htmlFor="confirmPassword">{t.confirmPassword} *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    className={cn(errors.confirmPassword && "border-destructive", "pr-10")}
                    disabled={isLoading}
                    data-analytics="auth-field-confirm-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-destructive text-medical-sm" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Country & Role */}
              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-xs">
                  <Label htmlFor="country">{t.country} *</Label>
                  <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={countryOpen}
                        className={cn(
                          "w-full justify-between",
                          !formData.country && "text-muted-foreground",
                          errors.country && "border-destructive"
                        )}
                        disabled={isLoading}
                        data-analytics="auth-field-country"
                      >
                        {formData.country ? getCountryDisplayName(formData.country) : t.selectCountry}
                        <Globe className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command className="w-full">
                        <CommandInput 
                          placeholder={`Search ${currentLocale === 'ar' ? 'بلد' : 'country'}...`}
                          className="h-9" 
                        />
                        <CommandList className="max-h-[200px] overflow-auto">
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {sortedCountries.map((country) => (
                              <CommandItem
                                key={country.code}
                                value={currentLocale === 'ar' ? country.name_ar : country.name_en}
                                onSelect={() => {
                                  updateFormData('country', country.code);
                                  setCountryOpen(false);
                                }}
                                className="cursor-pointer"
                              >
                                {currentLocale === 'ar' ? country.name_ar : country.name_en}
                                <span className="ml-auto text-xs text-muted-foreground">
                                  {country.code}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.country && (
                    <p className="text-destructive text-medical-sm" role="alert">
                      {errors.country}
                    </p>
                  )}
                </div>

                <div className="space-y-xs">
                  <Label htmlFor="role">{t.role} *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => updateFormData('role', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={cn(errors.role && "border-destructive")}>
                      <SelectValue placeholder={t.selectRole} />
                    </SelectTrigger>
                    <SelectContent className="z-50">
                      {roleOptions.map((option) => (
                        <SelectItem 
                          key={option.key} 
                          value={option.key}
                          disabled={option.restricted && !formData.inviteCode}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span>{option.name}</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              ({getSubscriptionDisplay(option)})
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-destructive text-medical-sm" role="alert">
                      {errors.role}
                    </p>
                  )}
                </div>
              </div>

              {/* Invite Code (if Super Admin) */}
              {showInviteCode && (
                <div className="space-y-xs">
                  <Label htmlFor="inviteCode">{t.inviteCode} *</Label>
                  <Input
                    id="inviteCode"
                    type="text"
                    value={formData.inviteCode || ''}
                    onChange={(e) => updateFormData('inviteCode', e.target.value)}
                    className={cn(errors.inviteCode && "border-destructive")}
                    disabled={isLoading}
                    placeholder="Enter your admin invite code"
                    data-analytics="auth-field-invite-code"
                  />
                  {errors.inviteCode && (
                    <p className="text-destructive text-medical-sm" role="alert">
                      {errors.inviteCode}
                    </p>
                  )}
                </div>
              )}

              {/* Specialty (if Medical Personnel) */}
              {formData.role === 'medicalPersonnel' && (
                <div className="space-y-xs">
                  <Label htmlFor="specialty">{t.specialty} *</Label>
                  <Select
                    value={formData.specialty}
                    onValueChange={(value) => updateFormData('specialty', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className={cn(errors.specialty && "border-destructive")}>
                      <SelectValue placeholder={t.specialty} />
                    </SelectTrigger>
                    <SelectContent>
                      {t.specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.specialty && (
                    <p className="text-destructive text-medical-sm" role="alert">
                      {errors.specialty}
                    </p>
                  )}
                </div>
              )}

              {/* Phone */}
              <div className="space-y-xs">
                <Label htmlFor="phone">{t.phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  disabled={isLoading}
                  dir={isRTL ? "ltr" : undefined}
                  data-analytics="auth-field-phone"
                />
              </div>

              {/* Terms Agreement */}
              <div className="space-y-xs">
                <div className="flex items-start space-x-2 rtl:space-x-reverse">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => updateFormData('agreeToTerms', checked)}
                    disabled={isLoading}
                    className={cn(errors.agreeToTerms && "border-destructive")}
                    data-analytics="auth-field-terms"
                  />
                  <Label 
                    htmlFor="agreeToTerms" 
                    className="text-medical-sm leading-relaxed cursor-pointer"
                  >
                    {t.agreeToTerms}
                  </Label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-destructive text-medical-sm" role="alert">
                    {errors.agreeToTerms}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                data-analytics="auth-signup-submit"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.createAccount}
              </Button>
            </form>

            <p className="text-center text-medical-sm text-muted-foreground">
              {t.alreadyHaveAccount}{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-primary hover:underline"
                onClick={() => setActiveTab('signin')}
                data-analytics="auth-switch-signin"
              >
                {t.signIn}
              </Button>
            </p>
          </TabsContent>

          <TabsContent value="signin" className="space-y-lg">
            <form onSubmit={handleSubmit} className="space-y-lg">
              {/* Email */}
              <div className="space-y-xs">
                <Label htmlFor="signin-email">{t.email} *</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={cn(errors.email && "border-destructive")}
                  disabled={isLoading}
                  data-analytics="auth-signin-email"
                />
                {errors.email && (
                  <p className="text-destructive text-medical-sm" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-xs">
                <Label htmlFor="signin-password">{t.password} *</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className={cn(errors.password && "border-destructive", "pr-10")}
                    disabled={isLoading}
                    data-analytics="auth-signin-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-medical-sm" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="link"
                  className="p-0 h-auto text-medical-sm text-primary hover:underline"
                  type="button"
                  data-analytics="auth-forgot-password"
                >
                  {t.forgotPassword}
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                data-analytics="auth-signin-submit"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.signInAccount}
              </Button>
            </form>

            <p className="text-center text-medical-sm text-muted-foreground">
              {t.dontHaveAccount}{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-primary hover:underline"
                onClick={() => setActiveTab('signup')}
                data-analytics="auth-switch-signup"
              >
                {t.signUp}
              </Button>
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};