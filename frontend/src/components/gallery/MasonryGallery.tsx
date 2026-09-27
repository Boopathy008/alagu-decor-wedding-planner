import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { GalleryItem } from "@/types";
import type { SubcategoryDefinition } from "@/config/services";

interface Props {
  items: GalleryItem[];
  subcategories: SubcategoryDefinition[];
}

export function MasonryGallery({ items, subcategories }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered =
    activeFilter === "all"
      ? items
      : items.filter((item) => item.subcategorySlug === activeFilter);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-10">
        <FilterPill
          active={activeFilter === "all"}
          label="All"
          onClick={() => setActiveFilter("all")}
        />
        {subcategories.map((sub) => (
          <FilterPill
            key={sub.slug}
            active={activeFilter === sub.slug}
            label={sub.name}
            onClick={() => setActiveFilter(sub.slug)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, idx) => (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setLightboxIndex(idx)}
              className="block w-full aspect-[4/3] overflow-hidden group relative"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-deep/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-5">
                <p className="text-ivory text-base font-display transform translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                  {item.title}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            items={filtered}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-xs uppercase tracking-widest2 transition-colors duration-300 border ${
        active
          ? "bg-charcoal text-ivory border-charcoal"
          : "border-charcoal/20 text-charcoal/70 hover:border-accent hover:text-accent"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="py-24 text-center border border-dashed border-charcoal/20">
      <p className="font-display text-2xl text-charcoal/60">
        This gallery is being curated.
      </p>
      <p className="mt-2 text-sm text-charcoal/40">
        New work from this category will appear here shortly.
      </p>
    </div>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const item = items[index];
  const goPrev = () => onNavigate((index - 1 + items.length) % items.length);
  const goNext = () => onNavigate((index + 1) % items.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 bg-deep/95 flex flex-col items-center justify-center p-4 md:p-12"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-ivory/70 hover:text-ivory text-sm uppercase tracking-widest2"
      >
        Close ✕
      </button>

      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-5xl w-full flex flex-col items-center"
      >
        <img
          src={item.imageUrl}
          alt={item.title}
          className="max-h-[75vh] w-auto object-contain"
        />
        <div className="mt-6 text-center">
          <p className="text-ivory font-display text-xl">{item.title}</p>
          <p className="text-ivory/50 text-xs uppercase tracking-widest2 mt-1">
            {item.subcategoryName}
          </p>
        </div>
      </motion.div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 text-ivory/60 hover:text-ivory text-3xl"
        aria-label="Previous image"
      >
        ‹
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 text-ivory/60 hover:text-ivory text-3xl"
        aria-label="Next image"
      >
        ›
      </button>
    </motion.div>
  );
}
