import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { serviceCategories, type ServiceCategory } from "@/config/services";
import { site } from "@/config/site";
import { FadeIn, Button } from "@/components/ui/Primitives";
import { WhatsAppButton } from "@/components/layout/Chrome";
import { fetchAllGalleryItems } from "@/services/api";
import type { GalleryItem } from "@/types";

export default function Home() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    // Load all published gallery items for the category sections
    fetchAllGalleryItems()
      .then(setGalleryItems)
      .catch(() => setGalleryItems([]));
  }, []);

  return (
    <div>
      {/* ── Hero: Sleek luxury black background ───────────────────────────── */}
      <HeroSection />

      <section className="max-w-4xl mx-auto px-6 py-28 text-center">
        <FadeIn>
          <p className="text-xl md:text-3xl text-charcoal/80 leading-relaxed font-display font-light">
            Crafting unforgettable weddings &amp; grand celebrations with
            complete end-to-end design, decoration, and seamless event
            management.
          </p>
        </FadeIn>
      </section>

      {/* ── Category showcase sections ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-28 space-y-28">
        {serviceCategories.map((cat, i) => (
          <CategorySection
            key={cat.slug}
            category={cat}
            index={i}
            galleryItems={galleryItems}
          />
        ))}
      </section>

      <CustomEventSection />
      <WhatsAppButton />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="relative h-screen min-h-[640px] flex flex-col items-center justify-center bg-black text-ivory overflow-hidden">
      {/* Ambient dark radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900/80 via-black to-black" />

      {/* Decorative subtle border line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

      {/* Text content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.35em" }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs uppercase tracking-widest2 text-accent mb-6 font-semibold"
        >
          Wedding &amp; Event Studio
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-6xl md:text-9xl leading-[0.95] font-light tracking-wide"
        >
          {site.brandLine1}
          <br />
          <span className="text-3xl md:text-5xl text-ivory/60 font-serif italic mt-2 block">
            {site.brandLine2}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 font-display text-xl md:text-2xl italic text-ivory/80"
        >
          "{site.message}"
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="mt-12"
        >
          <Link to="/our-work">
            <Button variant="ghost">See Our Work</Button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="absolute bottom-10 flex flex-col items-center gap-2"
      >
        <motion.span
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-10 bg-ivory/40"
        />
        <span className="text-[10px] uppercase tracking-widest2 text-ivory/40">Scroll</span>
      </motion.div>
    </section>
  );
}

// ─── Category Section ─────────────────────────────────────────────────────────

function CategorySection({
  category,
  index,
  galleryItems,
}: {
  category: ServiceCategory;
  index: number;
  galleryItems: GalleryItem[];
}) {
  const subcategories = category.gallerySubcategories;
  const [activeSubSlug, setActiveSubSlug] = useState<string>(
    subcategories[0]?.slug || ""
  );

  const reverse = index % 2 === 1;

  const activeSubName =
    subcategories.find((s) => s.slug === activeSubSlug)?.name || activeSubSlug;

  // 1. Check if an image in this category was marked as "Show on Homepage" by admin
  const categoryFeaturedItem = galleryItems.find(
    (item) => item.categorySlug === category.slug && item.isFeatured
  );

  // 2. Fallback: items in active subcategory or general category items
  const subItems = galleryItems.filter(
    (item) =>
      item.categorySlug === category.slug &&
      item.subcategorySlug === activeSubSlug
  );

  const displayItem =
    categoryFeaturedItem ||
    subItems[0] ||
    galleryItems.find((i) => i.categorySlug === category.slug);

  const displayImage =
    displayItem?.imageUrl ||
    category.defaultImageUrl ||
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200";

  const displayTitle = displayItem?.title || `${activeSubName} Showcase`;

  return (
    <FadeIn>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${
          reverse ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        {/* Image panel */}
        <div className="aspect-[4/5] bg-charcoal/5 overflow-hidden group relative shadow-lg rounded-sm">
          <img
            src={displayImage}
            alt={displayTitle}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/20 to-transparent flex flex-col justify-end p-6 text-ivory">
            <span className="text-[10px] uppercase tracking-widest2 text-accent font-semibold mb-1">
              {category.name}
            </span>
            <h4 className="font-display text-xl font-light">{displayTitle}</h4>
          </div>
        </div>

        {/* Info + subcategory pills */}
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-widest2 text-accent mb-2 font-semibold">
            {String(index + 1).padStart(2, "0")} — {category.name}
          </p>
          <h3 className="font-display text-3xl md:text-4xl font-light mb-4">
            {category.tagline}
          </h3>
          <p className="text-charcoal/60 text-sm mb-6 leading-relaxed">
            {category.intro}
          </p>

          <Link
            to={`/services/${category.slug}`}
            className="inline-flex items-center text-xs uppercase tracking-widest2 text-charcoal font-semibold border-b border-charcoal/30 pb-1 hover:border-accent hover:text-accent transition-colors self-start mt-2"
          >
            Explore All {category.name} Work →
          </Link>
        </div>
      </div>
    </FadeIn>
  );
}

// ─── Footer CTA ───────────────────────────────────────────────────────────────

function CustomEventSection() {
  return (
    <section className="bg-charcoal text-ivory py-32">
      <div className="max-w-4xl mx-auto text-center px-6">
        <FadeIn>
          <p className="text-xs uppercase tracking-widest2 text-accent mb-4">
            Have Something Different In Mind?
          </p>
          <h2 className="font-display text-3xl md:text-5xl font-light mb-6 leading-tight">
            Every celebration is different. If you have a unique idea, theme or
            requirement, tell us.
          </h2>
          <p className="text-ivory/60 mb-10">
            We're ready to create something customized for you.
          </p>
          <Link to="/contact">
            <Button
              variant="outline"
              className="!border-ivory/30 !text-ivory hover:!border-accent hover:!text-accent"
            >
              Create Something New
            </Button>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
