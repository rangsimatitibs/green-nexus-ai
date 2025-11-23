import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import SignUp from "./pages/SignUp";
import ServicesLanding from "./pages/ServicesLanding";
import Blog from "./pages/Blog";
import MaterialsInformatics from "./pages/blog/MaterialsInformatics";
import BiomaterialsInnovation from "./pages/blog/BiomaterialsInnovation";
import SustainableMaterials from "./pages/blog/SustainableMaterials";
import MaterialValidation from "./pages/blog/MaterialValidation";
import MaterialScouting from "./pages/platform/MaterialScouting";
import ApplicationMatching from "./pages/platform/ApplicationMatching";
import PropertyPrediction from "./pages/platform/PropertyPrediction";
import ProcessOptimization from "./pages/platform/ProcessOptimization";
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
          <Route path="/about" element={<About />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/services" element={<ServicesLanding />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/materials-informatics" element={<MaterialsInformatics />} />
          <Route path="/blog/biomaterials-innovation" element={<BiomaterialsInnovation />} />
          <Route path="/blog/sustainable-materials" element={<SustainableMaterials />} />
          <Route path="/blog/material-validation" element={<MaterialValidation />} />
          <Route path="/platform/material-scouting" element={<MaterialScouting />} />
          <Route path="/platform/application-matching" element={<ApplicationMatching />} />
          <Route path="/platform/property-prediction" element={<PropertyPrediction />} />
          <Route path="/platform/process-optimization" element={<ProcessOptimization />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
