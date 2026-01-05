import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FilterProvider } from "@/hooks/useGlobalFilters";
import Layout from "@/components/Layout";
import DashboardNew from "@/pages/DashboardNew";
import Settings from "@/pages/Settings";
import ReportsPage from "@/pages/ReportsPage";
import Network from "@/pages/Network";
import Incidents from "@/pages/Incidents";
import DetailPage from "@/pages/DetailPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FilterProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout><Dashboard /></Layout>} />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />
              <Route path="/network" element={<Layout><Network /></Layout>} />
              <Route path="/incidents" element={<Layout><Incidents /></Layout>} />
              <Route path="/reports" element={<Layout><ReportsPage /></Layout>} />
              <Route path="/detail/:section" element={<Layout><DetailPage /></Layout>} />
              <Route path="/detail/:section/:action" element={<Layout><DetailPage /></Layout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </FilterProvider>
    </QueryClientProvider>
  );
}
