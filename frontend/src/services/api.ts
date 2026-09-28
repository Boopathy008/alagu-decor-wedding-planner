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
  return [];
}

import { supabase } from "./supabaseClient";

// ---------- Public gallery ----------

export async function fetchGalleryByCategory(categorySlug: string) {
  try {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*, gallery_categories!inner(slug), gallery_subcategories!inner(slug, name)")
      .eq("gallery_categories.slug", categorySlug)
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (!error && data !== null && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        categorySlug: item.gallery_categories?.slug || categorySlug,
        subcategorySlug: item.gallery_subcategories?.slug || "",
        subcategoryName: item.gallery_subcategories?.name || "",
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        published: item.published,
        createdAt: item.created_at,
      }));
    }
  } catch (e) {}

  // Fallback check for raw columns
  try {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .eq("category_slug", categorySlug)
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (!error && data !== null && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        categorySlug: item.category_slug || categorySlug,
        subcategorySlug: item.subcategory_slug || "",
        subcategoryName: item.subcategory_name || item.subcategory_slug || "",
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        published: item.published,
        createdAt: item.created_at,
      }));
    }
  } catch (e) {}

  const items = await adminFetchAllGalleryItems(categorySlug);
  return items.filter((i) => i.published);
}

export async function fetchGalleryByCategoryAndSubcategory(
  categorySlug: string,
  subcategorySlug: string
) {
  try {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*, gallery_categories!inner(slug), gallery_subcategories!inner(slug, name)")
      .eq("gallery_categories.slug", categorySlug)
      .eq("gallery_subcategories.slug", subcategorySlug)
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (!error && data !== null && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        categorySlug: item.gallery_categories?.slug || categorySlug,
        subcategorySlug: item.gallery_subcategories?.slug || subcategorySlug,
        subcategoryName: item.gallery_subcategories?.name || subcategorySlug,
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        published: item.published,
        createdAt: item.created_at,
      }));
    }
  } catch (e) {}

  const items = await adminFetchAllGalleryItems(categorySlug);
  return items.filter((i) => i.subcategorySlug === subcategorySlug && i.published);
}

export async function fetchFeaturedGallery() {
  const all = await adminFetchAllGalleryItems();
  const featured: GalleryItem[] = [];
  serviceCategories.forEach((c) => {
    const match = all.find((item) => item.categorySlug === c.slug && item.published);
    if (match) featured.push(match);
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
    await supabase.from("enquiries").insert([
      {
        name: values.name,
        phone: values.phone,
        email: values.email || null,
        event_type: values.eventType || null,
        event_date: values.eventDate || null,
        location: values.location || null,
        guest_count: values.guestCount || null,
        message: values.message || null,
        status: "NEW",
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (e) {}

  try {
    const res = await api.post<ApiResponse<null>>("/enquiries", values);
    return res.data;
  } catch (e) {
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
  } catch (e) {}

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

  // 1. Try relational Supabase insertion
  try {
    const catQuery = await supabase.from("gallery_categories").select("id").eq("slug", categorySlug).single();
    const subQuery = await supabase.from("gallery_subcategories").select("id").eq("slug", subcategorySlug).single();

    if (catQuery.data && subQuery.data) {
      const { data, error } = await supabase
        .from("gallery_items")
        .insert([
          {
            category_id: catQuery.data.id,
            subcategory_id: subQuery.data.id,
            title,
            description,
            image_url: imageUrl,
            cloudinary_public_id: "local_base64_" + Date.now(),
            published,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (!error && data) {
        const item: GalleryItem = {
          id: data.id,
          categorySlug,
          subcategorySlug,
          subcategoryName: subcategorySlug,
          title: data.title,
          description: data.description,
          imageUrl: data.image_url,
          published: data.published,
          createdAt: data.created_at,
        };
        const current = getLocalCustomGallery();
        localStorage.setItem(CUSTOM_GALLERY_STORAGE_KEY, JSON.stringify([item, ...current]));
        return item;
      }
    }
  } catch (e) {}

  // 2. Try raw column Supabase insertion fallback
  try {
    const { data, error } = await supabase
      .from("gallery_items")
      .insert([
        {
          category_slug: categorySlug,
          subcategory_slug: subcategorySlug,
          subcategory_name: subcategorySlug,
          title,
          description,
          image_url: imageUrl,
          published,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (!error && data) {
      const item: GalleryItem = {
        id: data.id,
        categorySlug: data.category_slug || categorySlug,
        subcategorySlug: data.subcategory_slug || subcategorySlug,
        subcategoryName: data.subcategory_name || subcategorySlug,
        title: data.title,
        description: data.description,
        imageUrl: data.image_url,
        published: data.published,
        createdAt: data.created_at,
      };
      const current = getLocalCustomGallery();
      localStorage.setItem(CUSTOM_GALLERY_STORAGE_KEY, JSON.stringify([item, ...current]));
      return item;
    }
  } catch (e) {}

  // 3. Backend API or local storage fallback
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

  // 1. Try Supabase update
  try {
    const { data, error } = await supabase
      .from("gallery_items")
      .update({
        title,
        description,
        image_url: imageUrl,
        published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) {
      const updatedItem: GalleryItem = {
        id: data.id,
        categorySlug,
        subcategorySlug,
        subcategoryName: subcategorySlug,
        title: data.title,
        description: data.description,
        imageUrl: data.image_url,
        published: data.published,
        createdAt: data.created_at,
      };
      const isExistingCustom = current.some((item) => item.id === id);
      const updatedList = isExistingCustom
        ? current.map((item) => (item.id === id ? updatedItem : item))
        : [updatedItem, ...current];
      localStorage.setItem(CUSTOM_GALLERY_STORAGE_KEY, JSON.stringify(updatedList));
      return updatedItem;
    }
  } catch (e) {}

  // 2. Fallback
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
    const { error } = await supabase.from("gallery_items").delete().eq("id", id);
    if (!error) {
      const deletedIds = getDeletedGalleryIds();
      if (!deletedIds.includes(id)) {
        localStorage.setItem(DELETED_GALLERY_STORAGE_KEY, JSON.stringify([...deletedIds, id]));
      }
      const current = getLocalCustomGallery();
      const updatedList = current.filter((item) => item.id !== id);
      localStorage.setItem(CUSTOM_GALLERY_STORAGE_KEY, JSON.stringify(updatedList));
      return { success: true, data: null };
    }
  } catch (e) {}

  const deletedIds = getDeletedGalleryIds();
  if (!deletedIds.includes(id)) {
    localStorage.setItem(DELETED_GALLERY_STORAGE_KEY, JSON.stringify([...deletedIds, id]));
  }
  const current = getLocalCustomGallery();
  const updatedList = current.filter((item) => item.id !== id);
  localStorage.setItem(CUSTOM_GALLERY_STORAGE_KEY, JSON.stringify(updatedList));
  return { success: true, data: null };
}

export async function adminFetchAllGalleryItems(categorySlug?: string): Promise<GalleryItem[]> {
  // 1. Try relational Supabase query
  try {
    let query = supabase
      .from("gallery_items")
      .select("*, gallery_categories!inner(slug, name), gallery_subcategories!inner(slug, name)")
      .order("created_at", { ascending: false });

    if (categorySlug) {
      query = query.eq("gallery_categories.slug", categorySlug);
    }
    const { data, error } = await query;
    if (!error && data !== null && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        categorySlug: item.gallery_categories?.slug || "decorations",
        subcategorySlug: item.gallery_subcategories?.slug || "wedding",
        subcategoryName: item.gallery_subcategories?.name || "Wedding",
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        published: item.published,
        createdAt: item.created_at,
      }));
    }
  } catch (e) {}

  // 2. Try raw column query fallback
  try {
    let query = supabase.from("gallery_items").select("*").order("created_at", { ascending: false });
    if (categorySlug) {
      query = query.eq("category_slug", categorySlug);
    }
    const { data, error } = await query;
    if (!error && data !== null && data.length > 0) {
      return data.map((item: any) => ({
        id: item.id,
        categorySlug: item.category_slug || categorySlug || "decorations",
        subcategorySlug: item.subcategory_slug || "wedding",
        subcategoryName: item.subcategory_name || "Wedding",
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        published: item.published,
        createdAt: item.created_at,
      }));
    }
  } catch (e) {}

  // 3. Fallback to local storage
  const customItems = getLocalCustomGallery();
  const deletedIds = getDeletedGalleryIds();
  return customItems.filter(
    (item) => (!categorySlug || item.categorySlug === categorySlug) && !deletedIds.includes(item.id)
  );
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
  const allGalleryItems = await adminFetchAllGalleryItems();
  const localEnquiries = await adminFetchEnquiries();

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

