import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { serviceCategories } from "@/config/services";
import { site } from "@/config/site";
import { FadeIn, Button } from "@/components/ui/Primitives";
import { WhatsAppButton } from "@/components/layout/Chrome";
import { fetchFeaturedGallery } from "@/services/api";
import type { GalleryItem } from "@/types";

export default function Home() {
  const [featured, setFeatured] = useState<GalleryItem[]>([]);

  useEffect(() => {
    fetchFeaturedGallery()
      .then(setFeatured)
      .catch(() => setFeatured([]));
  }, []);

  return (
    <div>
      <CinematicHero />

      <section className="max-w-4xl mx-auto px-6 py-28 text-center">
        <FadeIn>
          <p className="text-xl md:text-3xl text-charcoal/80 leading-relaxed font-display font-light">
            Crafting unforgettable weddings & grand celebrations with complete end-to-end design, decoration, and seamless event management.
          </p>
        </FadeIn>
      </section>

      {/* Visual storytelling through actual categories */}
      <section className="max-w-7xl mx-auto px-6 pb-28 space-y-24">
        {serviceCategories.map((cat, i) => {
          const items = featured.filter((f) => f.categorySlug === cat.slug).slice(0, 1);
          const image = items[0]?.imageUrl;
          const reverse = i % 2 === 1;
          return (
            <FadeIn key={cat.slug}>
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${
                  reverse ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="aspect-[4/5] bg-charcoal/5 overflow-hidden group relative shadow-lg">
                  {image ? (
                    <>
                      <img
                        src={image}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-deep/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 text-ivory">
                        <span className="text-[10px] uppercase tracking-widest2 text-accent mb-1">
                          {cat.name}
                        </span>
                        <h4 className="font-display text-xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          {cat.tagline}
                        </h4>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-charcoal/30 text-sm">
                      Gallery coming soon
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest2 text-accent mb-3">
                    {String(i + 1).padStart(2, "0")} — {cat.name}
                  </p>
                  <h3 className="font-display text-3xl md:text-4xl font-light mb-4">
                    {cat.tagline}
                  </h3>
                  <p className="text-charcoal/60 mb-6">{cat.intro}</p>
                  <Link
                    to={`/services/${cat.slug}`}
                    className="text-xs uppercase tracking-widest2 border-b border-charcoal/30 pb-1 hover:border-accent hover:text-accent transition-colors"
                  >
                    Explore {cat.name}
                  </Link>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </section>

      <CustomEventSection />
      <WhatsAppButton />
    </div>
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
          Wedding & Event Studio
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
