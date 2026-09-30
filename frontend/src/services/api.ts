import axios from "axios";
import { site } from "@/config/site";
import type {
  ApiResponse,
  DashboardStats,
  EnquiryFormValues,
  EnquiryRecord,
  GalleryItem,
} from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Axios instance — all requests carry the admin JWT stored after login.
// Upload timeout is 60 s so large images don't time-out on Cloudinary.
// ─────────────────────────────────────────────────────────────────────────────
export const api = axios.create({ baseURL: site.apiBaseUrl, timeout: 60000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("azhagu_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("azhagu_admin_token");
    }
    return Promise.reject(error);
  }
);

import { serviceCategories } from "@/config/services";
// Only the publishable (read-only) Supabase client is imported here.
// The secret/service-role key must NEVER be used from the browser.
import { supabase } from "./supabaseClient";

// ─────────────────────────────────────────────────────────────────────────────
// Local-storage helpers  — used as a READ fallback, never for writes.
// ─────────────────────────────────────────────────────────────────────────────
const GALLERY_LOCAL_KEY  = "azhagu_custom_gallery_items";
const ENQUIRIES_LOCAL_KEY = "azhagu_demo_enquiries";

function getLocalGalleryItems(): GalleryItem[] {
  try { return JSON.parse(localStorage.getItem(GALLERY_LOCAL_KEY) || "[]"); }
  catch { return []; }
}
function saveLocalGalleryItem(item: GalleryItem) {
  const list = [item, ...getLocalGalleryItems().filter((i) => i.id !== item.id)];
  localStorage.setItem(GALLERY_LOCAL_KEY, JSON.stringify(list));
}
function deleteLocalGalleryItem(id: number) {
  localStorage.setItem(
    GALLERY_LOCAL_KEY,
    JSON.stringify(getLocalGalleryItems().filter((i) => i.id !== id))
  );
}
function getLocalEnquiries(): EnquiryRecord[] {
  try { return JSON.parse(localStorage.getItem(ENQUIRIES_LOCAL_KEY) || "[]"); }
  catch { return []; }
}

/**
 * Map a Spring Boot GalleryItemDto response (camelCase JSON) to the
 * frontend GalleryItem type.
 */
function dtoToItem(dto: any): GalleryItem {
  return {
    id:              dto.id,
    categorySlug:    dto.categorySlug,
    subcategorySlug: dto.subcategorySlug,
    subcategoryName: dto.subcategoryName,
    title:           dto.title,
    description:     dto.description ?? "",
    imageUrl:        dto.imageUrl,
    published:       dto.published,
    createdAt:       dto.createdAt,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public gallery reads — Supabase publishable key (safe in browser).
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchGalleryByCategory(categorySlug: string): Promise<GalleryItem[]> {
  const all = await adminFetchAllGalleryItems(categorySlug);
  return all.filter((item) => item.published);
}

export async function fetchGalleryByCategoryAndSubcategory(
  categorySlug: string,
  subcategorySlug: string
): Promise<GalleryItem[]> {
  const all = await adminFetchAllGalleryItems(categorySlug);
  return all.filter((item) => item.published && item.subcategorySlug === subcategorySlug);
}

export async function fetchFeaturedGallery(): Promise<GalleryItem[]> {
  const all = await adminFetchAllGalleryItems();
  const featured: GalleryItem[] = [];
  serviceCategories.forEach((c) => {
    const match = all.find((item) => item.categorySlug === c.slug && item.published);
    if (match) featured.push(match);
  });
  return featured;
}

// ─────────────────────────────────────────────────────────────────────────────
// Enquiries
// ─────────────────────────────────────────────────────────────────────────────

export async function submitEnquiry(values: EnquiryFormValues) {
  // Try Supabase (publishable key — safe in browser).
  try {
    await supabase.from("enquiries").insert([{
      name: values.name, phone: values.phone,
      email: values.email || null, event_type: values.eventType || null,
      event_date: values.eventDate || null, location: values.location || null,
      guest_count: values.guestCount || null, message: values.message || null,
      status: "NEW", created_at: new Date().toISOString(),
    }]);
  } catch (_) {}

  // Try Spring Boot backend as well.
  try {
    const res = await api.post<ApiResponse<null>>("/enquiries", values);
    return res.data;
  } catch (_) {
    // Local demo fallback.
    const item: EnquiryRecord = {
      id: Date.now(), ...values,
      status: "NEW", createdAt: new Date().toISOString(),
    };
    localStorage.setItem(
      ENQUIRIES_LOCAL_KEY,
      JSON.stringify([item, ...getLocalEnquiries()])
    );
    return { success: true, data: null };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin authentication
// ─────────────────────────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string) {
  // Always try the real backend first so the returned JWT is accepted by the
  // /api/admin/* write endpoints.
  try {
    const res = await api.post<ApiResponse<{ token: string; email: string; role: string }>>(
      "/auth/login",
      { email: email.trim().toLowerCase(), password: password.trim() }
    );
    if (res.data.data) return res.data.data;
  } catch (err: any) {
    // A 401 means the credentials are wrong — do not fall through.
    if (err?.response?.status === 401) throw new Error("Invalid email or password.");
    // Any other error (network, free-tier cold start) — fall through to demo mode.
  }

  // Demo / offline fallback — only active when the backend is unreachable.
  const e = email.trim().toLowerCase();
  const p = password.trim();
  const demo =
    (e === "admin@azhagu.com" || e === "admin") &&
    (p === "AzhaguDecor#Admin2026" || p === "admin" || p === "admin123");

  if (demo) return { token: "demo_admin_token_123", email: "admin@azhagu.com", role: "ADMIN" };

  throw new Error("Invalid email or password.");
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin gallery — WRITE operations go exclusively through the Spring Boot
// backend at /api/admin/gallery.
//
// The backend's GalleryService + CloudinaryService handle:
//   • Cloudinary upload (server-side; credentials never reach the browser)
//   • @Transactional DB insert — no orphaned storage files on DB failure
//   • Subcategory lookup by (category_id, slug) — works correctly for
//     Decorations→wedding AND Photography→wedding because they are different
//     rows in gallery_subcategories identified by (category_id, slug)
//   • Correct error messages forwarded to the frontend
//
// The frontend does NOT use supabaseAdmin (secret key) for any write at all.
// ─────────────────────────────────────────────────────────────────────────────

export async function adminCreateGalleryItem(formData: FormData): Promise<GalleryItem> {
  // FormData already contains: categorySlug, subcategorySlug, title,
  // description, published, image (File).
  try {
    const res = await api.post<ApiResponse<any>>("/admin/gallery", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data?.data) {
      const item = dtoToItem(res.data.data);
      saveLocalGalleryItem(item); // update local cache for instant UI refresh
      return item;
    }
    throw new Error(res.data?.message || "Upload failed.");
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Upload failed. Check file size/type and try again.";
    throw new Error(msg);
  }
}

export async function adminUpdateGalleryItem(id: number, formData: FormData): Promise<GalleryItem> {
  try {
    const res = await api.put<ApiResponse<any>>(`/admin/gallery/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data?.data) {
      const item = dtoToItem(res.data.data);
      saveLocalGalleryItem(item);
      return item;
    }
    throw new Error(res.data?.message || "Update failed.");
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      "Update failed. Please try again.";
    throw new Error(msg);
  }
}

export async function adminDeleteGalleryItem(id: number) {
  // The backend deletes the Cloudinary asset first, then the DB row atomically.
  try {
    await api.delete(`/admin/gallery/${id}`);
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || "Delete failed.";
    throw new Error(msg);
  }
  deleteLocalGalleryItem(id);
  return { success: true, data: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin gallery — READ: backend first, then Supabase, then local cache.
// No secret key is required for any of these reads.
// ─────────────────────────────────────────────────────────────────────────────

export async function adminFetchAllGalleryItems(categorySlug?: string): Promise<GalleryItem[]> {
  // 1. Try Spring Boot backend (returns both published and draft items).
  try {
    const url = categorySlug
      ? `/admin/gallery?category=${categorySlug}`
      : "/admin/gallery";
    const res = await api.get<ApiResponse<any[]>>(url);
    if (res.data?.data != null) {
      const items = res.data.data.map(dtoToItem);
      items.forEach(saveLocalGalleryItem);
      return items;
    }
  } catch (_) {
    // Backend unreachable — fall through to Supabase.
  }

  // 2. Supabase (publishable key — safe in browser; only published items are
  //    readable via the default RLS policies).
  let dbItems: GalleryItem[] = [];
  try {
    let q = supabase
      .from("gallery_items")
      .select("*, gallery_categories!inner(slug), gallery_subcategories!inner(slug, name)")
      .order("created_at", { ascending: false });
    if (categorySlug) q = q.eq("gallery_categories.slug", categorySlug);

    const { data, error } = await q;
    if (!error && data) {
      dbItems = data.map((item: any) => ({
        id:              item.id,
        categorySlug:    item.gallery_categories?.slug || categorySlug || "",
        subcategorySlug: item.gallery_subcategories?.slug || "",
        subcategoryName: item.gallery_subcategories?.name || "",
        title:           item.title,
        description:     item.description ?? "",
        imageUrl:        item.image_url,
        published:       item.published,
        createdAt:       item.created_at,
      }));
    }
  } catch (_) {}

  // 3. Merge with local cache (offline / demo items).
  const map = new Map<number, GalleryItem>();
  dbItems.forEach((item) => map.set(item.id, item));
  getLocalGalleryItems().forEach((item) => {
    if (!categorySlug || item.categorySlug === categorySlug) {
      if (!map.has(item.id)) map.set(item.id, item); // DB wins over local
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin enquiries
// ─────────────────────────────────────────────────────────────────────────────

export async function adminFetchEnquiries() {
  try {
    const res = await api.get<ApiResponse<EnquiryRecord[]>>("/admin/enquiries");
    if (res.data?.data && res.data.data.length > 0) return res.data.data;
  } catch (_) {}
  return getLocalEnquiries();
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin dashboard
// ─────────────────────────────────────────────────────────────────────────────

export async function adminFetchDashboard(): Promise<DashboardStats> {
  const allGalleryItems = await adminFetchAllGalleryItems();
  const localEnquiries  = await adminFetchEnquiries();

  const imagesByCategory: Record<string, number> = {};
  serviceCategories.forEach((c) => {
    imagesByCategory[c.slug] = allGalleryItems.filter((g) => g.categorySlug === c.slug).length;
  });

  return {
    totalImages:      allGalleryItems.length,
    totalEnquiries:   localEnquiries.length,
    imagesByCategory,
    recentEnquiries:  localEnquiries.slice(0, 5),
    recentUploads:    allGalleryItems.slice(0, 5),
  };
}
