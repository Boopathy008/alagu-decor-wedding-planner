import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getCategoryBySlug } from "@/config/services";
import { adminDeleteGalleryItem, adminFetchAllGalleryItems } from "@/services/api";
import type { GalleryItem } from "@/types";

export default function AdminGalleryCategory() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined;
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!category) return;
    load();
  }, [category?.slug]);

  function load() {
    if (!category) return;
    setLoading(true);
    adminFetchAllGalleryItems(category.slug)
      .then(setItems)
      .finally(() => setLoading(false));
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    try {
      await adminDeleteGalleryItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setConfirmId(null);
    } finally {
      setDeleting(false);
    }
  }

  if (!category) return <Navigate to="/admin/gallery" replace />;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/admin/gallery" className="text-xs uppercase tracking-widest2 text-charcoal/40">
            ← All Categories
          </Link>
          <h1 className="font-display text-3xl mt-2">{category.name}</h1>
        </div>
        <Link
          to={`/admin/gallery/new?category=${category.slug}`}
          className="px-5 py-2.5 bg-charcoal text-ivory text-xs uppercase tracking-widest2 hover:bg-accent transition-colors"
        >
          + Add New Image
        </Link>
      </div>

      {loading ? (
        <p className="text-charcoal/40">Loading...</p>
      ) : (
        category.gallerySubcategories.map((sub) => {
          const subItems = items.filter((i) => i.subcategorySlug === sub.slug);
          return (
            <div key={sub.slug} className="mb-10">
              <h2 className="text-sm uppercase tracking-widest2 text-charcoal/50 mb-4">
                {sub.name} ({subItems.length})
              </h2>
              {subItems.length === 0 ? (
                <p className="text-sm text-charcoal/30 mb-2">No images yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {subItems.map((item) => (
                    <div key={item.id} className="bg-white border border-charcoal/10 group relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-3">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-charcoal/40">
                          {item.published ? "Published" : "Unpublished"}
                        </p>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/admin/gallery/edit/${item.id}`}
                          className="bg-charcoal text-ivory text-[10px] uppercase tracking-widest2 px-2 py-1"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setConfirmId(item.id)}
                          className="bg-red-600 text-ivory text-[10px] uppercase tracking-widest2 px-2 py-1"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      {confirmId !== null && (
        <div className="fixed inset-0 bg-deep/60 flex items-center justify-center z-50 px-6">
          <div className="bg-ivory p-8 max-w-sm w-full text-center">
            <p className="font-display text-xl mb-2">
              Are you sure you want to remove this gallery image?
            </p>
            <p className="text-sm text-charcoal/50 mb-8">This cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmId(null)}
                className="px-6 py-2.5 border border-charcoal/20 text-xs uppercase tracking-widest2"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={deleting}
                className="px-6 py-2.5 bg-red-600 text-ivory text-xs uppercase tracking-widest2 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
