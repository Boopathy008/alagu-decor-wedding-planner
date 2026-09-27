import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getCategoryBySlug } from "@/config/services";
import { SectionHeading, FadeIn, Button } from "@/components/ui/Primitives";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";
import { WhatsAppButton } from "@/components/layout/Chrome";
import { fetchGalleryByCategory } from "@/services/api";
import type { GalleryItem } from "@/types";

export default function ServiceCategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined;
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    fetchGalleryByCategory(category.slug)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [category?.slug]);

  if (!category) return <Navigate to="/services" replace />;

  const whatsappMessage = `I'm interested in your ${category.name} services. I'd like to discuss my requirements.`;

  return (
    <div>
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20">
        <SectionHeading eyebrow="Services" title={category.name.toUpperCase()} />
        <p className="mt-6 font-display text-2xl italic text-charcoal/70">
          "{category.tagline}"
        </p>
        <p className="mt-4 max-w-2xl text-charcoal/60">{category.intro}</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-charcoal/10">
            {category.services.map((s) => (
              <div key={s.name} className="bg-ivory p-6">
                <p className="text-sm font-display">{s.name}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-32">
        <SectionHeading eyebrow="Portfolio" title={`Our ${category.name} Work`} />
        <div className="mt-10">
          {loading ? (
            <GallerySkeleton />
          ) : (
            <MasonryGallery items={items} subcategories={category.gallerySubcategories} />
          )}
        </div>
      </section>

      <section className="bg-charcoal text-ivory py-24">
        <div className="max-w-3xl mx-auto text-center px-6">
          <p className="font-display text-2xl md:text-3xl font-light mb-8">
            Ready to talk through your {category.name.toLowerCase()} requirements?
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline" className="!border-ivory/30 !text-ivory hover:!border-accent hover:!text-accent">
                Chat on WhatsApp
              </Button>
            </a>
            <Link to="/contact">
              <Button variant="solid" className="!bg-accent">
                Send an Enquiry
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <WhatsAppButton contextMessage={whatsappMessage} />
    </div>
  );
}

function GallerySkeleton() {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="w-full mb-4 break-inside-avoid bg-charcoal/5 animate-pulse"
          style={{ height: 200 + (i % 3) * 80 }}
        />
      ))}
    </div>
  );
}
