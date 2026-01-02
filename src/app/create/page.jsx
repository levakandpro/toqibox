// src/app/create/page.jsx
// Страница создания: проверяет авторизацию и редиректит на /author или /login

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../features/auth/supabaseClient.js";

export default function CreatePage() {
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const hasSession = !!data?.session;

        if (!alive) return;

        if (!hasSession) {
          // Сохраняем путь для возврата после логина
          localStorage.setItem("toqibox:returnTo", "/author");
          navigate("/login", { replace: true });
          return;
        }

        // Если авторизован - редиректим на страницу артиста
        navigate("/author", { replace: true });
      } catch (e) {
        console.error("Ошибка при проверке авторизации:", e);
        // При ошибке тоже редиректим на логин
        localStorage.setItem("toqibox:returnTo", "/author");
        navigate("/login", { replace: true });
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ opacity: 0.85 }}>Проверяю авторизацию...</div>
    </div>
  );
}
