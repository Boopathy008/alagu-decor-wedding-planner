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

import { supabase, supabaseAdmin } from "./supabaseClient";

// ---------- Public gallery ----------

export async function fetchGalleryByCategory(categorySlug: string) {
  try {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*, gallery_categories!inner(slug), gallery_subcategories!inner(slug, name)")
      .eq("gallery_categories.slug", categorySlug)
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
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
  } catch (e) {
    console.error("fetchGalleryByCategory error:", e);
  }
  return [];
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

    if (!error && data) {
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
  } catch (e) {
    console.error("fetchGalleryByCategoryAndSubcategory error:", e);
  }
  return [];
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

// ---- Helper: upload image file to Supabase Storage and return public URL ----
async function uploadImageToStorage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `gallery/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("gallery-images")
    .upload(fileName, file, { cacheControl: "3600", upsert: false, contentType: file.type });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw new Error(`Image upload failed: ${uploadError.message}`);
  }

  const { data: urlData } = supabaseAdmin.storage
    .from("gallery-images")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export async function adminCreateGalleryItem(formData: FormData): Promise<GalleryItem> {
  const categorySlug = (formData.get("categorySlug") as string) || "decorations";
  const subcategorySlug = (formData.get("subcategorySlug") as string) || "";
  const title = (formData.get("title") as string) || "Gallery Image";
  const description = (formData.get("description") as string) || "";
  const published = formData.get("published") === "true";
  const file = formData.get("image") as File | null;

  if (!file) throw new Error("Please select an image to upload.");

  // 1. Upload image to Supabase Storage
  const imageUrl = await uploadImageToStorage(file);
  const storagePublicId = imageUrl.split("/").pop() || ("img_" + Date.now());

  // 2. Query category_id
  const catQuery = await supabaseAdmin
    .from("gallery_categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();

  if (catQuery.error || !catQuery.data) {
    console.error("Category lookup error:", catQuery.error);
    throw new Error(`Category "${categorySlug}" not found in database. Please contact support.`);
  }
  const categoryId = catQuery.data.id;

  // 3. Query subcategory_id scoped to this category
  let subcategoryId: number | null = null;
  if (subcategorySlug) {
    const subQuery = await supabaseAdmin
      .from("gallery_subcategories")
      .select("id")
      .eq("category_id", categoryId)
      .eq("slug", subcategorySlug)
      .single();
    if (subQuery.data) subcategoryId = subQuery.data.id;
  }
  // Fallback to first subcategory in category
  if (!subcategoryId) {
    const defaultSub = await supabaseAdmin
      .from("gallery_subcategories")
      .select("id")
      .eq("category_id", categoryId)
      .limit(1)
      .single();
    if (defaultSub.data) subcategoryId = defaultSub.data.id;
  }
  if (!subcategoryId) throw new Error(`No subcategory found for category "${categorySlug}".`);

  // 4. Insert gallery item
  const { data, error } = await supabaseAdmin
    .from("gallery_items")
    .insert([{
      category_id: categoryId,
      subcategory_id: subcategoryId,
      title,
      description,
      image_url: imageUrl,
      cloudinary_public_id: storagePublicId,
      published,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
    .select("*, gallery_categories(slug), gallery_subcategories(slug, name)")
    .single();

  if (error || !data) {
    console.error("Supabase gallery_items insert error:", error);
    throw new Error(`Failed to save gallery item: ${error?.message || "Unknown error"}`);
  }

  return {
    id: data.id,
    categorySlug: data.gallery_categories?.slug || categorySlug,
    subcategorySlug: data.gallery_subcategories?.slug || subcategorySlug,
    subcategoryName: data.gallery_subcategories?.name || subcategorySlug,
    title: data.title,
    description: data.description,
    imageUrl: data.image_url,
    published: data.published,
    createdAt: data.created_at,
  };
}

export async function adminUpdateGalleryItem(id: number, formData: FormData): Promise<GalleryItem> {
  const categorySlug = (formData.get("categorySlug") as string) || "";
  const subcategorySlug = (formData.get("subcategorySlug") as string) || "";
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const published = formData.get("published") === "true";
  const file = formData.get("image") as File | null;

  const updateData: any = {
    title,
    description,
    published,
    updated_at: new Date().toISOString(),
  };

  if (categorySlug) {
    const catQuery = await supabaseAdmin
      .from("gallery_categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (catQuery.data) {
      updateData.category_id = catQuery.data.id;
      if (subcategorySlug) {
        const subQuery = await supabaseAdmin
          .from("gallery_subcategories")
          .select("id")
          .eq("category_id", catQuery.data.id)
          .eq("slug", subcategorySlug)
          .single();
        if (subQuery.data) {
          updateData.subcategory_id = subQuery.data.id;
        }
      }
    }
  }

  if (file) {
    const imageUrl = await uploadImageToStorage(file);
    updateData.image_url = imageUrl;
    updateData.cloudinary_public_id = imageUrl.split("/").pop() || ("img_" + Date.now());
  }

  const { data, error } = await supabaseAdmin
    .from("gallery_items")
    .update(updateData)
    .eq("id", id)
    .select("*, gallery_categories(slug), gallery_subcategories(slug, name)")
    .single();

  if (error || !data) {
    console.error("Supabase gallery_items update error:", error);
    throw new Error(`Failed to update gallery item: ${error?.message || "Unknown error"}`);
  }

  return {
    id: data.id,
    categorySlug: data.gallery_categories?.slug || categorySlug,
    subcategorySlug: data.gallery_subcategories?.slug || subcategorySlug,
    subcategoryName: data.gallery_subcategories?.name || subcategorySlug,
    title: data.title,
    description: data.description,
    imageUrl: data.image_url,
    published: data.published,
    createdAt: data.created_at,
  };
}

export async function adminDeleteGalleryItem(id: number) {
  const { error } = await supabaseAdmin.from("gallery_items").delete().eq("id", id);
  if (error) {
    console.error("Supabase delete error:", error);
    throw new Error(`Failed to delete gallery item: ${error.message}`);
  }
  return { success: true, data: null };
}

export async function adminFetchAllGalleryItems(categorySlug?: string): Promise<GalleryItem[]> {
  try {
    let query = supabase
      .from("gallery_items")
      .select("*, gallery_categories!inner(slug), gallery_subcategories!inner(slug, name)")
      .order("created_at", { ascending: false });

    if (categorySlug) {
      query = query.eq("gallery_categories.slug", categorySlug);
    }
    const { data, error } = await query;
    if (!error && data) {
      return data.map((item: any) => ({
        id: item.id,
        categorySlug: item.gallery_categories?.slug || categorySlug || "decorations",
        subcategorySlug: item.gallery_subcategories?.slug || "",
        subcategoryName: item.gallery_subcategories?.name || "",
        title: item.title,
        description: item.description,
        imageUrl: item.image_url,
        published: item.published,
        createdAt: item.created_at,
      }));
    }
  } catch (e) {
    console.error("adminFetchAllGalleryItems error:", e);
  }
  return [];
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

