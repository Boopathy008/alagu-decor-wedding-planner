export const site = {
  name: "Alagu Decor & Wedding Planner",
  brandLine1: "ALAGU",
  brandLine2: "DECOR & WEDDING PLANNER",
  message: import.meta.env.VITE_BRAND_MESSAGE || "Your Vision. Our Creation.",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  whatsappNumber: "919095794840",
  instagramUrl: import.meta.env.VITE_INSTAGRAM_URL || "",
} as const;

/**
 * Builds a wa.me deep link. Falls back to a generic message when no
 * context-specific message is supplied (e.g. from a category page).
 */
export function buildWhatsAppLink(contextMessage?: string): string {
  const defaultMessage =
    "Hi Alagu Decor & Wedding Planner, I'm interested in your services and would like to discuss my event.";
  const text = encodeURIComponent(contextMessage || defaultMessage);
  return `https://wa.me/${site.whatsappNumber}?text=${text}`;
}
