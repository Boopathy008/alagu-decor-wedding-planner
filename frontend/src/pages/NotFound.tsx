import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-40 text-center">
      <p className="font-display text-7xl mb-6">404</p>
      <p className="text-charcoal/60 mb-10">
        This page doesn't exist, or has moved.
      </p>
      <Link
        to="/"
        className="text-xs uppercase tracking-widest2 border-b border-charcoal/30 pb-1 hover:border-accent hover:text-accent"
      >
        Back to Home
      </Link>
    </div>
  );
}
