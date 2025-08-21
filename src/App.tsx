/**
 * EverMedical Platform - Main Application Component
 * 
 * A comprehensive medical networking and event management platform
 * Built with React, TypeScript, and Supabase for the healthcare industry.
 * 
 * Features:
 * - Medical event discovery and networking
 * - Professional profile management
 * - RFQ marketplace for medical equipment
 * - AI-powered event recommendations
 * - Multilingual support (English/Arabic)
 * - Enterprise-grade security with RLS
 * 
 * @author EverMedical Team
 * @version 2.0.0
 * @license MIT
 */

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

// Core Pages
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import Events from "./pages/Events";
import Networking from "./pages/Networking";
import RFQs from "./pages/RFQs";
import Pricing from "./pages/Pricing";
import Auth from "./pages/Auth";
import Dashboards from "./pages/Dashboards";

// Company & Legal Pages
import About from "./pages/company/About";
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";

// AI & Analytics
import AIAgent from "./pages/AIAgent";
import AIAgentSources from "./pages/AIAgentSources";
import AIAgentReview from "./pages/AIAgentReview";

// Specialty & Profile Pages
import { SpecialtyLanding } from "./pages/SpecialtyLanding";
import { ProfileMedicalPersonnel } from "./pages/ProfileMedicalPersonnel";
import { ProfileMedicalInstitute } from "./pages/ProfileMedicalInstitute";
import { ProfileMedicalSeller } from "./pages/ProfileMedicalSeller";

// Protected User Pages
import PastEvents from "./pages/PastEvents";
import SavedRFQs from "./pages/SavedRFQs";
import BillingHistory from "./pages/BillingHistory";
import Profile from "./pages/Profile";

// Utility Pages
import DesignSystem from "./pages/DesignSystem";
import NotFound from "./pages/NotFound";

/**
 * React Query configuration for optimal performance
 * - 5 minute cache time for medical data freshness
 * - 30 second stale time for real-time feel
 * - Retry on failure for reliability
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Main Application Component
 * 
 * Provides the foundational structure with:
 * - Multi-layered error boundaries for production stability
 * - React Query for optimized data fetching
 * - Internationalization support
 * - Secure routing with authentication
 * - Comprehensive toast notifications
 * 
 * @returns JSX.Element The complete application structure
 */
const App: React.FC = () => (
  <SecurityErrorBoundary>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/events" element={<Events />} />
                <Route path="/networking" element={<Networking />} />
                <Route path="/rfqs" element={<RFQs />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* AI & Analytics */}
                <Route path="/ai-agent" element={<AIAgent />} />
                <Route path="/ai-agent/sources" element={<AIAgentSources />} />
                <Route path="/ai-agent/review" element={<AIAgentReview />} />
                
                {/* Company & Legal */}
                <Route path="/company/about" element={<About />} />
                <Route path="/legal/privacy" element={<Privacy />} />
                <Route path="/legal/terms" element={<Terms />} />
                
                {/* Development Tools */}
                <Route path="/design-system" element={<DesignSystem />} />
                
                {/* Dynamic Specialty Pages (English & Arabic) */}
                <Route path="/specialty/:slug" element={<SpecialtyLanding />} />
                <Route path="/ar/specialty/:slug" element={<SpecialtyLanding />} />
                
                {/* Protected User Dashboard */}
                <Route path="/dashboards" element={<Dashboards />} />
                
                {/* Protected Profile Routes */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile/medical-personnel" 
                  element={
                    <ProtectedRoute>
                      <ProfileMedicalPersonnel />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile/medical-institute" 
                  element={
                    <ProtectedRoute>
                      <ProfileMedicalInstitute />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile/medical-seller" 
                  element={
                    <ProtectedRoute>
                      <ProfileMedicalSeller />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected User Data Routes */}
                <Route 
                  path="/past-events" 
                  element={
                    <ProtectedRoute>
                      <PastEvents />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/saved-rfqs" 
                  element={
                    <ProtectedRoute>
                      <SavedRFQs />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/billing-history" 
                  element={
                    <ProtectedRoute>
                      <BillingHistory />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Catch-all 404 Route - MUST be last */}
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
