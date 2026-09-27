import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { MainLayout } from "@/layouts/MainLayout";
import { AdminLayout } from "@/layouts/AdminLayout";

import Home from "@/pages/Home";
import Services from "@/pages/Services";
import ServiceCategoryPage from "@/pages/ServiceCategoryPage";
import OurWork from "@/pages/OurWork";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminGallery from "@/pages/admin/AdminGallery";
import AdminGalleryCategory from "@/pages/admin/AdminGalleryCategory";
import AdminGalleryForm from "@/pages/admin/AdminGalleryForm";
import AdminEnquiries from "@/pages/admin/AdminEnquiries";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:categorySlug" element={<ServiceCategoryPage />} />
          <Route path="/our-work" element={<OurWork />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="gallery/new" element={<AdminGalleryForm />} />
          <Route path="gallery/edit/:id" element={<AdminGalleryForm />} />
          <Route path="gallery/:categorySlug" element={<AdminGalleryCategory />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
        </Route>
      </Routes>
    </>
  );
}
