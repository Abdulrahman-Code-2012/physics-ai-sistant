import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "https://rxsyzbkosjqndgsuhmzf.supabase.co";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_F3DV1nu5ckTVqHgvYPteBQ_ZisTUMyK";

export const supabase = createClient(url, anonKey);
