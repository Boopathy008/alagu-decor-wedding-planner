import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { serviceCategories } from "@/config/services";
import { SectionHeading, FadeIn } from "@/components/ui/Primitives";
import { WhatsAppButton } from "@/components/layout/Chrome";
import { fetchFeaturedGallery } from "@/services/api";
import type { GalleryItem } from "@/types";

export default function OurWork() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedGallery()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <SectionHeading eyebrow="Portfolio" title="Our Work" />
      <p className="mt-6 max-w-xl text-charcoal/60">
        A selection across every discipline we work in. Explore a full,
        filterable gallery within any category below.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        {serviceCategories.map((c) => (
          <Link
            key={c.slug}
            to={`/services/${c.slug}`}
            className="text-xs uppercase tracking-widest2 px-4 py-2 border border-charcoal/20 hover:border-accent hover:text-accent transition-colors"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="w-full aspect-[4/3] bg-charcoal/5 animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-charcoal/20">
            <p className="font-display text-2xl text-charcoal/60">
              Our portfolio is being curated.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, i) => (
              <FadeIn key={item.id} delay={(i % 6) * 0.05}>
                <Link to={`/services/${item.categorySlug}`} className="block w-full aspect-[4/3] group overflow-hidden relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-cinematic group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                    <p className="text-ivory text-sm font-display">{item.title}</p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </div>

      <WhatsAppButton />
    </div>
  );
}
