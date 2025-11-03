
// frontend/src/components/Admin.tsx
import { useState } from "react";
import Dashboard from "./Dashboard";
import Navbar from "./Navbar";
import AdminLogin from "./AdminLogin";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // NEW: Add a function to handle logging out
  const handleLogout = () => {
    setIsAuthenticated(false);
    // In a real app, you'd also clear any stored tokens here
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#1A1E2E] via-[#2A3048] to-[#1A1E2E] text-slate-100 font-sans">
      <header className="sticky top-0 z-50 bg-[#1A1E2E]/80 backdrop-blur-sm shadow-md">
        {/* UPDATED: Pass the auth state and logout function to Navbar */}
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 lg:py-12">
        {isAuthenticated ? (
          <>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-8">
              Admin Dashboard
            </h1>
            <Dashboard />
          </>
        ) : (
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        )}
      </main>
    </div>
  );
}