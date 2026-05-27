import { createClient } from "@supabase/supabase-js";

// Reads Supabase credentials dynamically from Vite environment variables.
// These variables are loaded locally from `.env.local` and in production
// from your GitHub Repository Secrets during the GitHub Pages deployment.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
	console.warn(
		"[SUPABASE] VITE_SUPABASE_ANON_KEY is missing! Direct database queries will fail until the key is provided.",
	);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
