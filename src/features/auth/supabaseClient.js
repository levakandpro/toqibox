import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Проверка переменных окружения
if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = "⚠️ КРИТИЧЕСКАЯ ОШИБКА: Supabase переменные не заданы!\n" +
    "Проверьте, что в .env.local (локально) или в Cloudflare Pages (продакшен) установлены:\n" +
    "VITE_SUPABASE_URL=ваш_url\n" +
    "VITE_SUPABASE_ANON_KEY=ваш_ключ";
  
  console.error(errorMsg);
  
  // В продакшене не показываем alert, только в dev
  if (import.meta.env.DEV) {
    console.warn(errorMsg);
  }
}

// Проверяем, что URL и ключ валидны
if (supabaseUrl && !supabaseUrl.startsWith("http")) {
  console.error("⚠️ VITE_SUPABASE_URL должен начинаться с http:// или https://");
}

if (supabaseAnonKey && supabaseAnonKey.length < 50) {
  console.warn("⚠️ VITE_SUPABASE_ANON_KEY выглядит слишком коротким. Проверьте правильность ключа.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-client-info': 'toqibox-web@1.0.0',
    },
  },
});
