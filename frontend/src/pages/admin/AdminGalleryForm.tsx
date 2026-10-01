import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { serviceCategories, getCategoryBySlug } from "@/config/services";
import { supabase } from "@/services/supabaseClient";
import {
  adminCreateGalleryItem,
  adminSetFeaturedGalleryItem,
  adminUpdateGalleryItem,
} from "@/services/api";

export default function AdminGalleryForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [categorySlug, setCategorySlug] = useState(
    searchParams.get("category") || serviceCategories[0].slug
  );
  const [subcategorySlug, setSubcategorySlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(true);
  // isFeatured: true = "Show on Homepage", false = "Show in Gallery Only"
  const [isFeatured, setIsFeatured] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

  const category = getCategoryBySlug(categorySlug);

  // Reset subcategory when category changes
  useEffect(() => {
    if (
      category &&
      !category.gallerySubcategories.some((s) => s.slug === subcategorySlug)
    ) {
      setSubcategorySlug(category.gallerySubcategories[0]?.slug || "");
    }
  }, [categorySlug]);

  // Load existing item directly from DB when editing — ensures exact isFeatured state
  useEffect(() => {
    if (!isEditing || !id) return;
    setLoading(true);

    async function loadItem() {
      try {
        const { data, error: dbErr } = await supabase
          .from("gallery_items")
          .select("*, gallery_categories(slug), gallery_subcategories(slug)")
          .eq("id", Number(id))
          .maybeSingle();

        if (!dbErr && data) {
          if (data.gallery_categories?.slug) {
            setCategorySlug(data.gallery_categories.slug);
          }
          if (data.gallery_subcategories?.slug) {
            setSubcategorySlug(data.gallery_subcategories.slug);
          }
          setTitle(data.title || "");
          setDescription(data.description || "");
          setPublished(Boolean(data.published));
          setIsFeatured(Boolean(data.is_featured));
          setPreview(data.image_url);
        }
      } catch (e) {
        console.error("Failed to load item:", e);
      } finally {
        setLoading(false);
      }
    }

    loadItem();
  }, [id, isEditing]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!isEditing && !file) {
      alert("Please select an image first.");
      return;
    }

    setSaving(true);
    setSuccessMessage(false);
    setError(null);

    const finalTitle = title.trim() || file?.name || "Gallery Image";

    const formData = new FormData();
    formData.append("categorySlug", categorySlug);
    formData.append("subcategorySlug", subcategorySlug);
    formData.append("title", finalTitle);
    formData.append("description", description);
    formData.append("published", String(published));
    if (file) formData.append("image", file);

    try {
      let savedItem;
      if (isEditing && id) {
        savedItem = await adminUpdateGalleryItem(Number(id), formData);
      } else {
        savedItem = await adminCreateGalleryItem(formData);
      }

      const itemId = savedItem?.id ?? (isEditing && id ? Number(id) : null);
      if (itemId) {
        if (isFeatured) {
          // Mark only this image as featured, clearing all others globally
          await adminSetFeaturedGalleryItem(itemId);
        } else {
          // If "Show in Gallery Only" is selected, explicitly unfeature in DB
          await supabase
            .from("gallery_items")
            .update({ is_featured: false })
            .eq("id", itemId);
        }
      }

      setSuccessMessage(true);
      setTimeout(() => {
        navigate(`/admin/gallery/${categorySlug}`);
      }, 1400);
    } catch (err: any) {
      setError(err?.message || "Upload failed. Check file size/type and try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-xl py-12 text-center text-charcoal/60">
        <p className="animate-pulse">Loading gallery item details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-8">
        {isEditing ? "Edit Gallery Image" : "Add New Gallery Image"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Category */}
        <label className="block">
          <span className="text-xs uppercase tracking-widest2 text-charcoal/50">
            Main Category
          </span>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="mt-1 w-full border border-charcoal/20 bg-white py-2.5 px-3"
          >
            {serviceCategories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {/* Subcategory */}
        <label className="block">
          <span className="text-xs uppercase tracking-widest2 text-charcoal/50">
            Subcategory
          </span>
          <select
            value={subcategorySlug}
            onChange={(e) => setSubcategorySlug(e.target.value)}
            className="mt-1 w-full border border-charcoal/20 bg-white py-2.5 px-3"
          >
            {category?.gallerySubcategories.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        {/* Title */}
        <label className="block">
          <span className="text-xs uppercase tracking-widest2 text-charcoal/50">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full border border-charcoal/20 bg-white py-2.5 px-3"
            placeholder="Luxury Floral Wedding Stage"
          />
        </label>

        {/* Description */}
        <label className="block">
          <span className="text-xs uppercase tracking-widest2 text-charcoal/50">
            Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full border border-charcoal/20 bg-white py-2.5 px-3"
            placeholder="Elegant floral wedding stage setup."
          />
        </label>

        {/* Image upload */}
        <label className="block">
          <span className="text-xs uppercase tracking-widest2 text-charcoal/50">
            Image {isEditing && "(leave empty to keep current image)"}
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            className="mt-1 w-full text-sm"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-3 h-40 object-cover border border-charcoal/10"
            />
          )}
        </label>

        {/* Published checkbox */}
        <div className="border border-charcoal/15 bg-white p-4 rounded">
          <p className="text-xs uppercase tracking-widest2 text-charcoal/40 mb-3">
            Visibility
          </p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4"
            />
            <div>
              <span className="text-sm font-medium">
                Published (visible on the public site)
              </span>
              <p className="text-xs text-charcoal/40 mt-0.5">
                When checked, this image appears in Our Works gallery and category pages.
              </p>
            </div>
          </label>
        </div>

        {/* ── Homepage Display Options (Radio Buttons) ─────────────────────────── */}
        <div className="border border-charcoal/20 bg-white p-5 rounded-lg space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest2 text-charcoal/70">
              Homepage Display Options
            </h3>
            <p className="text-xs text-charcoal/50 mt-1">
              Select whether this image should serve as the single featured image on the main homepage.
            </p>
          </div>

          <div className="space-y-3">
            {/* Radio Option 1: Show on Homepage */}
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                isFeatured
                  ? "border-amber-500 bg-amber-50/80 shadow-sm"
                  : "border-charcoal/15 bg-white hover:border-amber-300 hover:bg-amber-50/30"
              }`}
            >
              <input
                type="radio"
                name="homepageOption"
                value="featured"
                checked={isFeatured}
                onChange={() => {
                  setIsFeatured(true);
                  setPublished(true); // Must be published to be featured
                }}
                className="mt-0.5 w-4 h-4 accent-amber-600 cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
                  <span className="text-amber-600">★</span> Show on Homepage
                </span>
                <p className="text-xs text-charcoal/60 mt-1 leading-relaxed">
                  This image will appear as the main cover on the homepage.
                  Selecting this automatically clears any previous homepage selection.
                  Only 1 image can be featured on the homepage globally.
                </p>
              </div>
            </label>

            {/* Radio Option 2: Show in Gallery Only */}
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                !isFeatured
                  ? "border-charcoal/40 bg-charcoal/5"
                  : "border-charcoal/15 bg-white hover:border-charcoal/30"
              }`}
            >
              <input
                type="radio"
                name="homepageOption"
                value="gallery"
                checked={!isFeatured}
                onChange={() => setIsFeatured(false)}
                className="mt-0.5 w-4 h-4 accent-charcoal cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold text-charcoal">
                  Show in Gallery Only
                </span>
                <p className="text-xs text-charcoal/60 mt-1 leading-relaxed">
                  This image will be visible in Our Works and category gallery pages,
                  but will NOT be displayed on the main homepage cover.
                </p>
              </div>
            </label>
          </div>

          {isFeatured && (
            <div className="text-[11px] text-amber-800 bg-amber-100/90 border border-amber-200 rounded px-3 py-2">
              ⚠ Saving will make this the main homepage image and remove the previous homepage selection.
            </div>
          )}
        </div>

        {saving && (
          <p className="text-sm text-amber-600 animate-pulse font-medium">
            ⏳ {isFeatured ? "Saving & updating homepage cover..." : "Saving changes, please wait..."}
          </p>
        )}

        {error && (
          <p className="text-sm font-semibold text-red-600 bg-red-50 p-3 rounded border border-red-200">
            ⚠ {error}
          </p>
        )}

        {successMessage && (
          <p className="text-sm font-semibold text-emerald-700 bg-emerald-50 p-3 rounded border border-emerald-200">
            ✓ {isFeatured ? "Saved & set as homepage cover!" : "Saved successfully!"} Redirecting...
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || successMessage}
            className="px-8 py-3 bg-charcoal text-ivory text-xs uppercase tracking-widest2 hover:bg-accent transition-colors disabled:opacity-50 font-medium"
          >
            {saving
              ? "Saving..."
              : successMessage
              ? "Saved!"
              : isEditing
              ? "Save Changes"
              : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
