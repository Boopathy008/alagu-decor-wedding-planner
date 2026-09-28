import axios from "axios";
import { site } from "@/config/site";
import type {
  ApiResponse,
  DashboardStats,
  EnquiryFormValues,
  EnquiryRecord,
  GalleryItem,
} from "@/types";

// 2 s timeout – if the backend is sleeping on a free tier it falls back
// to local mock data almost instantly instead of hanging for ~30 s.
export const api = axios.create({ baseURL: site.apiBaseUrl, timeout: 2000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("azhagu_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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

const DECORATION_IMAGES = [
  "/decoration1.jpg",
  "/decoration2.jpg",
  "/decoration3.jpg",
  "/decoration4.jpg",
  "/decoration5.jpg",
  "/decoration6.jpg",
  "/decoration7.jpg",
  "/decoration8.jpg",
  "/decoration9.jpg",
  "/decoration10.jpg",
  "/decoration11.jpg",
  "/decoration12.jpg",
  "/decoration13.jpg",
  "/decoration14.jpg",
  "/decoration15.jpg",
  "/decoration16.jpg",
  "/decoration17.jpg",
  "/decoration18.jpg",
];

const EVENT_IMAGES = [
  "/event1.jpg",
  "/event2.jpg",
  "/event3.jpg",
  "/event4.jpg",
  "/event5.jpg",
  "/event6.jpg",
  "/event7.jpg",
  "/event8.jpg",
  "/event9.jpg",
];

const CATERING_IMAGES = ["/catering1.jpg", "/demo1.jpg"];
const ENTERTAINMENT_IMAGES = ["/entertainment1.jpg", "/demo.jpg"];
const GIFT_IMAGES = ["/gift1.jpg", "/demo1.jpg"];
const ENTRIES_IMAGES = ["/entries1.jpg", "/event1.jpg"];
const PHOTOGRAPHY_IMAGES = ["/photography1.jpg", "/event2.jpg"];

function getMockGalleryItems(categorySlug?: string, subcategorySlug?: string): GalleryItem[] {
  const items: GalleryItem[] = [];

  serviceCategories.forEach((cat, catIdx) => {
    cat.gallerySubcategories.forEach((sub, subIdx) => {
      // Create 1 clean default item per subcategory
      const itemId = (catIdx + 1) * 100 + subIdx + 1;

      let imageUrl = "/demo.jpg";
      let title = sub.name;

      if (cat.slug === "decorations") {
        imageUrl = DECORATION_IMAGES[subIdx % DECORATION_IMAGES.length];
      } else if (cat.slug === "event-production") {
        imageUrl = EVENT_IMAGES[subIdx % EVENT_IMAGES.length];
      } else if (cat.slug === "food-hospitality") {
        imageUrl = "/catering1.jpg";
      } else if (cat.slug === "entertainment") {
        imageUrl = "/entertainment1.jpg";
      } else if (cat.slug === "gifts") {
        imageUrl = "/gift1.jpg";
      } else if (cat.slug === "music-and-entries") {
        imageUrl = "/entries1.jpg";
      } else if (cat.slug === "photography") {
        imageUrl = "/photography1.jpg";
      }

      items.push({
        id: itemId,
        categorySlug: cat.slug,
        subcategorySlug: sub.slug,
        subcategoryName: sub.name,
        title,
        description: `Curated ${sub.name} setup by Azhagu Decor.`,
        imageUrl,
        published: true,
        createdAt: new Date().toISOString(),
      });
    });
  });

  return items.filter((item) => {
    if (categorySlug && item.categorySlug !== categorySlug) return false;
    if (subcategorySlug && item.subcategorySlug !== subcategorySlug) return false;
    return true;
  });
}

// ---------- Public gallery ----------

export async function fetchGalleryByCategory(categorySlug: string) {
  try {
    const res = await api.get<ApiResponse<GalleryItem[]>>(`/gallery/${categorySlug}`, { timeout: 2000 });
    if (res.data.data && res.data.data.length > 0) return res.data.data;
  } catch (e) {
    // fallback to mock
  }
  const items = await adminFetchAllGalleryItems(categorySlug);
  return items.filter((i) => i.published);
}

export async function fetchGalleryByCategoryAndSubcategory(
  categorySlug: string,
  subcategorySlug: string
) {
  try {
    const res = await api.get<ApiResponse<GalleryItem[]>>(
      `/gallery/${categorySlug}/${subcategorySlug}`
    );
    if (res.data.data && res.data.data.length > 0) return res.data.data;
  } catch (e) {
    // fallback to mock
  }
  const items = await adminFetchAllGalleryItems(categorySlug);
  return items.filter((i) => i.subcategorySlug === subcategorySlug && i.published);
}

export async function fetchFeaturedGallery() {
  try {
    const res = await api.get<ApiResponse<GalleryItem[]>>(`/gallery/featured`, { timeout: 2000 });
    if (res.data.data && res.data.data.length > 0) return res.data.data;
  } catch (e) {
    // fallback to mock
  }
  
  const allItems = await adminFetchAllGalleryItems();
  const featured: GalleryItem[] = [];

  serviceCategories.forEach((c) => {
    const match = allItems.find((item) => item.categorySlug === c.slug && item.published);
    if (match) {
      featured.push(match);
    }
  });

  return featured;
}

const ENQUIRIES_STORAGE_KEY = "azhagu_demo_enquiries";

function getLocalEnquiries(): EnquiryRecord[] {
  try {
    const raw = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function submitEnquiry(values: EnquiryFormValues) {
  try {
    const res = await api.post<ApiResponse<null>>("/enquiries", values);
    return res.data;
  } catch (e) {
    // Demo fallback: save to localStorage
    const current = getLocalEnquiries();
    const newEnquiry: EnquiryRecord = {
      id: Date.now(),
      ...values,
      status: "NEW",
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify([newEnquiry, ...current]));
    return { success: true, data: null };
  }
}

// ---------- Admin auth ----------

export async function adminLogin(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  // Allow easy demo login options (admin@azhagu.com / AzhaguDecor#Admin2026 OR admin@azhagu.com / admin OR admin / admin)
  const isDefaultCredentials =
    (cleanEmail === "admin@azhagu.com" && (cleanPassword === "AzhaguDecor#Admin2026" || cleanPassword === "admin" || cleanPassword === "admin123")) ||
    (cleanEmail === "admin" && (cleanPassword === "admin" || cleanPassword === "admin123" || cleanPassword === "AzhaguDecor#Admin2026"));

  if (isDefaultCredentials) {
    return {
      token: "demo_admin_token_123",
      email: "admin@azhagu.com",
      role: "ADMIN",
    };
  }

  try {
    const res = await api.post<ApiResponse<{ token: string; email: string; role: string }>>(
      "/auth/login",
      { email, password }
    );
    if (res.data.data) return res.data.data;
  } catch (e) {
    // API not reachable
  }

  throw new Error("Invalid email or password.");
}

// ---------- Admin gallery management ----------

const CUSTOM_GALLERY_STORAGE_KEY = "azhagu_demo_custom_gallery";

function getLocalCustomGallery(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_GALLERY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function adminCreateGalleryItem(formData: FormData): Promise<GalleryItem> {
  try {
    // 35 s timeout – Render free tier needs ~30 s to wake from sleep.
    const res = await api.post<ApiResponse<GalleryItem>>("/admin/gallery", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 35000,
    });
    if (res.data.data) return res.data.data;
  } catch (e) {
    // Demo fallback: save image data URL to localStorage
  }

  const categorySlug = (formData.get("categorySlug") as string) || "decorations";
  const subcategorySlug = (formData.get("subcategorySlug") as string) || "";
  const title = (formData.get("title") as string) || "New Image";
  const description = (formData.get("description") as string) || "";
  const published = formData.get("published") === "true";
  const file = formData.get("image") as File | null;

  let imageUrl = "/demo.jpg";
  if (file) {
    imageUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  const newItem: GalleryItem = {
    id: Date.now(),
    categorySlug,
    subcategorySlug,
    subcategoryName: subcategorySlug,
    title,
    description,
    imageUrl,
    published,
    createdAt: new Date().toISOString(),
  };

  const current = getLocalCustomGallery();
  localStorage.setItem(CUSTOM_GALLERY_STORAGE_KEY, JSON.stringify([newItem, ...current]));
  return newItem;
}

export async function adminUpdateGalleryItem(id: number, formData: FormData): Promise<GalleryItem> {
  try {
    // 35 s timeout – Render free tier needs ~30 s to wake from sleep.
    const res = await api.put<ApiResponse<GalleryItem>>(`/admin/gallery/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 35000,
    });
    if (res.data.data) return res.data.data;
  } catch (e) {
    // Demo fallback
  }

  const current = getLocalCustomGallery();
  const allCurrentItems = [...current, ...getMockGalleryItems()];
  const existing = allCurrentItems.find((item) => item.id === id);

  const categorySlug = (formData.get("categorySlug") as string) || existing?.categorySlug || "decorations";
  const subcategorySlug = (formData.get("subcategorySlug") as string) || existing?.subcategorySlug || "";
  const title = (formData.get("title") as string) || existing?.title || "";
  const description = (formData.get("description") as string) || existing?.description || "";
  const published = formData.get("published") === "true";
  const file = formData.get("image") as File | null;

  let imageUrl = existing?.imageUrl || "/demo.jpg";
  if (file) {
    imageUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  const updatedItem: GalleryItem = {
    id,
    categorySlug,
    subcategorySlug,
    subcategoryName: subcategorySlug,
    title,
    description,
    imageUrl,
    published,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };

  const isExistingCustom = current.some((item) => item.id === id);
  const updatedList = isExistingCustom
    ? current.map((item) => (item.id === id ? updatedItem : item))
    : [updatedItem, ...current];

  localStorage.setItem(CUSTOM_GALLERY_STORAGE_KEY, JSON.stringify(updatedList));
  return updatedItem;
}

const DELETED_GALLERY_STORAGE_KEY = "azhagu_demo_deleted_gallery";

function getDeletedGalleryIds(): number[] {
  try {
    const raw = localStorage.getItem(DELETED_GALLERY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function adminDeleteGalleryItem(id: number) {
  try {
    // 35 s timeout – Render free tier needs ~30 s to wake from sleep.
    const res = await api.delete<ApiResponse<null>>(`/admin/gallery/${id}`, { timeout: 35000 });
    return res.data;
  } catch (e) {
    // Demo fallback: save deleted ID and remove from custom list
    const deletedIds = getDeletedGalleryIds();
    if (!deletedIds.includes(id)) {
      localStorage.setItem(DELETED_GALLERY_STORAGE_KEY, JSON.stringify([...deletedIds, id]));
    }
    const current = getLocalCustomGallery();
    const updatedList = current.filter((item) => item.id !== id);
    localStorage.setItem(CUSTOM_GALLERY_STORAGE_KEY, JSON.stringify(updatedList));
    return { success: true, data: null };
  }
}

export async function adminFetchAllGalleryItems(categorySlug?: string): Promise<GalleryItem[]> {
  try {
    const res = await api.get<ApiResponse<GalleryItem[]>>("/admin/gallery", {
      params: categorySlug ? { category: categorySlug } : undefined,
      timeout: 2000,
    });
    if (res.data.data && res.data.data.length > 0) return res.data.data;
  } catch (e) {
    // Demo fallback – backend sleeping or unavailable
  }

  const baseItems = getMockGalleryItems(categorySlug);
  const customItems = getLocalCustomGallery();
  const deletedIds = getDeletedGalleryIds();

  // Merge custom updated/edited items with base items by replacing matching item ids
  const mergedMap = new Map<number, GalleryItem>();
  baseItems.forEach((item) => {
    if (!deletedIds.includes(item.id)) {
      mergedMap.set(item.id, item);
    }
  });
  customItems.forEach((item) => {
    if ((!categorySlug || item.categorySlug === categorySlug) && !deletedIds.includes(item.id)) {
      mergedMap.set(item.id, item);
    }
  });

  return Array.from(mergedMap.values());
}

// ---------- Admin enquiries ----------

export async function adminFetchEnquiries() {
  try {
    const res = await api.get<ApiResponse<EnquiryRecord[]>>("/admin/enquiries");
    if (res.data.data && res.data.data.length > 0) return res.data.data;
  } catch (e) {
    // Demo fallback: read from localStorage
  }
  return getLocalEnquiries();
}

export async function adminFetchDashboard(): Promise<DashboardStats> {
  const getFallbackStats = (): DashboardStats => {
    const baseItems = getMockGalleryItems();
    const customItems = getLocalCustomGallery();
    const deletedIds = getDeletedGalleryIds();

    const mergedMap = new Map<number, GalleryItem>();
    baseItems.forEach((item) => {
      if (!deletedIds.includes(item.id)) mergedMap.set(item.id, item);
    });
    customItems.forEach((item) => {
      if (!deletedIds.includes(item.id)) mergedMap.set(item.id, item);
    });

    const allGalleryItems = Array.from(mergedMap.values());
    const localEnquiries = getLocalEnquiries();

    const imagesByCategory: Record<string, number> = {};
    serviceCategories.forEach((c) => {
      imagesByCategory[c.slug] = allGalleryItems.filter((g) => g.categorySlug === c.slug).length;
    });

    return {
      totalImages: allGalleryItems.length,
      totalEnquiries: localEnquiries.length,
      imagesByCategory,
      recentEnquiries: localEnquiries.slice(0, 5),
      recentUploads: allGalleryItems.slice(0, 5),
    };
  };

  try {
    const res = await api.get<ApiResponse<DashboardStats>>("/admin/dashboard", { timeout: 1500 });
    if (res.data?.data) return res.data.data;
  } catch (e) {
    // API not responding or sleeping, instant fallback
  }

  return getFallbackStats();
}
