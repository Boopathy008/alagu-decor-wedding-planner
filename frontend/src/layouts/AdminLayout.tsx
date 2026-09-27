import { useState } from "react";
import { Link, NavLink, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/enquiries", label: "Enquiries" },
];

export function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-ivory">
      {/* Mobile Header */}
      <header className="md:hidden bg-charcoal text-ivory flex items-center justify-between px-6 py-4">
        <Link to="/admin/dashboard" className="font-display text-lg">
          Alagu Admin
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-xs uppercase tracking-widest2 border border-ivory/20 px-3 py-1.5 rounded"
        >
          {mobileMenuOpen ? "Close" : "Menu"}
        </button>
      </header>

      {/* Mobile Dropdown Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-charcoal border-t border-ivory/10 px-6 py-4 flex flex-col gap-2 text-ivory">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 text-sm rounded ${
                  isActive ? "bg-ivory/10 text-accent font-medium" : "text-ivory/70"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <button
            onClick={logout}
            className="mt-2 text-sm text-ivory/50 hover:text-ivory text-left px-3 py-2"
          >
            Logout
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 bg-charcoal text-ivory flex-col p-6 shrink-0 min-h-screen">
        <Link to="/admin/dashboard" className="font-display text-lg mb-10">
          Alagu Admin
        </Link>
        <nav className="flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 text-sm rounded ${
                  isActive ? "bg-ivory/10 text-accent" : "text-ivory/60 hover:text-ivory"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="mt-auto text-sm text-ivory/50 hover:text-ivory text-left"
        >
          Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 overflow-x-auto min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
