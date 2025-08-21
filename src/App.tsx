import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import SecurityErrorBoundary from "@/components/security/SecurityErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import Events from "./pages/Events";
import Networking from "./pages/Networking";
import RFQs from "./pages/RFQs";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import Dashboards from "./pages/Dashboards";
import About from "./pages/company/About";
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import DesignSystem from "./pages/DesignSystem";
import AIAgent from "./pages/AIAgent";
import AIAgentSources from "./pages/AIAgentSources";
import AIAgentReview from "./pages/AIAgentReview";
import { SpecialtyLanding } from "./pages/SpecialtyLanding";
import { ProfileMedicalPersonnel } from "./pages/ProfileMedicalPersonnel";
import { ProfileMedicalInstitute } from "./pages/ProfileMedicalInstitute";
import { ProfileMedicalSeller } from "./pages/ProfileMedicalSeller";
import PastEvents from "./pages/PastEvents";
import SavedRFQs from "./pages/SavedRFQs";
import BillingHistory from "./pages/BillingHistory";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <SecurityErrorBoundary>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/events" element={<Events />} />
          <Route path="/networking" element={<Networking />} />
          <Route path="/rfqs" element={<RFQs />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboards" element={<Dashboards />} />
          <Route path="/ai-agent" element={<AIAgent />} />
          <Route path="/ai-agent/sources" element={<AIAgentSources />} />
          <Route path="/ai-agent/review" element={<AIAgentReview />} />
          <Route path="/company/about" element={<About />} />
          <Route path="/legal/privacy" element={<Privacy />} />
          <Route path="/legal/terms" element={<Terms />} />
          <Route path="/design-system" element={<DesignSystem />} />
          <Route path="/specialty/:slug" element={<SpecialtyLanding />} />
          <Route path="/ar/specialty/:slug" element={<SpecialtyLanding />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/medical-personnel" element={<ProtectedRoute><ProfileMedicalPersonnel /></ProtectedRoute>} />
          <Route path="/profile/medical-institute" element={<ProtectedRoute><ProfileMedicalInstitute /></ProtectedRoute>} />
          <Route path="/profile/medical-seller" element={<ProtectedRoute><ProfileMedicalSeller /></ProtectedRoute>} />
          <Route path="/past-events" element={<ProtectedRoute><PastEvents /></ProtectedRoute>} />
          <Route path="/saved-rfqs" element={<ProtectedRoute><SavedRFQs /></ProtectedRoute>} />
          <Route path="/billing-history" element={<ProtectedRoute><BillingHistory /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  </SecurityErrorBoundary>
);

export default App;
