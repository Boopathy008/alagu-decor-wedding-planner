import { Outlet } from "react-router-dom";
import { Navbar, Footer } from "@/components/layout/Chrome";

// Note: the floating WhatsApp button is rendered per-page (not here) so that
// category pages can supply a contextual message, per the spec's requirement
// that category pages generate a dynamic WhatsApp message.
export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
