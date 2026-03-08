import { supabase as client } from '@/integrations/supabase/client';

/**
 * Ten plik eksportuje klienta Supabase skonfigurowanego dla Twojego projektu.
 * Upewnij się, że w panelu Supabase masz włączone RLS dla tabeli 'availability'.
 */
export const supabase = client;