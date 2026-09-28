import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://liszotiorqqcbuwhwbvu.supabase.co";
const supabasePublishableKey = "sb_publishable_x5KnwBSSCmz_OxKl5cyskw_RFZ10nvP";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
