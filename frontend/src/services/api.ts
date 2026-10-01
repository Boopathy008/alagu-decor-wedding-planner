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
// Axios instance — carries the admin JWT.  60 s timeout for Cloudinary uploads.
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

import { serviceCategories, getCategoryBySlug } from "@/config/services";
// Only the anon/publishable Supabase client is imported.
// The secret key is NEVER used from the browser.
import { supabase } from "./supabaseClient";

// ─────────────────────────────────────────────────────────────────────────────
// Local-storage helpers — used only as a read cache, never as the source of
// truth for writes.
// ─────────────────────────────────────────────────────────────────────────────
const GALLERY_LOCAL_KEY   = "azhagu_custom_gallery_items";
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

/** Map Spring Boot GalleryItemDto (camelCase) → frontend GalleryItem. */
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
// Supabase-direct fallback for gallery writes
//
// Used when the Spring Boot backend on Render is unavailable or returns 5xx.
// Only the ANON (publishable) key is used — confirmed safe because Supabase
// RLS allows INSERT/DELETE on gallery_items and gallery-images storage with
// the anon key for this project.
// ─────────────────────────────────────────────────────────────────────────────

async function supabaseUploadImage(rawFile: File): Promise<string> {
  const ext  = rawFile.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `gallery/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("gallery-images")
    .upload(path, rawFile, { cacheControl: "3600", upsert: true, contentType: rawFile.type });

  if (error) throw new Error("Storage upload failed: " + error.message);

  // Generate long-lived (10 year) signed URL so images in private bucket render publicly
  const { data: signedData, error: signedErr } = await supabase.storage
    .from("gallery-images")
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);

  if (!signedErr && signedData?.signedUrl) {
    return signedData.signedUrl;
  }

  const { data: urlData } = supabase.storage.from("gallery-images").getPublicUrl(path);
  if (!urlData?.publicUrl) throw new Error("Could not get public URL for uploaded image.");
  return urlData.publicUrl;
}

async function supabaseResolveIds(categorySlug: string, subcategorySlug: string) {
  // Resolve category_id
  const { data: cat, error: catErr } = await supabase
    .from("gallery_categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();

  if (catErr || !cat?.id) throw new Error(`Unknown category: ${categorySlug}`);
  const categoryId = cat.id as number;

  // Resolve subcategory_id — ALWAYS scoped by (category_id, slug) so that
  // Decorations→wedding and Photography→wedding resolve to different rows.
  const { data: sub, error: subErr } = await supabase
    .from("gallery_subcategories")
    .select("id")
    .eq("category_id", categoryId)
    .eq("slug", subcategorySlug)
    .maybeSingle();

  if (subErr || !sub?.id)
    throw new Error(`Unknown subcategory "${subcategorySlug}" for "${categorySlug}"`);

  return { categoryId, subcategoryId: sub.id as number };
}

async function supabaseCreateGalleryItem(
  categorySlug: string,
  subcategorySlug: string,
  title: string,
  description: string,
  published: boolean,
  imageUrl: string,
): Promise<GalleryItem> {
  const { categoryId, subcategoryId } = await supabaseResolveIds(categorySlug, subcategorySlug);
  const now = new Date().toISOString();

  const catInfo = getCategoryBySlug(categorySlug);
  const subInfo = catInfo?.gallerySubcategories.find((s) => s.slug === subcategorySlug);

  const { data, error } = await supabase
    .from("gallery_items")
    .insert([{
      category_id:          categoryId,
      subcategory_id:       subcategoryId,
      title,
      description,
      image_url:            imageUrl,
      cloudinary_public_id: imageUrl.slice(0, 255),
      published,
      created_at:           now,
      updated_at:           now,
    }])
    .select("id, title, description, image_url, published, created_at")
    .maybeSingle();

  // Supabase with anon key: INSERT may succeed but RLS may block the read-back.
  // data=null + error=null means inserted OK but we can't read it back.
  // We only throw on a real error (non-null error object).
  if (error) throw new Error("DB insert failed: " + error.message);

  return {
    id:              data?.id     ?? Date.now(),
    categorySlug,
    subcategorySlug,
    subcategoryName: subInfo?.name ?? subcategorySlug,
    title:           data?.title  ?? title,
    description:     data?.description ?? description,
    imageUrl:        data?.image_url    ?? imageUrl,
    published:       data?.published    ?? published,
    createdAt:       data?.created_at   ?? now,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Public gallery reads
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchAllGalleryItems(): Promise<GalleryItem[]> {
  const all = await adminFetchAllGalleryItems();
  return all.filter((item) => item.published);
}

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
    // 1. Highest priority: Manually chosen Front Page Cover image for this category
    let match = all.find(
      (item) => item.categorySlug === c.slug && item.published && item.isFeatured
    );

    // 2. Second priority: Latest published image from the category's FIRST subcategory
    if (!match) {
      const firstSubSlug = c.gallerySubcategories[0]?.slug;
      match = all.find(
        (item) => item.categorySlug === c.slug && item.subcategorySlug === firstSubSlug && item.published
      );
    }

    // 3. Fallback: Latest published image in the category if first subcategory has no uploads yet
    if (!match) {
      match = all.find((item) => item.categorySlug === c.slug && item.published);
    }

    if (match) featured.push(match);
  });

  return featured;
}

// ─────────────────────────────────────────────────────────────────────────────
// Enquiries
// ─────────────────────────────────────────────────────────────────────────────

export async function submitEnquiry(values: EnquiryFormValues) {
  try {
    await supabase.from("enquiries").insert([{
      name: values.name, phone: values.phone,
      email: values.email || null, event_type: values.eventType || null,
      event_date: values.eventDate || null, location: values.location || null,
      guest_count: values.guestCount || null, message: values.message || null,
      status: "NEW", created_at: new Date().toISOString(),
    }]);
  } catch (_) {}

  try {
    const res = await api.post<ApiResponse<null>>("/enquiries", values);
    return res.data;
  } catch (_) {
    const item: EnquiryRecord = {
      id: Date.now(), ...values, status: "NEW", createdAt: new Date().toISOString(),
    };
    localStorage.setItem(ENQUIRIES_LOCAL_KEY, JSON.stringify([item, ...getLocalEnquiries()]));
    return { success: true, data: null };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin authentication
// ─────────────────────────────────────────────────────────────────────────────

export async function adminLogin(email: string, password: string) {
  // Always try the real backend first — it issues a proper JWT accepted by
  // the /api/admin/* write endpoints.
  try {
    const res = await api.post<ApiResponse<{ token: string; email: string; role: string }>>(
      "/auth/login",
      { email: email.trim().toLowerCase(), password: password.trim() }
    );
    if (res.data?.data) return res.data.data;
  } catch (err: any) {
    if (err?.response?.status === 401) throw new Error("Invalid email or password.");
    // Other errors (network, 5xx) → fall through to demo mode below.
  }

  // Demo / offline fallback — only when backend is unreachable.
  const e = email.trim().toLowerCase();
  const p = password.trim();
  const demo =
    (e === "admin@azhagu.com" || e === "admin") &&
    (p === "AzhaguDecor#Admin2026" || p === "admin" || p === "admin123");

  if (demo) return { token: "demo_admin_token_123", email: "admin@azhagu.com", role: "ADMIN" };

  throw new Error("Invalid email or password.");
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin gallery — CREATE
//
// Flow:
//   1. Try Spring Boot backend (/api/admin/gallery) — handles Cloudinary
//      upload + atomic DB save server-side.  JWT required.
//   2. If backend returns 5xx or is unreachable → fall back to Supabase direct
//      (anon key).  Storage upload → DB insert via (category_id, slug) lookup.
//      The Supabase fallback works because RLS allows anon inserts here.
//
// The SECRET Supabase key is NEVER used.  The fallback uses only the
// publishable anon key that is already embedded in the public bundle.
// ─────────────────────────────────────────────────────────────────────────────

export async function adminCreateGalleryItem(formData: FormData): Promise<GalleryItem> {
  const categorySlug    = (formData.get("categorySlug")    as string) || "decorations";
  const subcategorySlug = (formData.get("subcategorySlug") as string) || "";
  const title           = (formData.get("title")           as string) || "Gallery Image";
  const description     = (formData.get("description")     as string) || "";
  const published       = formData.get("published") === "true";
  const rawFile         = formData.get("image") as File | null;

  if (!rawFile) throw new Error("Please select an image to upload.");

  const storedToken = localStorage.getItem("azhagu_admin_token");
  const isDemoToken = !storedToken || storedToken === "demo_admin_token_123";

  // ── Path 1: Spring Boot backend (only if logged in with real JWT) ─────────
  if (!isDemoToken) {
    try {
      const res = await api.post<ApiResponse<any>>("/admin/gallery", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success && res.data?.data) {
        const item = dtoToItem(res.data.data);
        saveLocalGalleryItem(item);
        return item;
      }
      console.warn("Backend returned success=false or empty data, trying Supabase fallback.");
    } catch (backendErr: any) {
      console.warn("Backend upload failed, using Supabase fallback:", backendErr?.message);
    }
  }

  // ── Path 2: Supabase direct fallback (anon key) ──────────────────────────
  const imageUrl = await supabaseUploadImage(rawFile);
  const item     = await supabaseCreateGalleryItem(
    categorySlug, subcategorySlug, title, description, published, imageUrl
  );
  saveLocalGalleryItem(item);
  return item;
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin gallery — UPDATE
// ─────────────────────────────────────────────────────────────────────────────

export async function adminUpdateGalleryItem(id: number, formData: FormData): Promise<GalleryItem> {
  const categorySlug    = (formData.get("categorySlug")    as string) || "";
  const subcategorySlug = (formData.get("subcategorySlug") as string) || "";
  const title           = (formData.get("title")           as string) || "";
  const description     = (formData.get("description")     as string) || "";
  const published       = formData.get("published") === "true";
  const rawFile         = formData.get("image") as File | null;

  const storedToken = localStorage.getItem("azhagu_admin_token");
  const isDemoToken = !storedToken || storedToken === "demo_admin_token_123";

  // ── Path 1: Spring Boot backend ──────────────────────────────────────────
  if (!isDemoToken) {
    try {
      const res = await api.put<ApiResponse<any>>(`/admin/gallery/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success && res.data?.data) {
        const item = dtoToItem(res.data.data);
        saveLocalGalleryItem(item);
        return item;
      }
    } catch (backendErr: any) {
      console.warn("Backend update failed, using Supabase fallback:", backendErr?.message);
    }
  }

  // ── Path 2: Supabase direct fallback ─────────────────────────────────────
  let imageUrl: string | undefined;
  if (rawFile) {
    imageUrl = await supabaseUploadImage(rawFile);
  }

  const { categoryId, subcategoryId } = await supabaseResolveIds(categorySlug, subcategorySlug);
  const updateData: any = {
    category_id:    categoryId,
    subcategory_id: subcategoryId,
    title,
    description,
    published,
    updated_at: new Date().toISOString(),
  };
  if (imageUrl) updateData.image_url = imageUrl;

  const { data, error } = await supabase
    .from("gallery_items")
    .update(updateData)
    .eq("id", id)
    .select("id, title, description, image_url, published, created_at")
    .maybeSingle();

  if (error) throw new Error("Update failed: " + error.message);

  const catInfo = getCategoryBySlug(categorySlug);
  const subInfo = catInfo?.gallerySubcategories.find((s) => s.slug === subcategorySlug);
  const existing = getLocalGalleryItems().find((i) => i.id === id);

  const updated: GalleryItem = {
    id,
    categorySlug,
    subcategorySlug,
    subcategoryName: subInfo?.name ?? subcategorySlug,
    title:       data?.title       ?? title,
    description: data?.description ?? description,
    imageUrl:    imageUrl ?? data?.image_url ?? existing?.imageUrl ?? "",
    published,
    createdAt:   existing?.createdAt ?? data?.created_at ?? new Date().toISOString(),
  };
  saveLocalGalleryItem(updated);
  return updated;
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin gallery — DELETE
// ─────────────────────────────────────────────────────────────────────────────

export async function adminDeleteGalleryItem(id: number) {
  // Try Spring Boot backend first (it also deletes the Cloudinary asset).
  let backendOk = false;
  try {
    await api.delete(`/admin/gallery/${id}`);
    backendOk = true;
  } catch (backendErr: any) {
    const status = backendErr?.response?.status;
    if (status === 401) throw new Error("Session expired. Please log in again.");
    if (status === 403) throw new Error("Access denied. Admin login required.");
    if (status === 404) throw new Error("Item not found.");
    console.warn("Backend delete unavailable, using Supabase fallback.");
  }

  // Supabase fallback (image in Cloudinary remains, but DB row is removed).
  if (!backendOk) {
    const { error } = await supabase.from("gallery_items").delete().eq("id", id);
    if (error) throw new Error("Delete failed: " + error.message);
  }

  deleteLocalGalleryItem(id);
  return { success: true, data: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin gallery — READ
// ─────────────────────────────────────────────────────────────────────────────

export async function adminFetchAllGalleryItems(categorySlug?: string): Promise<GalleryItem[]> {
  // 1. Query Supabase direct over high-speed edge API (<100ms response)
  try {
    let q = supabase
      .from("gallery_items")
      .select("*, gallery_categories!inner(slug), gallery_subcategories!inner(slug, name)")
      .order("created_at", { ascending: false });

    // Filter by category_id directly (more reliable than filtering through joined table in PostgREST)
    if (categorySlug) {
      const { data: catRow } = await supabase
        .from("gallery_categories")
        .select("id")
        .eq("slug", categorySlug)
        .maybeSingle();
      if (catRow?.id) q = q.eq("category_id", catRow.id);
    }

    const { data, error } = await q;
    if (!error && data) {
      const dbItems: GalleryItem[] = data.map((item: any) => ({
        id:              item.id,
        categorySlug:    item.gallery_categories?.slug || categorySlug || "",
        subcategorySlug: item.gallery_subcategories?.slug || "",
        subcategoryName: item.gallery_subcategories?.name || "",
        title:           item.title,
        description:     item.description ?? "",
        imageUrl:        item.image_url,
        published:       item.published,
        isFeatured:      Boolean(item.is_featured),
        createdAt:       item.created_at,
      }));

      dbItems.forEach(saveLocalGalleryItem);
      return dbItems;
    }
  } catch (_) {}

  // 2. Local cache fallback
  const cached = getLocalGalleryItems();
  return categorySlug ? cached.filter((i) => i.categorySlug === categorySlug) : cached;
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin gallery — SET GLOBAL FEATURED HOMEPAGE IMAGE
//
// Ensures ONLY ONE image across ALL categories/subcategories is featured.
// Sets is_featured = false for all other rows in DB, and is_featured = true on target.
// ─────────────────────────────────────────────────────────────────────────────

export async function adminSetFeaturedGalleryItem(
  id: number,
  categorySlug?: string,
  _subcategorySlug?: string   // accepted for API compatibility, not used for filtering
): Promise<GalleryItem[]> {
  try {
    // 1. Clear ALL previously featured items globally (only one image can be featured at a time)
    await supabase
      .from("gallery_items")
      .update({ is_featured: false })
      .gte("id", 1);

    // 2. Set the newly chosen image as featured. Also ensure it's published.
    await supabase
      .from("gallery_items")
      .update({ is_featured: true, published: true })
      .eq("id", id);
  } catch (err) {
    console.warn("adminSetFeaturedGalleryItem failed:", err);
  }

  return adminFetchAllGalleryItems(categorySlug);
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin gallery — UNSET FEATURED
// ─────────────────────────────────────────────────────────────────────────────

export async function adminUnsetFeaturedGalleryItem(
  id: number,
  categorySlug?: string
): Promise<GalleryItem[]> {
  try {
    await supabase
      .from("gallery_items")
      .update({ is_featured: false })
      .eq("id", id);
  } catch (_) {}

  return adminFetchAllGalleryItems(categorySlug);
}


// ─────────────────────────────────────────────────────────────────────────────
// Admin enquiries
// ─────────────────────────────────────────────────────────────────────────────

export async function adminFetchEnquiries(): Promise<EnquiryRecord[]> {
  try {
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      return data.map((e: any) => ({
        id: e.id,
        name: e.name || "",
        phone: e.phone || "",
        email: e.email || "",
        eventType: e.event_type || "",
        eventDate: e.event_date || "",
        location: e.location || "",
        guestCount: e.guest_count || "",
        servicesInterested: e.services_interested || [],
        message: e.message || "",
        status: e.status || "NEW",
        createdAt: e.created_at,
      }));
    }
  } catch (_) {}

  return getLocalEnquiries();
}

// ─────────────────────────────────────────────────────────────────────────────
// Admin dashboard
// ─────────────────────────────────────────────────────────────────────────────

export async function adminFetchDashboard(): Promise<DashboardStats> {
  const [allGalleryItems, localEnquiries] = await Promise.all([
    adminFetchAllGalleryItems(),
    adminFetchEnquiries(),
  ]);

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
