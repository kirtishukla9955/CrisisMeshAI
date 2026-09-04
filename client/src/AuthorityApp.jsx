import { Route, Routes, Navigate } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";

import CommandCenterPage from "./pages/CommandCenterPage";

const Landing = lazy(() => import("./pages/Landing"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const IncidentDetailsPage = lazy(() => import("./pages/IncidentDetailsPage"));
const PostDisasterPage = lazy(() => import("./pages/PostDisasterPage"));
const PlaceholderPage = lazy(() => import("./pages/PlaceholderPage"));
const LiveIncidentsPage = lazy(() => import("./pages/LiveIncidentsPage"));
const PriorityQueuePage = lazy(() => import("./pages/PriorityQueuePage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const ResponseHistoryPage = lazy(() => import("./pages/ResponseHistoryPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#17324A]">
      <div className="animate-pulse text-white/40">Loading...</div>
    </div>
  );
}

export default function AuthorityApp() {
  const [authority, setAuthority] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dummyUser = localStorage.getItem("dummy_auth_user");
    if (dummyUser) {
      setAuthority(JSON.parse(dummyUser));
    } else {
      setAuthority(null);
    }
    setLoading(false);
  }, []);

  if (loading) return <RouteLoading />;

  return (
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={authority ? <Navigate to="/authority/dashboard" /> : <LoginPage />} />
          <Route path="/dashboard" element={authority ? <CommandCenterPage authority={authority} /> : <Navigate to="/authority/login" />} />
          <Route path="/incidents/:id" element={authority ? <IncidentDetailsPage authority={authority} /> : <Navigate to="/authority/login" />} />
          <Route path="/reports" element={authority ? <PostDisasterPage authority={authority} /> : <Navigate to="/authority/login" />} />
          
          <Route path="/incidents" element={authority ? <LiveIncidentsPage authority={authority} /> : <Navigate to="/authority/login" />} />
          <Route path="/alerts" element={authority ? <PlaceholderPage authority={authority} title="Alerts" activeTab="alerts" /> : <Navigate to="/authority/login" />} />
          <Route path="/resources" element={authority ? <PlaceholderPage authority={authority} title="Resources" activeTab="resources" /> : <Navigate to="/authority/login" />} />
          <Route path="/users" element={authority ? <PlaceholderPage authority={authority} title="Users" activeTab="users" /> : <Navigate to="/authority/login" />} />
          <Route path="/priority-queue" element={authority ? <PriorityQueuePage authority={authority} /> : <Navigate to="/authority/login" />} />
          <Route path="/analytics" element={authority ? <AnalyticsPage authority={authority} /> : <Navigate to="/authority/login" />} />
          <Route path="/response-history" element={authority ? <ResponseHistoryPage authority={authority} /> : <Navigate to="/authority/login" />} />
          <Route path="/settings" element={authority ? <SettingsPage authority={authority} /> : <Navigate to="/authority/login" />} />
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-[#17324A] text-white">
                <div className="text-center">
                  <h1 className="text-4xl font-bold">404</h1>
                  <p className="mt-2 text-white/50">Page not found</p>
                  <a href="/" className="mt-4 inline-block text-sm text-[#E67E22] hover:underline">
                    Go home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
  );
}