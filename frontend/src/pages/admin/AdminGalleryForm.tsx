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

  const [categorySlug, setCategorySlug] = useState(searchParams.get("category") || serviceCategories[0].slug);
  const [subcategorySlug, setSubcategorySlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const category = getCategoryBySlug(categorySlug);

  useEffect(() => {
    if (category && !category.gallerySubcategories.some((s) => s.slug === subcategorySlug)) {
      setSubcategorySlug(category.gallerySubcategories[0]?.slug || "");
    }
  }, [categorySlug]);

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

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

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

      // If "Show on Front Page" is checked, set this image as the featured cover
      if (isFeatured && savedItem?.id) {
        await adminSetFeaturedGalleryItem(savedItem.id, categorySlug);
      }

      setSuccessMessage(true);
      setTimeout(() => {
        navigate(`/admin/gallery/${categorySlug}`);
      }, 1200);
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

        <label className="block">
          <span className="text-xs uppercase tracking-widest2 text-charcoal/50">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full border border-charcoal/20 bg-white py-2.5 px-3"
            placeholder="Luxury Floral Wedding Stage"
          />
        </label>

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
            <img src={preview} alt="Preview" className="mt-3 h-40 object-cover border border-charcoal/10" />
          )}
        </label>

        {/* Published checkbox */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <span className="text-sm">Published (visible on the public site)</span>
        </label>

        {/* Show on Front Page checkbox */}
        <div
          className={`flex items-start gap-3 border-2 rounded p-4 cursor-pointer transition-colors ${
            isFeatured
              ? "border-amber-500 bg-amber-50"
              : "border-charcoal/15 bg-white hover:border-amber-300"
          }`}
          onClick={() => setIsFeatured((v) => !v)}
        >
          <input
            id="isFeatured"
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 w-4 h-4 accent-amber-500 cursor-pointer"
          />
          <div>
            <label htmlFor="isFeatured" className="text-sm font-semibold cursor-pointer select-none">
              ★ Show on Front Page
            </label>
            <p className="text-xs text-charcoal/50 mt-0.5">
              This image will be shown in the home page section for{" "}
              <strong>{category?.name ?? categorySlug}</strong>.
              Only one image per category can be the front page cover.
            </p>
          </div>
        </div>

        {saving && (
          <p className="text-sm text-amber-600 animate-pulse">
            ⏳ {isFeatured ? "Saving & setting as front page cover..." : "Uploading image, please wait..."}
          </p>
        )}

        {error && (
          <p className="text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        {successMessage && (
          <p className="text-sm font-semibold text-emerald-600">
            ✓ {isFeatured ? "Saved & set as front page cover!" : "Upload successfully!"} Redirecting...
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || successMessage}
            className="px-8 py-3 bg-charcoal text-ivory text-xs uppercase tracking-widest2 hover:bg-accent transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : successMessage ? "Saved!" : isEditing ? "Save Changes" : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}
