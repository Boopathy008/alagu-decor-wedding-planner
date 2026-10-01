import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { serviceCategories, getCategoryBySlug } from "@/config/services";
import {
  adminCreateGalleryItem,
  adminFetchAllGalleryItems,
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
  // isFeatured: true = "Show on Homepage", false = "Gallery only"
  const [isFeatured, setIsFeatured] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
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

  // Load existing item when editing — reads isFeatured from DB
  useEffect(() => {
    if (!isEditing || !id) return;
    adminFetchAllGalleryItems().then((items) => {
      const item = items.find((i) => i.id === Number(id));
      if (item) {
        setCategorySlug(item.categorySlug);
        setSubcategorySlug(item.subcategorySlug);
        setTitle(item.title);
        setDescription(item.description);
        setPublished(item.published);
        setIsFeatured(Boolean(item.isFeatured));
        setPreview(item.imageUrl);
      }
    });
  }, [id]);

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

      // If "Show on Homepage" is selected, save it to DB immediately
      // This clears all other featured items globally and marks only this one
      const itemId = savedItem?.id ?? (isEditing && id ? Number(id) : null);
      if (itemId && isFeatured) {
        await adminSetFeaturedGalleryItem(itemId);
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

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl mb-8">
        {isEditing ? "Edit Gallery Image" : "Add New Gallery Image"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
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
                When checked, this image appears in Our Works gallery and all 7
                category pages. Uncheck to hide from the public site.
              </p>
            </div>
          </label>
        </div>

        {/* ── Homepage Display Radio ─────────────────────────────────────────── */}
        <div className="border border-charcoal/20 bg-white p-5 rounded-lg">
          <p className="text-xs font-bold uppercase tracking-widest2 text-charcoal/60 mb-4">
            🏠 Homepage Display
          </p>

          <div className="space-y-3">
            {/* Radio 1 — Show on Homepage */}
            <label
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                isFeatured
                  ? "border-amber-500 bg-amber-50 shadow-sm"
                  : "border-charcoal/15 bg-white hover:border-amber-300 hover:bg-amber-50/40"
              }`}
            >
              <input
                type="radio"
                name="homepageOption"
                value="featured"
                checked={isFeatured}
                onChange={() => {
                  setIsFeatured(true);
                  setPublished(true); // must be published to appear on homepage
                }}
                className="mt-0.5 w-4 h-4 accent-amber-600 cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold text-charcoal block">
                  ★ Show on Homepage
                </span>
                <p className="text-xs text-charcoal/55 mt-0.5 leading-relaxed">
                  This image will appear as the main cover on the homepage.
                  Selecting this automatically removes the previous homepage image.
                  Only ONE image can be on the homepage at a time.
                </p>
              </div>
            </label>

            {/* Radio 2 — Gallery only */}
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
                <span className="text-sm font-semibold text-charcoal block">
                  Show in Gallery Only
                </span>
                <p className="text-xs text-charcoal/55 mt-0.5 leading-relaxed">
                  This image will be visible in Our Works and category gallery
                  pages, but will NOT be shown on the homepage.
                </p>
              </div>
            </label>
          </div>

          {isFeatured && (
            <p className="mt-3 text-[11px] text-amber-700 bg-amber-100 border border-amber-200 rounded px-3 py-2">
              ⚠ Saving will set this as the homepage image and automatically
              unselect any previously selected homepage image.
            </p>
          )}
        </div>

        {saving && (
          <p className="text-sm text-amber-600 animate-pulse">
            ⏳ {isFeatured ? "Saving & updating homepage cover..." : "Saving changes, please wait..."}
          </p>
        )}

        {error && (
          <p className="text-sm font-semibold text-red-600">⚠ {error}</p>
        )}

        {successMessage && (
          <p className="text-sm font-semibold text-emerald-600">
            ✓ {isFeatured ? "Saved & set as homepage image!" : "Saved successfully!"} Redirecting...
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || successMessage}
            className="px-8 py-3 bg-charcoal text-ivory text-xs uppercase tracking-widest2 hover:bg-accent transition-colors disabled:opacity-50"
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
