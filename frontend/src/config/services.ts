/**
 * FIXED SERVICE STRUCTURE.
 *
 * This file is the single source of truth for the 7 service categories and
 * their subcategories/services. It intentionally has no admin-facing CRUD:
 * per the spec, the admin manages gallery *content*, never this structure.
 * The backend seeds an identical, immutable copy of these slugs into
 * `gallery_categories` / `gallery_subcategories` (see database/schema.sql) so
 * the two stay in lockstep.
 */

export interface ServiceDefinition {
  name: string;
}

export interface SubcategoryDefinition {
  slug: string;
  name: string;
}

export interface ServiceCategory {
  slug: string;
  name: string;
  tagline: string;
  intro: string;
  services: ServiceDefinition[];
  gallerySubcategories: SubcategoryDefinition[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "decorations",
    name: "Decorations",
    tagline: "Spaces transformed into experiences.",
    intro:
      "From an intimate haldi to a thousand-guest reception, every decoration we build is designed around one idea: the space should feel like it was made only for you.",
    services: [
      { name: "Wedding Decorations" },
      { name: "Engagement Decorations" },
      { name: "Haldi Function Decorations" },
      { name: "Reception Decorations" },
      { name: "Corporate Event Decorations" },
      { name: "Stage Decorations" },
      { name: "Entrance Decorations" },
      { name: "Floral Decorations" },
      { name: "Theme-Based Decorations" },
      { name: "Custom Decorations" },
    ],
    gallerySubcategories: [
      { slug: "wedding", name: "Wedding" },
      { slug: "engagement", name: "Engagement" },
      { slug: "haldi", name: "Haldi" },
      { slug: "reception", name: "Reception" },
      { slug: "corporate", name: "Corporate" },
      { slug: "entrance", name: "Entrance" },
    ],
  },
  {
    slug: "event-production",
    name: "Event Production",
    tagline: "The technical craft behind every unforgettable moment.",
    intro:
      "Sound, light and screen — engineered so the technical layer of your event disappears and only the experience remains.",
    services: [
      { name: "Audio Setup" },
      { name: "Professional Sound Systems" },
      { name: "Lighting Setup" },
      { name: "Decorative Lighting" },
      { name: "Stage Lighting" },
      { name: "DJ Setup" },
      { name: "LED Screens" },
      { name: "Event Technical Setup" },
    ],
    gallerySubcategories: [
      { slug: "lighting", name: "Lighting" },
      { slug: "dj", name: "DJ Setup" },
      { slug: "led-screens", name: "LED Screens" },
    ],
  },
  {
    slug: "food-hospitality",
    name: "Food & Hospitality",
    tagline: "Hospitality that guests remember as much as the ceremony.",
    intro:
      "Curated catering and live counters, built around your cuisine, your guest count and your venue.",
    services: [
      { name: "Catering Services" },
      { name: "Food Stalls" },
      { name: "Live Food Counters" },
      { name: "Beverage Counters" },
      { name: "Buffet Setup" },
      { name: "Dessert Counters" },
      { name: "Customized Food Arrangements" },
    ],
    gallerySubcategories: [
      { slug: "catering", name: "Catering" },
      { slug: "live-counters", name: "Live Counters" },
      { slug: "beverages", name: "Beverages" },
      { slug: "desserts", name: "Desserts" },
    ],
  },
  {
    slug: "entertainment",
    name: "Entertainment",
    tagline: "Moments your guests will talk about long after.",
    intro:
      "Interactive games and live performances designed to keep every generation of your guest list engaged.",
    services: [
      { name: "Entertainment Games" },
      { name: "Couple Games" },
      { name: "Guest Activities" },
      { name: "Interactive Games" },
      { name: "Live Performances" },
      { name: "Event Experiences" },
    ],
    gallerySubcategories: [
      { slug: "couple-games", name: "Couple Games" },
      { slug: "guest-activities", name: "Guest Activities" },
      { slug: "live-performances", name: "Live Performances" },
    ],
  },
  {
    slug: "gifts",
    name: "Gifts",
    tagline: "A parting note, designed as carefully as the event itself.",
    intro:
      "Return gifts and favors that carry your event's theme home with every guest.",
    services: [
      { name: "Return Gifts" },
      { name: "Customized Return Gifts" },
      { name: "Wedding Favors" },
      { name: "Personalized Gifts" },
      { name: "Guest Welcome Gifts" },
    ],
    gallerySubcategories: [
      { slug: "return-gifts", name: "Return Gifts" },
      { slug: "favors", name: "Favors" },
      { slug: "welcome-gifts", name: "Welcome Gifts" },
    ],
  },
  {
    slug: "music-and-entries",
    name: "Music & Entries",
    tagline: "The entrance that sets the tone for everything after it.",
    intro:
      "From a traditional band to a fully choreographed special entry, your entrance is where the story begins.",
    services: [
      { name: "Band Music" },
      { name: "Live Band" },
      { name: "Traditional Music" },
      { name: "Bride Entry" },
      { name: "Groom Entry" },
      { name: "Couple Entry" },
      { name: "Special Entry Concepts" },
    ],
    gallerySubcategories: [
      { slug: "band", name: "Band" },
      { slug: "bride-entry", name: "Bride Entry" },
      { slug: "groom-entry", name: "Groom Entry" },
      { slug: "couple-entry", name: "Couple Entry" },
      { slug: "special-entries", name: "Special Entries" },
    ],
  },
  {
    slug: "photography",
    name: "Photography",
    tagline: "Every frame, a document of a moment that won't repeat.",
    intro:
      "Candid, traditional and cinematic coverage across your entire event calendar — engagement to reception.",
    services: [
      { name: "Wedding Photography" },
      { name: "Engagement Photography" },
      { name: "Event Photography" },
      { name: "Candid Photography" },
      { name: "Traditional Photography" },
      { name: "Pre-Wedding Photography" },
      { name: "Event Videography" },
    ],
    gallerySubcategories: [
      { slug: "wedding", name: "Wedding" },
      { slug: "engagement", name: "Engagement" },
      { slug: "candid", name: "Candid" },
      { slug: "traditional", name: "Traditional" },
      { slug: "pre-wedding", name: "Pre-Wedding" },
      { slug: "videography", name: "Videography" },
    ],
  },
];

export function getCategoryBySlug(slug: string): ServiceCategory | undefined {
  return serviceCategories.find((c) => c.slug === slug);
}
