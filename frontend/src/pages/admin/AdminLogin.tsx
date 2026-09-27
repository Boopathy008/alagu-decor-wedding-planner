import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin/dashboard" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-ivory p-10"
      >
        <p className="font-display text-2xl mb-1">Alagu Admin</p>
        <p className="text-xs uppercase tracking-widest2 text-charcoal/40 mb-8">
          Gallery & Enquiry Management
        </p>

        <label className="block mb-5">
          <span className="text-xs uppercase tracking-widest2 text-charcoal/50">Email</span>
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full bg-transparent border-b border-charcoal/20 py-3 focus:outline-none focus:border-accent"
          />
        </label>

        <label className="block mb-8">
          <span className="text-xs uppercase tracking-widest2 text-charcoal/50">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full bg-transparent border-b border-charcoal/20 py-3 focus:outline-none focus:border-accent"
          />
        </label>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-charcoal text-ivory text-xs uppercase tracking-widest2 hover:bg-accent transition-colors disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-xs uppercase tracking-widest2 text-charcoal/50 hover:text-accent transition-colors"
          >
            ← Back to Website
          </Link>
        </div>
      </form>
    </div>
  );
}
