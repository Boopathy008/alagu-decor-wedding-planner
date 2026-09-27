import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ui/Primitives";
import { WhatsAppButton } from "@/components/layout/Chrome";
import { serviceCategories } from "@/config/services";
import { submitEnquiry } from "@/services/api";
import type { EnquiryFormValues } from "@/types";

const initialValues: EnquiryFormValues = {
  name: "",
  phone: "",
  email: "",
  eventType: "",
  eventDate: "",
  location: "",
  guestCount: "",
  servicesInterested: [],
  message: "",
};

type Errors = Partial<Record<keyof EnquiryFormValues, string>>;

export default function Contact() {
  const [values, setValues] = useState<EnquiryFormValues>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function update<K extends keyof EnquiryFormValues>(key: K, value: EnquiryFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function toggleService(name: string) {
    setValues((v) => ({
      ...v,
      servicesInterested: v.servicesInterested.includes(name)
        ? v.servicesInterested.filter((s) => s !== name)
        : [...v.servicesInterested, name],
    }));
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!values.name.trim()) next.name = "Please enter your name.";
    if (!/^[0-9+\s-]{7,15}$/.test(values.phone.trim())) next.phone = "Enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = "Enter a valid email.";
    if (!values.eventType.trim()) next.eventType = "Please select or enter an event type.";
    if (!values.eventDate) next.eventDate = "Please choose a date.";
    if (!values.location.trim()) next.location = "Please enter a location.";
    if (!values.guestCount.trim() || Number(values.guestCount) <= 0)
      next.guestCount = "Enter an approximate guest count.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    try {
      await submitEnquiry(values);
      setStatus("success");
      setValues(initialValues);
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <SectionHeading eyebrow="Let's Plan Together" title="Plan Your Event" />
      <p className="mt-6 text-charcoal/60 max-w-xl">
        Tell us about your event and we'll get back to you with next steps —
        no obligation, just a conversation to understand what you need.
      </p>

      {status === "success" ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 border border-accent/40 bg-accent/5 p-10 text-center"
        >
          <p className="font-display text-2xl mb-2">Thank you.</p>
          <p className="text-charcoal/60">
            Your enquiry has been received. Our team will reach out shortly.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-16 space-y-8" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Name" error={errors.name}>
              <input
                value={values.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputClass}
                placeholder="Your full name"
              />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input
                value={values.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={inputClass}
                placeholder="+91 90000 00000"
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <input
                type="email"
                value={values.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Event Type" error={errors.eventType}>
              <select
                value={values.eventType}
                onChange={(e) => update("eventType", e.target.value)}
                className={`${inputClass} bg-transparent text-charcoal cursor-pointer`}
              >
                <option value="" disabled>Select Event Type...</option>
                <option value="Wedding">Wedding</option>
                <option value="Engagement">Engagement</option>
                <option value="Haldi">Haldi</option>
                <option value="Reception">Reception</option>
                <option value="Corporate Event">Corporate Event</option>
                <option value="Birthday">Birthday</option>
                <option value="Other">Other Functions / Celebrations</option>
              </select>
            </Field>
            <Field label="Event Date" error={errors.eventDate}>
              <input
                type="date"
                value={values.eventDate}
                onChange={(e) => update("eventDate", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Location" error={errors.location}>
              <input
                value={values.location}
                onChange={(e) => update("location", e.target.value)}
                className={inputClass}
                placeholder="City / Venue"
              />
            </Field>
            <Field label="Approximate Guest Count" error={errors.guestCount}>
              <input
                type="number"
                min={1}
                value={values.guestCount}
                onChange={(e) => update("guestCount", e.target.value)}
                className={inputClass}
                placeholder="e.g. 250"
              />
            </Field>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest2 text-charcoal/50 mb-3">
              Services Interested In
            </p>
            <div className="flex flex-wrap gap-2">
              {serviceCategories.map((c) => (
                <button
                  type="button"
                  key={c.slug}
                  onClick={() => toggleService(c.name)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest2 border transition-colors ${
                    values.servicesInterested.includes(c.name)
                      ? "bg-charcoal text-ivory border-charcoal"
                      : "border-charcoal/20 text-charcoal/70 hover:border-accent hover:text-accent"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <Field label="Message">
            <textarea
              value={values.message}
              onChange={(e) => update("message", e.target.value)}
              rows={5}
              className={inputClass}
              placeholder="Tell us more about your vision..."
            />
          </Field>

          {status === "error" && (
            <p className="text-sm text-red-600">
              Something went wrong sending your enquiry. Please try again, or
              reach us directly on WhatsApp.
            </p>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="px-10 py-4 bg-charcoal text-ivory text-xs uppercase tracking-widest2 hover:bg-accent transition-colors duration-500 disabled:opacity-50"
          >
            {status === "submitting" ? "Sending..." : "Submit Enquiry"}
          </button>
        </form>
      )}

      <WhatsAppButton />
    </div>
  );
}

const inputClass =
  "w-full bg-transparent border-b border-charcoal/20 py-3 focus:outline-none focus:border-accent transition-colors placeholder:text-charcoal/30";

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest2 text-charcoal/50">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
    </label>
  );
}
