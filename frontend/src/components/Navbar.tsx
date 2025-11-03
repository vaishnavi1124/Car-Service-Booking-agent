
// frontend/src/components/Navbar.tsx
import { Link, useLocation } from "react-router-dom";

// NEW: Define the types for the props we're now passing in
type NavbarProps = {
  isAuthenticated?: boolean; // Optional, so it doesn't break on the home page
  onLogout?: () => void; // Optional
};

// UPDATED: Destructure the new props, providing default values
export default function Navbar({ isAuthenticated = false, onLogout }: NavbarProps) {
  const location = useLocation();

  return (
    <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
      <div className="flex lg:flex-1">
        <Link to="/" className="-m-1.5 p-1.5">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            BookMyService
          </span>
        </Link>
      </div>
      
      {/* UPDATED: This logic now includes the Logout button */}
      <div className="flex items-center gap-x-6">
        {location.pathname === '/' ? (
          // On Home page, show link to Admin
          <Link to="/admin" className="text-sm font-semibold leading-6 text-slate-200 hover:text-purple-400 transition-colors">
            Admin Panel →
          </Link>
        ) : (
          // On other pages (like /admin), show "Back to Home"
          <Link to="/" className="text-sm font-semibold leading-6 text-slate-200 hover:text-blue-400 transition-colors">
            ← Back to Home
          </Link>
        )}

        {/* NEW: If we are authenticated, ALSO show the Logout button */}
        {isAuthenticated && onLogout && (
          <button
            onClick={onLogout}
            className="text-sm font-semibold leading-6 text-rose-400 hover:text-rose-300 transition-colors"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}