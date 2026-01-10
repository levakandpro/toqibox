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

      // Проверяем, является ли пользователь админом (только по email)
      // Админ только один: levakandproduction@gmail.com
      const isAdmin = user.email === "levakandproduction@gmail.com";
      
      // Проверяем, новый ли это пользователь (регистрация) или старый (вход)
      // Если пользователь создан меньше 60 секунд назад - значит это новая регистрация
      let isNewUser = false;
      if (user.created_at) {
        const userAge = Date.now() - new Date(user.created_at).getTime();
        isNewUser = userAge < 60000; // Меньше 60 секунд - новый пользователь
        
        console.log('[Auth] Информация о пользователе:', {
          email: user.email,
          isAdmin,
          isNewUser,
          created_at: user.created_at,
          age_seconds: Math.floor(userAge / 1000)
        });
      }
      
      // Отправляем уведомление о новой регистрации (если это новый пользователь, НЕ админ)
      // Выполняем асинхронно, не блокируя остальной код
      if (isNewUser && !isAdmin) {
        console.log('[Auth] 🆕 Новая регистрация - отправка уведомления в Telegram...');
        // НЕ ждем ответа, отправляем в фоне
        fetch('/api/tg/notify-new-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_id: user.id,
            email: user.email 
          })
        }).then(async res => {
          const errorText = await res.text().catch(() => 'Unknown error');
          if (res.ok) {
            const result = JSON.parse(errorText).catch(() => ({}));
            console.log('[Auth] ✅ Уведомление о регистрации отправлено в Telegram:', result);
          } else {
            let errorBody;
            try {
              errorBody = JSON.parse(errorText);
            } catch {
              errorBody = errorText;
            }
            console.error('[Auth] ❌ Ошибка отправки уведомления в Telegram:', {
              status: res.status,
              statusText: res.statusText,
              error: errorBody
            });
            // Показываем пользователю конкретную ошибку
            if (errorBody?.missing) {
              console.error('[Auth] ❌ Отсутствуют переменные окружения в Cloudflare Pages:', errorBody.missing);
              console.error('[Auth] 💡 Добавь эти переменные в Cloudflare Pages Dashboard → Settings → Environment Variables');
            }
          }
        }).catch(err => {
          console.error('[Auth] ❌ Ошибка при вызове notify-new-user:', err.message || err);
        });
      }

      // Если админ - редиректим на админку
      if (isAdmin) {
        console.log("🔑 Админ - редирект на /admin");
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
