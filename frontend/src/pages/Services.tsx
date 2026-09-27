import { Link } from "react-router-dom";
import { serviceCategories } from "@/config/services";
import { SectionHeading, FadeIn } from "@/components/ui/Primitives";

export default function Services() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <SectionHeading eyebrow="What We Do" title="Services" />
      <p className="mt-6 max-w-xl text-charcoal/60">
        Seven disciplines, one studio. Every event we take on draws from all
        of them, tailored to what your celebration actually needs.
      </p>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-px bg-charcoal/10">
        {serviceCategories.map((cat, i) => (
          <FadeIn key={cat.slug} delay={i * 0.05}>
            <Link
              to={`/services/${cat.slug}`}
              className="group block bg-ivory p-10 h-full hover:bg-charcoal hover:text-ivory transition-colors duration-500"
            >
              <p className="text-xs uppercase tracking-widest2 text-accent mb-4">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="font-display text-2xl md:text-3xl font-light mb-3">
                {cat.name}
              </h3>
              <p className="text-sm opacity-60 mb-6">{cat.tagline}</p>
              <span className="text-xs uppercase tracking-widest2 group-hover:text-accent">
                View Services →
              </span>
            </Link>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
