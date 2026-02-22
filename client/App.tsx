import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FilterProvider } from "@/hooks/useGlobalFilters";
import ScrollToTop from "@/components/ScrollToTop";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "@/pages/Login";
import DashboardNew from "@/pages/DashboardNew";
import AIEngineActions from "@/pages/AIEngineActions";
import Settings from "@/pages/Settings";
import Settings2 from "@/pages/Settings2";
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
import { AutomationManagement } from "@/pages/AutomationManagement";
import { TopologyManagement } from "@/pages/TopologyManagement";
import { CommandCenter } from "@/pages/CommandCenter";
import ReportsModule from "@/pages/ReportsModule";
import ActivityAudit from "@/pages/ActivityAudit";
import AccessControl from "@/pages/AccessControl";
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
          <AuthProvider>
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
                <Route path="/login" element={<Login />} />
                
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <DashboardNew />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/voice-analytics"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <VoiceAnalytics />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/data-analytics"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <DataAnalytics />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/network-alarms"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <NetworkAlarms />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/network-status"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <NetworkStatus />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Settings />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings-2"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Settings2 />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-actions"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AIEngineActions />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/network"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <NetworkNew />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/incidents"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <IncidentsNew />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ReportsPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reports-module"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ReportsModule />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/activity-audit"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ActivityAudit />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/access-control"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AccessControl />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/detail/:section"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <DetailPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/detail/:section/:action"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <DetailPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics-home"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AnalyticsHome />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics-management"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AnalyticsManagement />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/alarm-management"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AlarmManagement />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/automation-management"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <AutomationManagement />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/topology-management"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <TopologyManagement />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/command-center"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <CommandCenter />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/activity-log"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ComingSoon title="Activity & Audit Trail" description="Track all system activities and audit logs" />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </FilterProvider>
    </QueryClientProvider>
  );
}
