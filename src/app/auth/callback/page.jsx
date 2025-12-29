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

      // 1) если есть returnTo - возвращаем туда
      const returnTo = localStorage.getItem("toqibox:returnTo");
      if (returnTo && typeof returnTo === "string" && returnTo.startsWith("/")) {
        localStorage.removeItem("toqibox:returnTo");
        navigate(returnTo, { replace: true });
        return;
      }

      // 2) иначе - дефолт в дом автора (пока V1)
      navigate("/a/toqibox-artist", { replace: true });
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
