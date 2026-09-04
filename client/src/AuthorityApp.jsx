import { Route, Routes, Navigate } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import CommandCenterPage from "./pages/CommandCenterPage";

const Landing = lazy(() => import("./pages/Landing"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const IncidentDetailsPage = lazy(() => import("./pages/IncidentDetailsPage"));
const PostDisasterPage = lazy(() => import("./pages/PostDisasterPage"));

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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthority({ uid: user.uid, email: user.email, name: user.displayName || 'Authority User', role: 'authority' });
      } else {
        setAuthority(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <RouteLoading />;

  return (
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={authority ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/dashboard" element={authority ? <CommandCenterPage authority={authority} /> : <Navigate to="/login" />} />
          <Route path="/incidents/:id" element={authority ? <IncidentDetailsPage authority={authority} /> : <Navigate to="/login" />} />
          <Route path="/reports" element={authority ? <PostDisasterPage authority={authority} /> : <Navigate to="/login" />} />
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