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

      // Нормализация returnTo (если в проекте кто-то ещё пишет туда старые ссылки)
      const raw = localStorage.getItem("toqibox:returnTo") || "";
      localStorage.removeItem("toqibox:returnTo");

      const bad =
        raw.startsWith("/a/") ||
        raw.startsWith("/t/") ||
        raw.includes("edit=1") ||
        raw.startsWith("/create");

      const next = bad ? "/author" : (raw || "/author");

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
