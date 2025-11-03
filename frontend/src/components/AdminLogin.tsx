// frontend/src/components/AdminLogin.tsx

import { useState } from "react";

// Hya component la "Admin.tsx" kadun ek function milte
type AdminLoginProps = {
  onLoginSuccess: () => void;
};

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Login failed");
      }

      // Login successful zalyavar, "Admin.tsx" madhil function la call kara
      onLoginSuccess();

    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 shadow-2xl rounded-xl px-8 pt-6 pb-8 mb-4"
        // Form la autocomplete "off" sangto
        autoComplete="off"
      >
        <h2 className="text-center text-2xl font-bold text-white mb-6">
          Admin Login
        </h2>
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="email">
            Email (as username)
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="shadow-inner appearance-none border border-slate-600 rounded-lg w-full py-3 px-4 bg-slate-700 text-slate-100 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="admin@example.com"
            // He browser la autofill karnya pasun thambavte
            autoComplete="off" 
          />
        </div>
        <div className="mb-6">
          <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="shadow-inner appearance-none border border-slate-600 rounded-lg w-full py-3 px-4 bg-slate-700 text-slate-100 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="••••••••"
            // He trick browser la password autofill karnya pasun thambavte
            autoComplete="new-password"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 disabled:opacity-60"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}
