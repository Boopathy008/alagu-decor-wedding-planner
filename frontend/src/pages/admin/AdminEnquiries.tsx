import { useEffect, useState } from "react";
import { adminFetchEnquiries } from "@/services/api";
import type { EnquiryRecord } from "@/types";

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetchEnquiries()
      .then(setEnquiries)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Enquiries</h1>

      {loading ? (
        <p className="text-charcoal/40">Loading...</p>
      ) : enquiries.length === 0 ? (
        <p className="text-charcoal/40">No enquiries yet.</p>
      ) : (
        <div className="bg-white border border-charcoal/10 overflow-x-auto rounded shadow-sm">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left border-b border-charcoal/10 text-xs uppercase tracking-widest2 text-charcoal/40 bg-charcoal/5">
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Phone</th>
                <th className="p-3.5">Event</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Guests</th>
                <th className="p-3.5">Services</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e.id} className="border-b border-charcoal/5 last:border-0 hover:bg-charcoal/[0.02]">
                  <td className="p-3.5 font-medium whitespace-nowrap">{e.name}</td>
                  <td className="p-3.5 whitespace-nowrap">{e.phone}</td>
                  <td className="p-3.5 whitespace-nowrap">{e.eventType}</td>
                  <td className="p-3.5 whitespace-nowrap">{e.eventDate}</td>
                  <td className="p-3.5 whitespace-nowrap">{e.location}</td>
                  <td className="p-3.5 whitespace-nowrap">{e.guestCount}</td>
                  <td className="p-3.5 max-w-xs truncate">{e.servicesInterested.join(", ")}</td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="text-xs uppercase tracking-widest2 text-accent bg-accent/10 px-2 py-1 rounded">
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
