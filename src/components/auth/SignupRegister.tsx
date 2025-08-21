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
    inviteCodePlaceholder: 'Enter your invite code',
    subscription: 'Subscription',
    subscriptionRequired: 'Subscription required for this role',
    summary: 'Summary',
    joinOurCommunity: 'Join Our Medical Community',
    signInToContinue: 'Sign in to continue to your account',
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
    signIn: 'تسجيل الدخول',
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
    signInAccount: 'تسجيل الدخول',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    dontHaveAccount: 'ليس لديك حساب؟',
    forgotPassword: 'نسيت كلمة المرور؟',
    passwordStrength: 'قوة كلمة المرور',
    language: 'اللغة',
    search: 'بحث',
    selectRole: 'اختر دورك',
    roles: {
      medicalPersonnel: 'الكادر الطبي',
      instituteBuyer: 'مشتري مؤسسة طبية',
      medicalSeller: 'بائع طبي',
      superAdmin: 'مدير عام'
    },
    subscriptions: {
      free: 'مجاني',
      yearly100: '100$ / سنة',
      monthly100: '100$ / شهر',
      yearly1000: '1000$ / سنة',
      internal: 'للاستخدام الداخلي فقط'
    },
    inviteCode: 'كود الدعوة',
    inviteCodeRequired: 'دور المدير العام يتطلب كود دعوة',
    inviteCodePlaceholder: 'أدخل كود الدعوة',
    subscription: 'الاشتراك',
    subscriptionRequired: 'مطلوب اشتراك لهذا الدور',
    summary: 'ملخص',
    joinOurCommunity: 'انضم إلى مجتمعنا الطبي',
    signInToContinue: 'سجل الدخول للمتابعة إلى حسابك',
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
  const [activeTab, setActiveTab] = useState<'signup' | 'signin'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [countries, setCountries] = useState<Country[]>([]);
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

  const t = translations[locale];
  const isRTL = locale === 'ar';

  // Helper function to get country flag emoji
  const getCountryFlag = (countryCode: string): string => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  // Helper function to get country name based on locale
  const getCountryName = (country: Country): string => {
    return locale === 'ar' ? country.name_ar : country.name_en;
  };

  // Load countries
  useEffect(() => {
    const countryList = getCountriesByLanguage(locale);
    setCountries(countryList);
  }, [locale]);

  // Role options with subscription information
  const roleOptions: RoleOption[] = [
    {
      key: 'medical_personnel',
      name: t.roles.medicalPersonnel,
      subscription: { type: 'free' },
      requiresPayment: false
    },
    {
      key: 'medical_institute',
      name: t.roles.instituteBuyer,
      subscription: { type: 'yearly', price: 100, period: 'year' },
      requiresPayment: true
    },
    {
      key: 'medical_seller',
      name: t.roles.medicalSeller,
      subscription: { type: 'yearly', price: 1000, period: 'year' },
      requiresPayment: true
    },
    {
      key: 'admin',
      name: t.roles.superAdmin,
      subscription: { type: 'internal' },
      requiresPayment: false,
      restricted: true
    }
  ];

  const selectedRole = roleOptions.find(role => role.key === formData.role);

  // Form validation
  const validateForm = (data: FormData, isSignIn = false) => {
    const newErrors: ValidationErrors = {};

    if (!data.email) newErrors.email = t.errors.required;
    else if (!isValidEmail(data.email)) newErrors.email = t.errors.invalidEmail;

    if (!data.password) newErrors.password = t.errors.required;
    else if (!isSignIn && getPasswordStrength(data.password).score < 3) {
      newErrors.password = t.errors.weakPassword;
    }

    if (!isSignIn) {
      if (!data.fullName) newErrors.fullName = t.errors.required;
      if (!data.confirmPassword) newErrors.confirmPassword = t.errors.required;
      else if (data.password !== data.confirmPassword) newErrors.confirmPassword = t.errors.passwordMismatch;
      if (!data.country) newErrors.country = t.errors.required;
      if (!data.role) newErrors.role = t.errors.required;
      if (!data.agreeToTerms) newErrors.agreeToTerms = t.errors.termsRequired;
      if (selectedRole?.restricted && !data.inviteCode) newErrors.inviteCode = t.inviteCodeRequired;
    }

    return newErrors;
  };

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent, isSignIn = false) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validationErrors = validateForm(formData, isSignIn);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      if (onSubmit) {
        console.log('Login attempt:', { email: formData.email, password: formData.password });
        
        const selectedCountry = countries.find(c => c.code === formData.country);
        await onSubmit({
          ...formData,
          subscriptionPlan: selectedRole?.key,
          countryCode: formData.country,
          countryName: selectedCountry ? getCountryName(selectedCountry) : undefined
        });
      }

      // Determine next step based on role and requirements
      let nextStep: 'verifyEmail' | 'browseEvents' | 'completeProfile' | 'payment' = 'verifyEmail';
      
      if (isSignIn) {
        nextStep = 'browseEvents';
      } else if (selectedRole?.requiresPayment) {
        nextStep = 'payment';
      } else if (formData.role === 'medical_personnel') {
        nextStep = 'completeProfile';
      }

      onSuccess?.(nextStep);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'apple' | 'google' | 'linkedin') => {
    setIsLoading(true);
    try {
      await onOAuth?.(provider);
    } catch (error) {
      console.error('OAuth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const CountryCombobox = () => {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    const filteredCountries = countries.filter(country =>
      getCountryName(country).toLowerCase().includes(searchValue.toLowerCase())
    );

    const selectedCountry = countries.find(country => country.code === formData.country);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between font-normal",
              errors.country && "border-destructive",
              !selectedCountry && "text-muted-foreground"
            )}
            data-analytics="auth-country-select"
          >
            {selectedCountry ? (
              <span className="flex items-center gap-2">
                <span className="text-lg">{getCountryFlag(selectedCountry.code)}</span>
                {getCountryName(selectedCountry)}
              </span>
            ) : (
              t.selectCountry
            )}
            <Globe className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder={t.search}
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No countries found.</CommandEmpty>
              <CommandGroup>
                {filteredCountries.map((country) => (
                <CommandItem
                    key={country.code}
                    value={getCountryName(country)}
                    onSelect={() => {
                      updateFormData('country', country.code);
                      setOpen(false);
                      setSearchValue('');
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{getCountryFlag(country.code)}</span>
                      {getCountryName(country)}
                    </span>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4",
                        formData.country === country.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)} dir={isRTL ? 'rtl' : 'ltr'}>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          {activeTab === 'signup' ? t.joinOurCommunity : t.signInToContinue}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signup' | 'signin')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="signup" 
              data-analytics="auth-tab-signup"
            >
              {t.signUp}
            </TabsTrigger>
            <TabsTrigger 
              value="signin"
              data-analytics="auth-tab-signin"
            >
              {t.signIn}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">{t.fullName} *</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateFormData('fullName', e.target.value)}
                  className={cn(errors.fullName && "border-destructive")}
                  required
                  data-analytics="auth-field-fullname"
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t.email} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={cn(errors.email && "border-destructive")}
                  required
                  data-analytics="auth-field-email"
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t.password} *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className={cn(errors.password && "border-destructive", "pr-10")}
                    required
                    data-analytics="auth-field-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
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
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t.confirmPassword} *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    className={cn(errors.confirmPassword && "border-destructive", "pr-10")}
                    required
                    data-analytics="auth-field-confirm-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">{t.country} *</Label>
                <CountryCombobox />
                {errors.country && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.country}
                  </p>
                )}
              </div>

              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">{t.role} *</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => updateFormData('role', value)}
                >
                  <SelectTrigger 
                    className={cn(errors.role && "border-destructive")}
                    data-analytics="auth-role-select"
                  >
                    <SelectValue placeholder={t.selectRole} />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((role) => (
                      <SelectItem key={role.key} value={role.key}>
                        <div className="flex items-center justify-between w-full">
                          <span>{role.name}</span>
                          {role.requiresPayment && (
                            <Badge variant="secondary" className="ml-2">
                              {role.subscription.type === 'yearly' && role.subscription.price === 100 
                                ? t.subscriptions.yearly100
                                : role.subscription.type === 'yearly' && role.subscription.price === 1000
                                ? t.subscriptions.yearly1000
                                : t.subscriptions.free
                              }
                            </Badge>
                          )}
                          {role.restricted && (
                            <Badge variant="outline" className="ml-2">
                              {t.subscriptions.internal}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.role}
                  </p>
                )}
              </div>

              {/* Invite Code for Super Admin */}
              {selectedRole?.restricted && (
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">{t.inviteCode} *</Label>
                  <Input
                    id="inviteCode"
                    type="text"
                    value={formData.inviteCode}
                    onChange={(e) => updateFormData('inviteCode', e.target.value)}
                    placeholder={t.inviteCodePlaceholder}
                    className={cn(errors.inviteCode && "border-destructive")}
                    required
                    data-analytics="auth-field-invite-code"
                  />
                  {errors.inviteCode && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {errors.inviteCode}
                    </p>
                  )}
                </div>
              )}

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">{t.phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  data-analytics="auth-field-phone"
                />
              </div>

              {/* Subscription Summary */}
              {selectedRole && (
                <div className="space-y-2">
                  <Label>{t.summary}</Label>
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{selectedRole.name}</span>
                      <Badge variant={selectedRole.requiresPayment ? "default" : "secondary"}>
                        {selectedRole.subscription.type === 'free' 
                          ? t.subscriptions.free
                          : selectedRole.subscription.type === 'yearly' && selectedRole.subscription.price === 100
                          ? t.subscriptions.yearly100
                          : selectedRole.subscription.type === 'yearly' && selectedRole.subscription.price === 1000
                          ? t.subscriptions.yearly1000
                          : t.subscriptions.internal
                        }
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms Agreement */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => updateFormData('agreeToTerms', checked as boolean)}
                  data-analytics="auth-agree-terms"
                />
                <Label 
                  htmlFor="terms" 
                  className={cn(
                    "text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                    errors.agreeToTerms && "text-destructive"
                  )}
                >
                  {t.agreeToTerms}
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.agreeToTerms}
                </p>
              )}

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

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t.continueWith}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleOAuth('apple')}
                disabled={isLoading}
                data-analytics="auth-oauth-apple"
              >
                <Apple className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuth('google')}
                disabled={isLoading}
                data-analytics="auth-oauth-google"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOAuth('linkedin')}
                disabled={isLoading}
                data-analytics="auth-oauth-linkedin"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>

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

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="signin-email">{t.email} *</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={cn(errors.email && "border-destructive")}
                  required
                  data-analytics="auth-signin-email"
                />
                {errors.email && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="signin-password">{t.password} *</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    className={cn(errors.password && "border-destructive", "pr-10")}
                    required
                    data-analytics="auth-signin-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <X className="h-3 w-3" />
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