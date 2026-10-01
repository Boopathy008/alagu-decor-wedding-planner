import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { serviceCategories, getCategoryBySlug } from "@/config/services";
import {
  adminCreateGalleryItem,
  adminFetchAllGalleryItems,
  adminSetFeaturedGalleryItem,
  adminUnsetFeaturedGalleryItem,
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
  const [originalIsFeatured, setOriginalIsFeatured] = useState(false); // track what it was before editing
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState(false);

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
        setOriginalIsFeatured(Boolean(item.isFeatured));
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

      const itemId = savedItem?.id ?? (isEditing && id ? Number(id) : null);

      if (itemId) {
        if (isFeatured && !originalIsFeatured) {
          // User just CHECKED the box → set as front page cover for this subcategory
          await adminSetFeaturedGalleryItem(itemId, categorySlug, subcategorySlug);
        } else if (!isFeatured && originalIsFeatured) {
          // User just UNCHECKED the box → remove from front page cover
          await adminUnsetFeaturedGalleryItem(itemId, categorySlug);
        } else if (isFeatured && originalIsFeatured) {
          // Still featured — re-apply to make sure
          await adminSetFeaturedGalleryItem(itemId, categorySlug, subcategorySlug);
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

        {/* ─── Published ─────────────────────────────────────────────────── */}
        <div className="border border-charcoal/15 bg-white p-4 rounded">
          <p className="text-xs uppercase tracking-widest2 text-charcoal/40 mb-3">Visibility</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4"
            />
            <div>
              <span className="text-sm font-medium">Published (visible on the public site)</span>
              <p className="text-xs text-charcoal/40">
                Show this image in Our Works gallery page
              </p>
            </div>
          </label>
        </div>

        {/* ─── Radio Button for Homepage Image Selection ───────────────────── */}
        <div
          className={`border-2 rounded-lg p-5 cursor-pointer transition-all duration-200 ${
            isFeatured
              ? "border-amber-500 bg-amber-50/80 shadow-md shadow-amber-100/50"
              : "border-charcoal/15 bg-white hover:border-amber-300"
          }`}
          onClick={() => {
            setIsFeatured(true);
            setPublished(true);
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest2 text-amber-700/70 mb-2">
            Homepage Display Option
          </p>
          <label className="flex items-start gap-3 cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <input
              type="radio"
              name="homepageSelectedImage"
              checked={isFeatured}
              onChange={() => {
                setIsFeatured(true);
                setPublished(true);
              }}
              className="mt-0.5 w-5 h-5 text-amber-600 focus:ring-amber-500 accent-amber-600 cursor-pointer"
            />
            <div>
              <span className={`text-base font-semibold ${isFeatured ? "text-amber-900" : "text-charcoal"}`}>
                Show this image on the Homepage
              </span>
              <p className="text-xs text-charcoal/60 mt-1 leading-relaxed">
                {isFeatured
                  ? `🔘 Radio selected: This image is set to display on the homepage for "${category?.name}". Selecting a different image's radio button will automatically switch the homepage cover to that new image.`
                  : `Select this radio button to display this image on the homepage for "${category?.name}". Unselected images remain available in Our Works.`}
              </p>
            </div>
          </label>
          {isFeatured && (
            <p className="mt-2 text-[11px] text-amber-700 font-medium pl-8">
              ℹ️ Selecting this radio button unselects any previous homepage cover for this category.
            </p>
          )}
        </div>

        {saving && (
          <p className="text-sm text-amber-600 animate-pulse">
            ⏳ {isFeatured ? "Saving & updating front page cover..." : "Saving changes, please wait..."}
          </p>
        )}

        {error && (
          <p className="text-sm font-semibold text-red-600">
            ⚠ {error}
          </p>
        )}

        {successMessage && (
          <p className="text-sm font-semibold text-emerald-600">
            ✓ {isFeatured ? "Saved & set as front page cover!" : "Saved successfully!"} Redirecting...
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
