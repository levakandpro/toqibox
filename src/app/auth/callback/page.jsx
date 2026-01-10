// FILE: src/app/auth/callback/page.jsx  (твой AuthCallbackPage, без хардкода, с returnTo)

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../features/auth/supabaseClient.js";

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    const run = async () => {
      // Supabase сам вытаскивает сессию из URL (detectSessionInUrl: true)
      const { data, error } = await supabase.auth.getSession();

      if (!alive) return;

      if (error) {
        console.error(error);
        navigate("/login", { replace: true });
        return;
      }

      const user = data?.session?.user;
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }

      // ОТПРАВЛЯЕМ УВЕДОМЛЕНИЕ О НОВОЙ РЕГИСТРАЦИИ СНАЧАЛА (до проверки админа)
      // Проверяем, новая ли это регистрация по created_at пользователя
      // Если пользователь создан меньше 30 секунд назад - считаем новым
      let isNewUser = false;
      if (user.created_at) {
        const userAge = new Date() - new Date(user.created_at);
        isNewUser = userAge < 30000; // Меньше 30 секунд - новый пользователь
        console.log('[Auth] Проверка нового пользователя:', {
          email: user.email,
          created_at: user.created_at,
          age_ms: userAge,
          isNewUser
        });
      }
      
      // Отправляем уведомление о новой регистрации (если это новый пользователь)
      // Выполняем асинхронно, не блокируя остальной код
      if (isNewUser) {
        console.log('[Auth] 🆕 Отправка уведомления о новой регистрации...');
        fetch('/api/tg/notify-new-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_id: user.id,
            email: user.email 
          })
        }).then(async res => {
          if (res.ok) {
            const result = await res.json().catch(() => ({}));
            console.log('[Auth] ✅ Уведомление о регистрации отправлено:', result);
          } else {
            const errorText = await res.text().catch(() => 'Unknown error');
            console.error('[Auth] ❌ Ошибка отправки уведомления:', {
              status: res.status,
              statusText: res.statusText,
              body: errorText
            });
          }
        }).catch(err => {
          console.error('[Auth] ❌ Ошибка при вызове notify-new-user:', err);
        });
      }

      // Проверяем, является ли пользователь админом (не блокируем, если ошибка)
      let isAdmin = false;
      try {
        const { data: adminData, error: adminError } = await supabase
          .from("admins")
          .select("id")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .maybeSingle(); // Используем maybeSingle вместо single, чтобы не падать при отсутствии записи
        
        if (adminError) {
          console.warn('[Auth] Ошибка проверки админа (не критично):', adminError);
          // Не падаем, просто продолжаем без проверки через таблицу
        } else {
          isAdmin = !!adminData;
        }
        
        // Также проверяем по email для надежности
        if (!isAdmin && user.email === "levakandproduction@gmail.com") {
          isAdmin = true;
          console.log("🔑 Admin access granted by email:", user.email);
        }
      } catch (e) {
        // Если таблица admins не существует или критическая ошибка, проверяем только по email
        console.warn('[Auth] Ошибка при проверке админа (не критично):', e);
        if (user.email === "levakandproduction@gmail.com") {
          isAdmin = true;
          console.log("🔑 Admin access granted by email (fallback):", user.email);
        }
      }

      // Если админ - редиректим на админку
      if (isAdmin) {
        console.log("🔑 Admin detected, redirecting to /admin");
        navigate("/admin", { replace: true });
        return;
      }

      // Нормализация returnTo (если в проекте кто-то ещё пишет туда старые ссылки)
      const raw = localStorage.getItem("toqibox:returnTo") || "";
      localStorage.removeItem("toqibox:returnTo");

      // Определяем, работаем ли мы локально
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

      // Извлекаем только путь из URL, если это полный URL
      let path = raw;
      if (raw.startsWith("http://") || raw.startsWith("https://")) {
        try {
          const url = new URL(raw);
          path = url.pathname;
          
          // Если это production URL на локальной машине, игнорируем его
          if (url.hostname === "toqibox.win" && isLocal) {
            console.log("⚠️ Production URL detected on localhost, ignoring:", raw);
            path = ""; // Сбрасываем путь, если это production URL на локальной машине
          }
        } catch (e) {
          console.error("Error parsing returnTo URL:", e);
          path = "";
        }
      }

      // Проверяем, что путь не содержит домен (после извлечения pathname это не должно быть возможно, но на всякий случай)
      if (path.includes("toqibox.win")) {
        console.log("⚠️ Path contains production domain, clearing:", path);
        path = "";
      }

      // Блокируем только редактирование и создание, но разрешаем просмотр страниц автора и трека
      const bad =
        path.includes("edit=1") ||
        path.startsWith("/create");

      const next = bad ? "/author" : (path || "/author");

      console.log("🔀 Redirecting after login:", {
        raw,
        path,
        next,
        isLocal,
        currentHost: window.location.hostname
      });

      navigate(next, { replace: true });
    };

    run();

    return () => {
      alive = false;
    };
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ opacity: 0.85 }}>Вход выполнен. Возвращаю...</div>
    </div>
  );
}
