import { SectionHeading, FadeIn } from "@/components/ui/Primitives";
import { WhatsAppButton } from "@/components/layout/Chrome";
import { site, buildWhatsAppLink } from "@/config/site";

export default function About() {
  return (
    <div>
      <section className="max-w-5xl mx-auto px-6 py-24">
        <SectionHeading eyebrow="About Us" title="Alagu Decor & Wedding Planner" />
        <FadeIn className="mt-8">
          <p className="font-display text-2xl md:text-3xl font-light leading-relaxed text-charcoal/80">
            We started as decorators. Today we're a full production studio —
            because the couples and families we work with kept asking for more
            than décor. They wanted one team that understood the whole day.
          </p>
        </FadeIn>
        <FadeIn delay={0.1} className="mt-10 max-w-2xl text-charcoal/60 space-y-4">
          <p>
            {site.name} plans and produces weddings and events across
            decorations, technical production, food and hospitality,
            entertainment, gifting, music and entries, and photography — as one
            coordinated team rather than seven separate vendors.
          </p>
          <p>
            Every project starts the same way: understanding what you actually
            want your event to feel like, then building the decor, the sound,
            the food and the photography around that single idea.
          </p>
        </FadeIn>
      </section>

      <section className="bg-charcoal text-ivory py-24">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            ["7", "Disciplines Under One Roof"],
            ["100%", "Custom Concepts"],
            ["1", "Dedicated Event Team"],
            ["∞", "Ways We'll Tailor It"],
          ].map(([stat, label]) => (
            <div key={label}>
              <p className="font-display text-4xl md:text-5xl text-accent">{stat}</p>
              <p className="mt-2 text-xs uppercase tracking-widest2 text-ivory/50">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <FadeIn>
          <p className="font-display text-2xl md:text-3xl font-light mb-4">
            Let's talk about your event.
          </p>
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noreferrer"
            className="text-xs uppercase tracking-widest2 border-b border-charcoal/30 pb-1 hover:border-accent hover:text-accent transition-colors"
          >
            Start a conversation on WhatsApp
          </a>
        </FadeIn>
      </section>

      <WhatsAppButton />
    </div>
  );
}
