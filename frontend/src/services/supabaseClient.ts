import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://liszotiorqqcbuwhwbvu.supabase.co";

// Publishable key — safe for public reads (gallery display)
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// Secret key — used ONLY for admin write operations (upload / delete)
// Stored as an environment variable, never hardcoded in source.
const supabaseSecretKey = import.meta.env.VITE_SUPABASE_SECRET_KEY as string;

// Public client (read-only gallery queries)
export const supabase = createClient(supabaseUrl, supabasePublishableKey);

// Admin client (write operations: insert, update, delete gallery items & storage)
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
