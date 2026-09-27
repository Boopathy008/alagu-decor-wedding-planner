import { useEffect, useState } from "react";
import { adminFetchDashboard } from "@/services/api";
import type { DashboardStats } from "@/types";
import { serviceCategories } from "@/config/services";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetchDashboard()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Dashboard</h1>

      {loading ? (
        <p className="text-charcoal/40">Loading...</p>
      ) : !stats ? (
        <p className="text-charcoal/40">Unable to load dashboard data.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <StatCard label="Total Gallery Images" value={stats.totalImages} />
            <StatCard label="Total Enquiries" value={stats.totalEnquiries} />
            <StatCard
              label="Categories Active"
              value={Object.values(stats.imagesByCategory).filter((v) => v > 0).length}
            />
            <StatCard label="Recent Uploads" value={stats.recentUploads.length} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 border border-charcoal/10">
              <h2 className="text-sm uppercase tracking-widest2 text-charcoal/50 mb-4">
                Images by Category
              </h2>
              <ul className="space-y-3">
                {serviceCategories.map((c) => (
                  <li key={c.slug} className="flex items-center justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="font-display">{stats.imagesByCategory[c.slug] ?? 0}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 border border-charcoal/10">
              <h2 className="text-sm uppercase tracking-widest2 text-charcoal/50 mb-4">
                Recent Enquiries
              </h2>
              {stats.recentEnquiries.length === 0 ? (
                <p className="text-sm text-charcoal/40">No enquiries yet.</p>
              ) : (
                <ul className="space-y-4">
                  {stats.recentEnquiries.map((e) => (
                    <li key={e.id} className="text-sm border-b border-charcoal/10 pb-3">
                      <p className="font-medium">{e.name}</p>
                      <p className="text-charcoal/50">
                        {e.eventType} · {e.eventDate}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white p-6 border border-charcoal/10">
      <p className="font-display text-4xl">{value}</p>
      <p className="text-xs uppercase tracking-widest2 text-charcoal/50 mt-2">{label}</p>
    </div>
  );
}
