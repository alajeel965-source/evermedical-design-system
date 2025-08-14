import { Stethoscope, ShieldCheck, Zap, Users, Building2, Award } from "lucide-react";
import { AppShell } from "@/components/shared/AppShell";
import { useTranslation } from "@/lib/i18n";
import { HeroSection } from "@/components/shared/HeroSection";
import { FeatureTile } from "@/components/shared/FeatureTile";
import { RFQAssistant } from "@/components/shared/RFQAssistant";
import { LiveRFQsWidget } from "@/components/shared/LiveRFQsWidget";
import { SignupRegister } from "@/components/auth/SignupRegister";

const Index = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: t("pages.home.features.verifiedSuppliers.title"),
      description: t("pages.home.features.verifiedSuppliers.description")
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: t("pages.home.features.aiMatching.title"),
      description: t("pages.home.features.aiMatching.description")
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: t("pages.home.features.qrCme.title"),
      description: t("pages.home.features.qrCme.description")
    }
  ];

  return (
    <AppShell>
      {/* Hero Section */}
      <HeroSection />

      {/* Sign Up Section */}
      <section className="py-2xl bg-gradient-to-b from-sky/30 to-transparent">
        <div className="container mx-auto px-lg">
          <div className="flex justify-center">
            <SignupRegister 
              onSubmit={async (formData) => {
                // Placeholder API integration
                console.log('Form submitted:', formData);
                // In real implementation: await registerUser(formData);
              }}
              onOAuth={async (provider) => {
                // Placeholder OAuth integration
                console.log('OAuth login:', provider);
                // In real implementation: await signInWithOAuth(provider);
              }}
              onSuccess={(next) => {
                // Handle post-registration actions
                console.log('Registration success, next:', next);
                // In real implementation: navigate based on 'next' action
              }}
              locale="en"
              redirectUrls={{
                verifyEmail: '/verify-email',
                browseEvents: '/events',
                completeProfile: '/profile'
              }}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-lg py-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2xl">
          {/* Left Column - RFQ Assistant */}
          <div className="lg:col-span-2 space-y-2xl">
            <RFQAssistant />
            
            {/* Features Grid */}
            <section className="space-y-xl" aria-labelledby="features-heading">
              <div className="text-center space-y-md">
                <h2 id="features-heading" className="text-heading font-bold text-medical-3xl">
                  Why Choose EverMedical?
                </h2>
                <p className="text-body text-medical-lg max-w-2xl mx-auto">
                  Join thousands of healthcare professionals who trust our platform for their medical equipment needs.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-lg" role="list">
                {features.map((feature, index) => (
                  <div key={index} role="listitem">
                    <FeatureTile
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Live RFQs */}
          <div className="space-y-lg">
            <LiveRFQsWidget />
            
            {/* Trust Indicators */}
            <aside 
              className="bg-card border border-border rounded-medical-md p-lg shadow-soft"
              aria-labelledby="trust-heading"
            >
              <h3 id="trust-heading" className="text-heading font-semibold text-medical-base mb-md">
                Trusted Worldwide
              </h3>
              <div className="space-y-sm text-medical-sm">
                <div className="flex justify-between">
                  <span className="text-body">{t("pages.home.stats.suppliers")}</span>
                  <span className="text-heading font-semibold">15,000+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">{t("pages.home.stats.categories")}</span>
                  <span className="text-heading font-semibold">500+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">{t("pages.home.stats.globalReach")}</span>
                  <span className="text-heading font-semibold">120 Countries</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">{t("pages.home.stats.monthlyRfqs")}</span>
                  <span className="text-heading font-semibold">10,000+</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Index;
