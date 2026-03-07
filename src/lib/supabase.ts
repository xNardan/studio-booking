import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Brak kluczy Supabase. Skonfiguruj VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY w zmiennych środowiskowych.");
}

// Tworzymy klienta tylko jeśli mamy klucze, w przeciwnym razie eksportujemy null lub rzucamy błąd przy próbie użycia
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);