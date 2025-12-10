import { createClient } from '@supabase/supabase-js@2.47.10';
import { projectId, publicAnonKey } from './info';

// Create a single Supabase client instance to avoid multiple client warnings
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey
    );
  }
  return supabaseClient;
}
