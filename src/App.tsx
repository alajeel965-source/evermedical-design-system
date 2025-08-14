import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import Events from "./pages/Events";
import Networking from "./pages/Networking";
import RFQs from "./pages/RFQs";
import Pricing from "./pages/Pricing";
import Dashboards from "./pages/Dashboards";
import About from "./pages/company/About";
import Privacy from "./pages/legal/Privacy";
import Terms from "./pages/legal/Terms";
import Styleguide from "./pages/Styleguide";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          <Route path="/dashboards" element={<Dashboards />} />
          <Route path="/company/about" element={<About />} />
          <Route path="/legal/privacy" element={<Privacy />} />
          <Route path="/legal/terms" element={<Terms />} />
          <Route path="/styleguide" element={<Styleguide />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
