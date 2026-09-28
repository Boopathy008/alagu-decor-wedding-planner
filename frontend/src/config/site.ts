export const site = {
  name: "Azhagu Decor & Wedding Planner",
  brandLine1: "AZHAGU",
  brandLine2: "DECOR & WEDDING PLANNER",
  message: import.meta.env.VITE_BRAND_MESSAGE || "Your Vision. Our Creation.",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  whatsappNumber: "919095794840",
  phone1: "9095794840",
  phone2: "9715887562",
  instagramUrl: "https://www.instagram.com/azhagu_decor_wedding_planer?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==",
  address: "Near SRR Mahal, Kuthukalvalasai, Tenkasi",
} as const;

/**
 * Builds a wa.me deep link. Falls back to a generic message when no
 * context-specific message is supplied (e.g. from a category page).
 */
export function buildWhatsAppLink(contextMessage?: string): string {
  const defaultMessage =
    "Hi Azhagu Decor & Wedding Planner, I'm interested in your services and would like to discuss my event.";
  const text = encodeURIComponent(contextMessage || defaultMessage);
  return `https://wa.me/${site.whatsappNumber}?text=${text}`;
}
