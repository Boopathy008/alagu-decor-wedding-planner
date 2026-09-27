import { Link } from "react-router-dom";
import { serviceCategories } from "@/config/services";

export default function AdminGallery() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Gallery</h1>
        <Link
          to="/admin/gallery/new"
          className="px-5 py-2.5 bg-charcoal text-ivory text-xs uppercase tracking-widest2 hover:bg-accent transition-colors"
        >
          + Add New Image
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviceCategories.map((c) => (
          <Link
            key={c.slug}
            to={`/admin/gallery/${c.slug}`}
            className="block bg-white border border-charcoal/10 p-6 hover:border-accent transition-colors"
          >
            <p className="font-display text-xl mb-1">{c.name}</p>
            <p className="text-xs text-charcoal/40">
              {c.gallerySubcategories.length} subcategories
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
