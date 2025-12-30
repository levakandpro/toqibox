import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Предупреждение в консоли, если переменные не заданы (только в dev)
if (import.meta.env.DEV) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "⚠️ Supabase переменные не заданы. Создайте файл .env.local с:\n" +
      "VITE_SUPABASE_URL=ваш_url\n" +
      "VITE_SUPABASE_ANON_KEY=ваш_ключ"
    );
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
