import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://liszotiorqqcbuwhwbvu.supabase.co";

// Publishable (anon) key — safe for browser use, public read-only queries only.
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_x5KnwBSSCmz_OxKl5cyskw_RFZ10nvP";

// Single public client used for read-only gallery and enquiry queries.
// Admin writes (create / update / delete gallery items) go through the
// Spring Boot backend at /api/admin/gallery — never through Supabase directly.
export const supabase = createClient(supabaseUrl, supabasePublishableKey);
