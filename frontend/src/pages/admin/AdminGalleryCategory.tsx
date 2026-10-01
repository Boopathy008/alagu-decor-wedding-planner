import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getCategoryBySlug } from "@/config/services";
import {
  adminDeleteGalleryItem,
  adminFetchAllGalleryItems,
  adminSetFeaturedGalleryItem,
} from "@/services/api";
import type { GalleryItem } from "@/types";

export default function AdminGalleryCategory() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const category = categorySlug ? getCategoryBySlug(categorySlug) : undefined;

  // We load ALL items globally so we can show the correct radio state even
  // when the featured image belongs to another category.
  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingLong, setDeletingLong] = useState(false);
  const [settingFeaturedId, setSettingFeaturedId] = useState<number | null>(null);
  const settingRef = useRef(false);

  useEffect(() => {
    if (!category) return;
    load();
  }, [category?.slug]);

  function load() {
    setLoading(true);
    // Load ALL items (not filtered by category) so radio state is globally accurate
    adminFetchAllGalleryItems()
      .then(setAllItems)
      .finally(() => setLoading(false));
  }

  // Items in THIS category only (for display in this page)
  const categoryItems = allItems.filter((i) => i.categorySlug === categorySlug);

  // The featured item for THIS category section on the homepage
  const categoryFeatured = categoryItems.find((i) => i.isFeatured);

  async function handleSetFeatured(id: number) {
    if (settingRef.current) return; // prevent double-click
    settingRef.current = true;
    setSettingFeaturedId(id);

    // Optimistic update — set isFeatured for this item and clear other items in this category
    setAllItems((prev) =>
      prev.map((item) => {
        if (item.categorySlug === categorySlug) {
          return { ...item, isFeatured: item.id === id };
        }
        return item;
      })
    );

    try {
      const updated = await adminSetFeaturedGalleryItem(id, categorySlug);
      // Sync with DB truth
      setAllItems(updated);
    } catch (err) {
      console.error("Failed to set featured:", err);
      // Revert optimistic update on failure
      load();
    } finally {
      setSettingFeaturedId(null);
      settingRef.current = false;
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true);
    setDeletingLong(false);
    const wakeTimer = setTimeout(() => setDeletingLong(true), 3000);
    try {
      await adminDeleteGalleryItem(id);
      setAllItems((prev) => prev.filter((i) => i.id !== id));
      setConfirmId(null);
    } finally {
      clearTimeout(wakeTimer);
      setDeleting(false);
      setDeletingLong(false);
    }
  }

  if (!category) return <Navigate to="/admin/gallery" replace />;

  return (
    <div>
      {/* Header */}
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

      {/* Category Homepage Selection Banner */}
      <div className={`mb-8 p-4 rounded border ${
        categoryFeatured
          ? "bg-amber-50 border-amber-300"
          : "bg-charcoal/5 border-charcoal/15"
      }`}>
        <p className="text-xs uppercase tracking-widest2 font-semibold mb-1 text-charcoal/60">
          🏠 Homepage Cover Image for {category.name}
        </p>
        {categoryFeatured ? (
          <div className="flex items-center gap-3">
            <img
              src={categoryFeatured.imageUrl}
              alt={categoryFeatured.title}
              className="w-16 h-12 object-cover rounded border border-amber-300"
            />
            <div>
              <p className="text-sm font-semibold text-charcoal">
                ★ {categoryFeatured.title}
              </p>
              <p className="text-xs text-charcoal/50">
                {categoryFeatured.subcategoryName || categoryFeatured.subcategorySlug}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-charcoal/50">
            No homepage image selected for {category.name}. Click "Show on Homepage" on any image below to select its cover photo.
          </p>
        )}
      </div>

      {/* Gallery Grid — grouped by subcategory */}
      {loading ? (
        <p className="text-charcoal/40">Loading...</p>
      ) : (
        category.gallerySubcategories.map((sub) => {
          const subItems = categoryItems.filter((i) => i.subcategorySlug === sub.slug);
          return (
            <div key={sub.slug} className="mb-10">
              <h2 className="text-sm uppercase tracking-widest2 text-charcoal/50 mb-4">
                {sub.name} ({subItems.length})
              </h2>
              {subItems.length === 0 ? (
                <p className="text-sm text-charcoal/30 mb-2">No images yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {subItems.map((item) => {
                    const isSelected = Boolean(item.isFeatured);
                    const isSetting = settingFeaturedId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`bg-white border group relative transition-all ${
                          isSelected
                            ? "border-amber-400 shadow-md shadow-amber-100"
                            : "border-charcoal/10"
                        }`}
                      >
                        {/* Image */}
                        <div className="relative">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-32 object-cover"
                          />
                          {isSelected && (
                            <span className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 shadow-md">
                              ★ HOMEPAGE
                            </span>
                          )}
                          {isSetting && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                              <span className="text-[10px] text-amber-600 font-bold animate-pulse">
                                Saving...
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card body */}
                        <div className="p-3">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <div className="flex items-center justify-between text-xs text-charcoal/40 mt-1 mb-3">
                            <span>{item.published ? "Published" : "Unpublished"}</span>
                          </div>

                          {/* GLOBAL radio button — Show on Homepage */}
                          {/*
                            The radio `name` is "global_homepage" and it is the
                            same across ALL items in this render. Because all items
                            render in the same React tree, only ONE can be checked.
                          */}
                          <label
                            className={`flex items-center gap-2 cursor-pointer px-2.5 py-2 rounded border text-[11px] font-semibold transition-all select-none ${
                              isSelected
                                ? "bg-amber-500 text-white border-amber-600"
                                : isSetting
                                ? "bg-amber-100 text-amber-700 border-amber-300"
                                : "bg-charcoal/5 text-charcoal/70 border-charcoal/15 hover:border-amber-400 hover:bg-amber-50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="global_homepage"
                              value={String(item.id)}
                              checked={isSelected}
                              disabled={isSetting}
                              onChange={() => {
                                if (!isSelected && !isSetting) {
                                  handleSetFeatured(item.id);
                                }
                              }}
                              className="w-3.5 h-3.5 accent-amber-600 cursor-pointer"
                            />
                            <span>
                              {isSelected
                                ? "✓ Homepage Image"
                                : isSetting
                                ? "Setting..."
                                : "Show on Homepage"}
                            </span>
                          </label>
                        </div>

                        {/* Hover action buttons */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Delete Confirm Modal */}
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
                {deleting ? (deletingLong ? "Waking server..." : "Deleting...") : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
