  import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
export const configured = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("_HERE") && SUPABASE_ANON_KEY.length > 20 && !SUPABASE_ANON_KEY.includes("_HERE");
export const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
