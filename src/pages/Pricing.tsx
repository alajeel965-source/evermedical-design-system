import { AppShell } from "@/components/shared/AppShell";
import { PricingCard } from "@/components/templates/cards/PricingCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Heart, Building, Users, GraduationCap, Stethoscope, Award, Globe, ShoppingCart, TrendingUp, Calendar, Shield, Network } from "lucide-react";

export default function Pricing() {
  const pricingPlans = [
    {
      title: "Medical Institute Buyers",
      subtitle: "Hospitals, Clinics, Labs, Universities, NGOs",
      price: "Free",
      period: "",
      description: "Complete procurement solution for medical institutions",
      icon: Building,
      features: [
        "Browse and compare products from global verified suppliers",
        "Post bulk RFQs (Requests for Quotation)",
        "Negotiate directly with sellers",
        "Invite team members to manage purchases",
        "Track quote history and orders",
        "Access special institutional offers and bulk pricing"
      ],
      ctaText: "Join Free",
      highlight: "Always Free",
    },
    {
      title: "Medical Sellers",
      subtitle: "Manufacturers, Distributors, Exporters",
      price: "$100",
      period: "month",
      yearlyPrice: "$1,000",
      description: "Grow your medical business with qualified global leads",
      icon: ShoppingCart,
      features: [
        "List unlimited products and company profile",
        "Generate qualified sales leads from buyers globally",
        "Respond to RFQs in real time",
        "Access buyer insights and analytics",
        "Priority listing in search results",
        "Direct chat and email with buyers",
        "Support for managing international logistics discussions"
      ],
      isPopular: true,
      ctaText: "Subscribe Now",
      yearlyDiscount: "Save $200/year",
    },
    {
      title: "Medical Personnel",
      subtitle: "Doctors, Nurses, Pharmacists, Medical Students",
      price: "$100",
      originalPrice: "$150",
      period: "year",
      description: "Advanced your medical career with CME and networking",
      icon: Stethoscope,
      features: [
        "Access to CME-accredited medical conferences",
        "CME-accredited workshops and webinars",
        "CME-accredited exhibitions",
        "Build and promote your professional profile to potential hospitals",
        "Personalized event feed based on specialty and subspecialty",
        "Track CME points and download certificates",
        "Access a global network of verified suppliers",
        "Compare and request quotes for medical equipment and supplies"
      ],
      ctaText: "Subscribe Now",
      highlight: "Special Offer",
    },
  ];

  const faqs = [
    {
      question: "How does the free plan for Medical Institute Buyers work?",
      answer: "Medical institutions can access our platform completely free to browse suppliers, post RFQs, and manage their procurement. This includes full access to verified suppliers and bulk pricing opportunities."
    },
    {
      question: "What's the difference between monthly and yearly pricing for sellers?",
      answer: "Medical sellers can choose $100/month or save with our annual plan at $1,000/year, offering significant cost savings for committed partners."
    },
    {
      question: "Is the Medical Personnel plan really discounted?",
      answer: "Yes! We've reduced the price from $150 to $100 per year to make CME and professional development more accessible to healthcare professionals."
    },
    {
      question: "Are the CME events really accredited?",
      answer: "Absolutely. All conferences, workshops, webinars, and exhibitions on our platform are fully CME-accredited, allowing you to earn and track continuing education credits."
    },
    {
      question: "Can Medical Personnel access the marketplace features?",
      answer: "Yes! Medical Personnel subscribers get access to browse suppliers and request quotes for medical equipment and supplies, in addition to all the CME and networking features."
    },
    {
      question: "How does team management work for Medical Institute Buyers?",
      answer: "Institute buyers can invite unlimited team members to collaborate on procurement decisions, track orders, and manage supplier relationships at no additional cost."
    },
    {
      question: "What kind of analytics do Medical Sellers get?",
      answer: "Sellers receive comprehensive buyer insights, lead analytics, RFQ response tracking, and performance metrics to optimize their sales strategy."
    },
    {
      question: "Is international logistics support included?",
      answer: "Yes, Medical Sellers get support for managing international logistics discussions, helping facilitate global trade in medical supplies and equipment."
    }
  ];

  return (
    <AppShell>
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-surface">
        <div className="container mx-auto px-lg py-2xl">
          <div className="text-center space-y-lg mb-2xl">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Heart className="h-4 w-4" />
              EverMedical Pricing Plans
            </div>
            <h1 className="text-heading font-bold text-medical-5xl bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Choose Your Perfect Plan
            </h1>
            <p className="text-body text-medical-lg max-w-3xl mx-auto leading-relaxed">
              Join thousands of medical professionals, institutions, and suppliers advancing healthcare globally through our comprehensive platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className="relative group">
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-primary to-primary/80 text-white px-6 py-2 shadow-lg">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-success to-success/80 text-white px-6 py-2 shadow-lg">
                      <Award className="h-3 w-3 mr-1" />
                      {plan.highlight}
                    </Badge>
                  </div>
                )}
                
                <div className={`h-full bg-card/80 backdrop-blur-sm border-2 rounded-3xl p-8 shadow-medical-lg hover:shadow-medical-xl transition-all duration-300 group-hover:scale-[1.02] ${
                  plan.isPopular ? 'border-primary/30 bg-gradient-to-b from-primary/5 to-transparent' : 
                  plan.highlight ? 'border-success/30 bg-gradient-to-b from-success/5 to-transparent' : 
                  'border-border/50 hover:border-border'
                }`}>
                  <div className="text-center space-y-4 mb-8">
                    <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
                      plan.isPopular ? 'bg-primary/10 text-primary' : 
                      plan.highlight ? 'bg-success/10 text-success' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                      <plan.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-heading font-bold text-medical-xl">{plan.title}</h3>
                      <p className="text-muted-foreground text-medical-sm mt-1">{plan.subtitle}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center gap-1">
                        {plan.originalPrice && (
                          <span className="text-muted-foreground text-medical-lg line-through">${plan.originalPrice}</span>
                        )}
                        <span className="text-heading font-bold text-medical-4xl">{plan.price === "Free" ? "Free" : `$${plan.price}`}</span>
                        {plan.period && <span className="text-muted-foreground text-medical-sm">/{plan.period}</span>}
                      </div>
                      {plan.yearlyPrice && (
                        <p className="text-muted-foreground text-medical-sm">
                          or ${plan.yearlyPrice}/year
                        </p>
                      )}
                      {plan.yearlyDiscount && (
                        <p className="text-success text-medical-sm font-medium">{plan.yearlyDiscount}</p>
                      )}
                      <p className="text-body text-medical-sm">{plan.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 shrink-0 ${
                          plan.isPopular ? 'bg-primary/10' : plan.highlight ? 'bg-success/10' : 'bg-muted'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            plan.isPopular ? 'bg-primary' : plan.highlight ? 'bg-success' : 'bg-muted-foreground'
                          }`} />
                        </div>
                        <span className="text-body text-medical-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    className={`w-full py-4 px-6 rounded-2xl font-semibold text-medical-base transition-all duration-300 ${
                      plan.isPopular 
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-white hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/25' 
                        : plan.highlight
                        ? 'bg-gradient-to-r from-success to-success/80 text-white hover:from-success/90 hover:to-success/70 shadow-lg hover:shadow-success/25'
                        : plan.price === "Free"
                        ? 'bg-gradient-to-r from-muted to-muted/80 text-foreground hover:from-muted/80 hover:to-muted/60'
                        : 'bg-gradient-to-r from-foreground to-foreground/90 text-background hover:from-foreground/90 hover:to-foreground/80'
                    }`}
                    onClick={() => {
                      alert(`Selected ${plan.title} plan - Integration coming soon!`);
                    }}
                  >
                    {plan.ctaText}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* FAQ Section */}
          <div className="max-w-5xl mx-auto mt-3xl">
            <div className="text-center mb-2xl">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                Questions & Answers
              </div>
              <h2 className="text-heading font-bold text-medical-3xl mb-md">Frequently Asked Questions</h2>
              <p className="text-body text-medical-lg">
                Everything you need to know about EverMedical pricing and features
              </p>
            </div>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 px-8 py-2 hover:border-border transition-all duration-300"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="font-semibold text-heading text-medical-base pr-4">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="text-body text-medical-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          <div className="text-center mt-2xl">
            <div className="bg-card/80 backdrop-blur-sm rounded-3xl border border-border/50 p-8 max-w-2xl mx-auto">
              <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-heading font-bold text-medical-xl mb-2">Ready to Transform Healthcare?</h3>
              <p className="text-body text-medical-sm mb-6">
                Join our global community of healthcare professionals, institutions, and suppliers making a difference worldwide.
              </p>
              <p className="text-muted-foreground text-medical-xs">
                Questions about enterprise solutions?{" "}
                <a href="#" className="text-primary hover:underline font-medium">
                  Contact our team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}