import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FilterProvider } from "@/hooks/useGlobalFilters";
import ScrollToTop from "@/components/ScrollToTop";
import Layout from "@/components/Layout";
import DashboardNew from "@/pages/DashboardNew";
import AIEngineActions from "@/pages/AIEngineActions";
import Settings from "@/pages/Settings";
import ReportsPage from "@/pages/ReportsPage";
import NetworkNew from "@/pages/NetworkNew";
import IncidentsNew from "@/pages/IncidentsNew";
import DetailPage from "@/pages/DetailPage";
import VoiceAnalytics from "@/pages/VoiceAnalytics";
import DataAnalytics from "@/pages/DataAnalytics";
import NetworkAlarms from "@/pages/NetworkAlarms";
import AnalyticsHome from "@/pages/AnalyticsHome";
import AnalyticsManagement from "@/pages/AnalyticsManagement";
import NetworkStatus from "@/pages/NetworkStatus";
import { AlarmManagement } from "@/pages/AlarmManagement";
import ComingSoon from "@/pages/ComingSoon";
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
            <ScrollToTop />
            <Routes>
              <Route
                path="/"
                element={
                  <Layout>
                    <DashboardNew />
                  </Layout>
                }
              />
              <Route
                path="/voice-analytics"
                element={
                  <Layout>
                    <VoiceAnalytics />
                  </Layout>
                }
              />
              <Route
                path="/data-analytics"
                element={
                  <Layout>
                    <DataAnalytics />
                  </Layout>
                }
              />
              <Route
                path="/network-alarms"
                element={
                  <Layout>
                    <NetworkAlarms />
                  </Layout>
                }
              />
              <Route
                path="/network-status"
                element={
                  <Layout>
                    <NetworkStatus />
                  </Layout>
                }
              />
              <Route
                path="/settings"
                element={
                  <Layout>
                    <Settings />
                  </Layout>
                }
              />
              <Route
                path="/ai-actions"
                element={
                  <Layout>
                    <AIEngineActions />
                  </Layout>
                }
              />
              <Route
                path="/network"
                element={
                  <Layout>
                    <NetworkNew />
                  </Layout>
                }
              />
              <Route
                path="/incidents"
                element={
                  <Layout>
                    <IncidentsNew />
                  </Layout>
                }
              />
              <Route
                path="/reports"
                element={
                  <Layout>
                    <ReportsPage />
                  </Layout>
                }
              />
              <Route
                path="/detail/:section"
                element={
                  <Layout>
                    <DetailPage />
                  </Layout>
                }
              />
              <Route
                path="/detail/:section/:action"
                element={
                  <Layout>
                    <DetailPage />
                  </Layout>
                }
              />
              <Route
                path="/analytics-home"
                element={
                  <Layout>
                    <AnalyticsHome />
                  </Layout>
                }
              />
              <Route
                path="/analytics-management"
                element={
                  <Layout>
                    <AnalyticsManagement />
                  </Layout>
                }
              />
              <Route
                path="/alarm-management"
                element={
                  <Layout>
                    <AlarmManagement />
                  </Layout>
                }
              />
              <Route
                path="/automation-management"
                element={
                  <Layout>
                    <ComingSoon title="Automation & AI Management" description="Manage AI-powered automation rules and workflows" />
                  </Layout>
                }
              />
              <Route
                path="/activity-log"
                element={
                  <Layout>
                    <ComingSoon title="Activity & Audit Trail" description="Track all system activities and audit logs" />
                  </Layout>
                }
              />
              <Route
                path="/access-control"
                element={
                  <Layout>
                    <ComingSoon title="Access Control" description="Manage user roles and permissions" />
                  </Layout>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </FilterProvider>
    </QueryClientProvider>
  );
}
