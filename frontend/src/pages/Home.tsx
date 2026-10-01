import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { serviceCategories, type ServiceCategory } from "@/config/services";
import { site } from "@/config/site";
import { FadeIn, Button } from "@/components/ui/Primitives";
import { WhatsAppButton } from "@/components/layout/Chrome";
import { fetchAllGalleryItems } from "@/services/api";
import type { GalleryItem } from "@/types";

export default function Home() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    fetchAllGalleryItems()
      .then(setGalleryItems)
      .catch(() => setGalleryItems([]));
  }, []);

  return (
    <div>
      <CinematicHero />

      <section className="max-w-4xl mx-auto px-6 py-28 text-center">
        <FadeIn>
          <p className="text-xl md:text-3xl text-charcoal/80 leading-relaxed font-display font-light">
            Crafting unforgettable weddings &amp; grand celebrations with complete end-to-end design, decoration, and seamless event management.
          </p>
        </FadeIn>
      </section>

      {/* Dynamic Visual Storytelling for all 7 categories */}
      <section className="max-w-7xl mx-auto px-6 pb-28 space-y-28">
        {serviceCategories.map((cat, i) => (
          <CategoryInteractiveSection
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

function CategoryInteractiveSection({
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

  // Items in this category
  const categoryItems = galleryItems.filter(
    (item) => item.categorySlug === category.slug
  );

  // 1. First priority: The ONE globally featured image for this category
  const globallyFeatured = categoryItems.find((item) => item.isFeatured);

  // 2. Items in the selected subcategory
  const subItems = categoryItems.filter(
    (item) => item.subcategorySlug === activeSubSlug
  );

  // 3. Resolve display image:
  //    - If a global featured image exists for this category, use it as the main cover
  //    - If the subcategory pill selected matches the featured item's subcategory, also use it
  //    - Otherwise use the first published item in the selected subcategory
  const featuredForActiveSub = subItems.find((item) => item.isFeatured);
  const activeItem =
    featuredForActiveSub ||          // featured image in active subcategory
    globallyFeatured ||              // any featured image in this category
    subItems[0] ||                   // first published item in active subcategory
    categoryItems[0];                // any published item in this category

  const displayImage =
    activeItem?.imageUrl ||
    category.defaultImageUrl ||
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200";

  const displayTitle = activeItem?.title || `${activeSubName} Showcase`;

  return (
    <FadeIn>
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${
          reverse ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        {/* Dynamic Image Display with Framer Motion transition */}
        <div className="aspect-[4/5] bg-charcoal/5 overflow-hidden group relative shadow-lg rounded-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubSlug + (activeItem?.id || "default")}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full relative"
            >
              <img
                src={displayImage}
                alt={displayTitle}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/20 to-transparent flex flex-col justify-end p-6 text-ivory">
                {activeItem?.isFeatured && (
                  <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold mb-1">
                    ★ Featured Cover
                  </span>
                )}
                <span className="text-[10px] uppercase tracking-widest2 text-accent font-semibold mb-1">
                  {category.name} — {activeSubName}
                </span>
                <h4 className="font-display text-xl font-light">{displayTitle}</h4>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Interactive Subcategory Pills & Info */}
        <div className="flex flex-col justify-center">
          <p className="text-xs uppercase tracking-widest2 text-accent mb-2 font-semibold">
            {String(index + 1).padStart(2, "0")} — {category.name}
          </p>
          <h3 className="font-display text-3xl md:text-4xl font-light mb-4">
            {category.tagline}
          </h3>
          <p className="text-charcoal/60 text-sm mb-6 leading-relaxed">{category.intro}</p>

          {/* Interactive Subcategory Pills */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-widest2 text-charcoal/40 mb-3 font-semibold">
              Select Subcategory to View:
            </p>
            <div className="flex flex-wrap gap-2">
              {subcategories.map((sub) => {
                const isActive = activeSubSlug === sub.slug;
                const hasCustomItem = galleryItems.some(
                  (i) => i.categorySlug === category.slug && i.subcategorySlug === sub.slug
                );
                return (
                  <button
                    key={sub.slug}
                    onClick={() => setActiveSubSlug(sub.slug)}
                    className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider transition-all duration-300 border ${
                      isActive
                        ? "bg-charcoal text-ivory border-charcoal shadow-sm"
                        : "bg-white text-charcoal/70 border-charcoal/20 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {sub.name} {hasCustomItem ? "✦" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          <Link
            to={`/services/${category.slug}`}
            className="inline-flex items-center text-xs uppercase tracking-widest2 text-charcoal font-semibold border-b border-charcoal/30 pb-1 hover:border-accent hover:text-accent transition-colors self-start"
          >
            Explore All {category.name} Work →
          </Link>
        </div>
      </div>
    </FadeIn>
  );
}

function CinematicHero() {
  return (
    <section className="relative h-screen min-h-[640px] flex flex-col items-center justify-center bg-deep text-ivory overflow-hidden">
      <motion.div
        initial={{ scale: 1.15, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 bg-gradient-to-b from-deep/40 via-deep/70 to-deep"
      />

      <div className="relative z-10 text-center px-6">
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.35em" }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs uppercase tracking-widest2 text-accent mb-6"
        >
          Wedding &amp; Event Studio
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-6xl md:text-9xl leading-[0.95] font-light"
        >
          {site.brandLine1}
          <br />
          <span className="text-3xl md:text-5xl text-ivory/60">{site.brandLine2}</span>
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
            <Button variant="outline" className="!border-ivory/30 !text-ivory hover:!border-accent hover:!text-accent">
              Create Something New
            </Button>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
