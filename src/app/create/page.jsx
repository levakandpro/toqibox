// FILE: src/app/create/page.jsx  (НОВЫЙ ФАЙЛ: канон-гейт, /create не редактирует, а кидает в дом)

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
          // вернёмся после логина
          localStorage.setItem("toqibox:returnTo", "/create");
          navigate("/login", { replace: true });
          return;
        }

        // Канон: редактирование внутри дома /a/:slug
        // Пока V1 не знаем slug из БД - отправим в дефолтный дом
        navigate("/a/toqibox-artist?edit=1&tab=tracks&action=add", { replace: true });
      } catch (e) {
        localStorage.setItem("toqibox:returnTo", "/create");
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
      <div style={{ opacity: 0.85 }}>Открываю добавление трека...</div>
    </div>
  );
}
