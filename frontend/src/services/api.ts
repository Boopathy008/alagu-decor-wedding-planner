import axios from "axios";
import { site } from "@/config/site";
import type {
  ApiResponse,
  DashboardStats,
  EnquiryFormValues,
  EnquiryRecord,
  GalleryItem,
} from "@/types";

export const api = axios.create({ baseURL: site.apiBaseUrl });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("alagu_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("alagu_admin_token");
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

function getMockGalleryItems(categorySlug?: string, subcategorySlug?: string): GalleryItem[] {
  const items: GalleryItem[] = [];

  serviceCategories.forEach((cat, catIdx) => {
    cat.gallerySubcategories.forEach((sub, subIdx) => {
      for (let i = 0; i < 3; i++) {
        // Unique, static ID for every item across categories: e.g., 101, 102, 201, 202...
        const itemId = (catIdx + 1) * 100 + subIdx * 3 + i + 1;

        let imageUrl = "/demo.jpg";
        let title = `${sub.name} ${i + 1}`;

        if (cat.slug === "decorations") {
          const decIdx = subIdx * 3 + i;
          imageUrl = DECORATION_IMAGES[decIdx % DECORATION_IMAGES.length];
          title = `Decoration${decIdx + 1}`;
        } else if (cat.slug === "event-production") {
          const evtIdx = subIdx * 3 + i;
          imageUrl = EVENT_IMAGES[evtIdx % EVENT_IMAGES.length];
          title = `Event ${evtIdx + 1}`;
        }

        items.push({
          id: itemId,
          categorySlug: cat.slug,
          subcategorySlug: sub.slug,
          subcategoryName: sub.name,
          title,
          description: "Demo description for this event.",
          imageUrl,
          published: true,
          createdAt: new Date().toISOString(),
        });
      }
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
    const res = await api.get<ApiResponse<GalleryItem[]>>(`/gallery/${categorySlug}`);
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
    const res = await api.get<ApiResponse<GalleryItem[]>>(`/gallery/featured`);
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

const ENQUIRIES_STORAGE_KEY = "alagu_demo_enquiries";

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
  try {
    const res = await api.post<ApiResponse<{ token: string; email: string; role: string }>>(
      "/auth/login",
      { email, password }
    );
    return res.data.data;
  } catch (e) {
    // Environment-based secure fallback
    const secureEmail = import.meta.env.VITE_ADMIN_EMAIL || "admin@alagu.com";
    const securePassword = import.meta.env.VITE_ADMIN_PASSWORD || "AlaguDecor#Admin2026";

    if (email.trim().toLowerCase() === secureEmail.trim().toLowerCase() && password === securePassword) {
      return {
        token: "demo_admin_token_123",
        email: secureEmail,
        role: "ADMIN",
      };
    }
    throw new Error("Invalid email or password.");
  }
}

// ---------- Admin gallery management ----------

const CUSTOM_GALLERY_STORAGE_KEY = "alagu_demo_custom_gallery";

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
    const res = await api.post<ApiResponse<GalleryItem>>("/admin/gallery", formData, {
      headers: { "Content-Type": "multipart/form-data" },
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
    const res = await api.put<ApiResponse<GalleryItem>>(`/admin/gallery/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
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

const DELETED_GALLERY_STORAGE_KEY = "alagu_demo_deleted_gallery";

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
    const res = await api.delete<ApiResponse<null>>(`/admin/gallery/${id}`);
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
    });
    if (res.data.data && res.data.data.length > 0) return res.data.data;
  } catch (e) {
    // Demo fallback
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
  try {
    const res = await api.get<ApiResponse<DashboardStats>>("/admin/dashboard");
    if (res.data.data) return res.data.data;
  } catch (e) {
    // Demo fallback: build stats dynamically from mock data & local enquiries
  }

  const allGalleryItems = await adminFetchAllGalleryItems();
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
}
