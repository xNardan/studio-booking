import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Brak kluczy Supabase. Skonfiguruj VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY w zmiennych środowiskowych.");
}

/**
 * SECURITY NOTE:
 * Ensure Row Level Security (RLS) is ENABLED on the 'availability' table in your Supabase Dashboard.
 * 1. Enable RLS for the table.
 * 2. Create a policy for SELECT: Allow 'public' (unauthenticated).
 * 3. Create a policy for ALL: Allow only 'authenticated' users.
 * See 'supabase_fix.sql' for the exact commands.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);