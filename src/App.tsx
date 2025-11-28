import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import About from "./pages/About";
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import ServicesLanding from "./pages/ServicesLanding";
import MaterialScouting from "./pages/platform/MaterialScouting";
import MaterialDetail from "./pages/platform/MaterialDetail";
import ResearchersTool from "./pages/platform/ResearchersTool";
import ProcessOptimization from "./pages/platform/ProcessOptimization";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import MaterialsAdmin from "./pages/admin/MaterialsAdmin";
import SuppliersAdmin from "./pages/admin/SuppliersAdmin";
import ResearchMaterialsAdmin from "./pages/admin/ResearchMaterialsAdmin";
import LabRecipesAdmin from "./pages/admin/LabRecipesAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/services" element={<ServicesLanding />} />
            <Route path="/platform/material-scouting" element={<MaterialScouting />} />
            <Route path="/platform/material/:id" element={<MaterialDetail />} />
            <Route path="/platform/researchers-tool" element={<ResearchersTool />} />
            <Route path="/platform/process-optimization" element={<ProcessOptimization />} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="materials" element={<MaterialsAdmin />} />
              <Route path="suppliers" element={<SuppliersAdmin />} />
              <Route path="research-materials" element={<ResearchMaterialsAdmin />} />
              <Route path="lab-recipes" element={<LabRecipesAdmin />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
