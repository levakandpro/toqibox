// src/app/create/page.jsx  (ПАТЧ: канон-гейт, /create кидает в /author)

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../features/auth/supabaseClient.js";

export default function CreatePage() {
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        // ВРЕМЕННО: Отключаем проверку авторизации для локальной разработки
        // TODO: Вернуть проверку авторизации позже
        
        // ВРЕМЕННО: Просто переходим на /author без проверки
        if (!alive) return;
        navigate("/author", { replace: true });
        
        /* ЗАКОММЕНТИРОВАНО ДЛЯ ЛОКАЛЬНОЙ РАЗРАБОТКИ
        const { data } = await supabase.auth.getSession();
        const hasSession = !!data?.session;

        if (!alive) return;

        if (!hasSession) {
          // вернёмся после логина
          localStorage.setItem("toqibox:returnTo", "/author");
          navigate("/login", { replace: true });
          return;
        }

        // Канон: редактирование ТОЛЬКО через /author
        navigate("/author", { replace: true });
        */
      } catch (e) {
        console.error("Ошибка при переходе в кабинет:", e);
        // ВРЕМЕННО: Не редиректим на логин
        // localStorage.setItem("toqibox:returnTo", "/author");
        // navigate("/login", { replace: true });
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ opacity: 0.85 }}>Открываю кабинет артиста...</div>
    </div>
  );
}
