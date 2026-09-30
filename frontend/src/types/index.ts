export interface GalleryItem {
  id: number;
  categorySlug: string;
  subcategorySlug: string;
  subcategoryName: string;
  title: string;
  description: string;
  imageUrl: string;
  published: boolean;
  isFeatured?: boolean;
  createdAt: string;
}

export interface GalleryItemFormValues {
  categorySlug: string;
  subcategorySlug: string;
  title: string;
  description: string;
  published: boolean;
  imageFile?: File | null;
}

export interface EnquiryFormValues {
  name: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: string;
  servicesInterested: string[];
  message: string;
}

export interface EnquiryRecord extends EnquiryFormValues {
  id: number;
  createdAt: string;
  status: "NEW" | "CONTACTED" | "CLOSED";
}

export interface AdminUser {
  email: string;
  role: string;
}

export interface DashboardStats {
  totalImages: number;
  totalEnquiries: number;
  imagesByCategory: Record<string, number>;
  recentUploads: GalleryItem[];
  recentEnquiries: EnquiryRecord[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
