import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Reads Supabase credentials dynamically from Vite environment variables.
// These variables are loaded locally from `.env.local` and in production
// from your GitHub Repository Secrets during the GitHub Pages deployment.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
	return Boolean(supabaseUrl && supabaseAnonKey);
}

/**
 * Lazily creates the Supabase client on first use instead of at module load.
 * Returns null when the environment variables are missing so callers can
 * surface a user-facing error instead of crashing on createClient(undefined).
 */
export function getSupabase(): SupabaseClient | null {
	if (!isSupabaseConfigured()) {
		return null;
	}
	if (!client) {
		client = createClient(supabaseUrl, supabaseAnonKey);
	}
	return client;
}
