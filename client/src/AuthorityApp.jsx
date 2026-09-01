import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import CommandCenterPage from "./pages/CommandCenterPage";

const Landing = lazy(() => import("./pages/Landing"));

function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#17324A]">
      <div className="animate-pulse text-white/40">Loading...</div>
    </div>
  );
}

export default function AuthorityApp() {
  return (
      <Suspense fallback={<RouteLoading />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<CommandCenterPage />} />
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