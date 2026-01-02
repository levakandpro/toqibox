// FILE: src/app/login/page.jsx

import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../features/auth/supabaseClient.js";

import toqivhod from "../../assets/toqivhod.png";
import verifGold from "../../assets/verifgold.svg";
import boxPng from "../../assets/box.png";
import ico24 from "../../assets/24.svg";
import telegramIcon from "../../assets/share/telegram.svg";
import gmailIcon from "../../assets/share/gmail.svg";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);

  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [errorText, setErrorText] = useState("");

  const [premiumOpen, setPremiumOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(null); // 'terms', 'privacy', 'support'
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Проверяем, авторизован ли пользователь
  useEffect(() => {
    let alive = true;

    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session && alive) {
          const user = data.session.user;
          
          // Проверяем, является ли пользователь админом
          let isAdmin = false;
          try {
            const { data: adminData } = await supabase
              .from("admins")
              .select("id")
              .eq("user_id", user.id)
              .eq("is_active", true)
              .single();
            
            isAdmin = !!adminData;
            
            // Также проверяем по email для надежности
            if (!isAdmin && user.email === "levakandproduction@gmail.com") {
              isAdmin = true;
            }
          } catch (e) {
            // Если таблица admins не существует или ошибка, проверяем только по email
            if (user.email === "levakandproduction@gmail.com") {
              isAdmin = true;
            }
          }

          // Если админ - редиректим на админку
          if (isAdmin) {
            navigate("/admin", { replace: true });
            return;
          }

          // Если уже авторизован, редиректим на /author
          const raw = localStorage.getItem("toqibox:returnTo") || "";
          localStorage.removeItem("toqibox:returnTo");
          
          let path = raw;
          if (raw.startsWith("http://") || raw.startsWith("https://")) {
            try {
              const url = new URL(raw);
              path = url.pathname;
              // Если это production URL, игнорируем его для локальной разработки
              if (url.hostname === "toqibox.win" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
                path = ""; // Сбрасываем путь, если это production URL на локальной машине
              }
            } catch (e) {
              path = "";
            }
          }

          // Проверяем, что путь не содержит домен (после извлечения pathname это не должно быть возможно, но на всякий случай)
          if (path.includes("toqibox.win")) {
            path = "";
          }

          // Блокируем только редактирование и создание, но разрешаем просмотр страниц автора и трека
          const bad =
            path.includes("edit=1") ||
            path.startsWith("/create");

          const next = bad ? "/author" : (path || "/author");
          navigate(next, { replace: true });
          return;
        }
      } catch (e) {
        console.error("Error checking auth:", e);
      } finally {
        if (alive) {
          setCheckingAuth(false);
        }
      }
    };

    checkAuth();

    return () => {
      alive = false;
    };
  }, [navigate]);

  const canSend = useMemo(() => {
    const v = String(email || "").trim();
    return v.includes("@") && v.includes(".");
  }, [email]);

  const returnBack = () => {
    const raw = localStorage.getItem("toqibox:returnTo") || "";
    localStorage.removeItem("toqibox:returnTo");

    // Извлекаем только путь из URL, если это полный URL
    let path = raw;
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      try {
        const url = new URL(raw);
        path = url.pathname;
        // Если это production URL, игнорируем его для локальной разработки
        if (url.hostname === "toqibox.win" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
          path = ""; // Сбрасываем путь, если это production URL на локальной машине
        }
      } catch (e) {
        path = "";
      }
    }

    // Проверяем, что путь не содержит домен (после извлечения pathname это не должно быть возможно, но на всякий случай)
    if (path.includes("toqibox.win")) {
      path = "";
    }

    // Блокируем только редактирование и создание, но разрешаем просмотр страниц автора и трека
    const bad =
      path.includes("edit=1") ||
      path.startsWith("/create");

    const next = bad ? "/author" : (path || "/author");

    navigate(next, { replace: true });
    return true;
  };

  const onGoogle = async () => {
    setErrorText("");
    setNote("");
    setLoading(true);

    try {
      // Проверяем, не находимся ли мы в iframe (Google блокирует OAuth в iframe)
      if (window.self !== window.top) {
        setErrorText("Вход через Google недоступен в этом режиме. Откройте страницу напрямую.");
        setLoading(false);
        return;
      }

      // Для локальной разработки принудительно используем localhost
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const redirectUrl = isLocal 
        ? `http://localhost:${window.location.port || 5174}/auth/callback`
        : `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            prompt: "select_account",
            access_type: "offline",
          },
        },
      });

      if (error) {
        console.error("OAuth error:", error);
        if (error.message?.includes("disallowed_useragent") || error.message?.includes("403")) {
          setErrorText("Google блокирует вход. Проверьте настройки OAuth в Google Console или используйте вход через почту.");
        } else {
          setErrorText("Ошибка входа. Попробуйте войти через почту.");
        }
        setLoading(false);
      }
      // При успешном OAuth редирект произойдет автоматически
    } catch (err) {
      console.error("OAuth exception:", err);
      setErrorText("Ошибка входа. Попробуйте войти через почту.");
      setLoading(false);
    }
  };

  const onEmail = async () => {
    if (!canSend) return;

    setErrorText("");
    setNote("");
    setLoading(true);

    try {
      // Для локальной разработки принудительно используем localhost
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const redirectUrl = isLocal 
        ? `http://localhost:${window.location.port || 5174}/auth/callback`
        : `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setErrorText("Ошибка письма");
      } else {
        setNote("Проверь почту - ссылка для входа");
      }
    } catch {
      setErrorText("Ошибка письма");
    } finally {
      setLoading(false);
    }
  };


  const onPremiumMonth = (e) => {
    e.stopPropagation();
    navigate("/pricing", { replace: false });
  };

  const onPremiumYear = (e) => {
    e.stopPropagation();
    navigate("/pricing", { replace: false });
  };

  const styles = {
    page: {
      minHeight: "100vh",
      padding: "8px 10px",
      display: "grid",
      alignContent: "center",
      justifyItems: "center",
      background: "#ffffff",
      backgroundColor: "#ffffff",
      position: "fixed",
      inset: 0,
      overflow: "hidden",
      gridTemplateRows: "auto 1fr auto",
      zIndex: 1,
      aspectRatio: "9 / 16",
      maxWidth: "100vw",
      maxHeight: "100vh",
    },

    topHeader: {
      position: "fixed",
      top: 6,
      right: 6,
      zIndex: 1000,
    },

    backBtn: {
      width: 22,
      height: 22,
      padding: 0,
      borderRadius: 999,
      border: "1px solid rgba(0,0,0,0.08)",
      background: "rgba(255,255,255,0.85)",
      cursor: "pointer",
      display: "grid",
      placeItems: "center",
      transition: "all 0.2s ease",
      backdropFilter: "blur(10px)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    },

    backIcon: {
      width: 10,
      height: 10,
      opacity: 0.7,
    },

    noise: {
      pointerEvents: "none",
      position: "absolute",
      inset: 0,
      opacity: 0.03,
      backgroundImage:
        "repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0px, rgba(0,0,0,0.02) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px), repeating-linear-gradient(90deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)",
      filter: "blur(0.2px)",
    },

    glow: {
      pointerEvents: "none",
      position: "absolute",
      width: 240,
      height: 240,
      borderRadius: 240,
      top: "18%",
      left: "50%",
      transform: "translateX(-50%)",
      background:
        "radial-gradient(circle, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.02) 35%, rgba(0,0,0,0) 70%)",
      opacity: 0.55,
    },

    card: {
      width: "100%",
      maxWidth: "92%",
      display: "grid",
      gap: 5,
      position: "relative",
      zIndex: 2,
      marginTop: 0,
    },

    hero: {
      display: "grid",
      justifyItems: "center",
      gap: 4,
      marginBottom: 0,
      marginTop: 15,
      animation: "toqiboxFadeIn 520ms ease-out both",
    },

    brand: {
      textAlign: "center",
      lineHeight: 1.1,
      marginTop: 6,
    },

    title: {
      fontSize: 11,
      letterSpacing: 2,
      fontWeight: 700,
      opacity: 0.92,
      color: "#000000",
      display: "flex",
      alignItems: "center",
      gap: 4,
      justifyContent: "center",
    },

    premiumWord: {
      color: "#C8A24A",
      fontWeight: 900,
      letterSpacing: 3,
      textShadow: "0 4px 12px rgba(200,162,74,0.18)",
    },

    subtitle: {
      marginTop: 4,
      fontSize: 10,
      opacity: 0.62,
    },

    buttons: {
      display: "grid",
      gap: 5,
      marginTop: 2,
    },

    primary: {
      width: "100%",
      padding: "6px 8px",
      borderRadius: 999,
      border: "1px solid rgba(0,0,0,0.16)",
      background: "#0b0b0b",
      color: "#ffffff",
      fontSize: 10,
      fontWeight: 700,
      cursor: "pointer",
      transition: "transform 120ms ease, opacity 120ms ease",
    },

    secondary: {
      width: "100%",
      padding: "6px 8px",
      borderRadius: 999,
      border: "1px solid rgba(0,0,0,0.14)",
      background: "rgba(255,255,255,0.7)",
      color: "rgba(0,0,0,0.86)",
      fontSize: 10,
      fontWeight: 700,
      cursor: "pointer",
      transition: "transform 120ms ease, opacity 120ms ease",
    },

    emailBlock: {
      display: "grid",
      gap: 4,
      marginTop: 2,
      padding: 6,
      borderRadius: 10,
      border: "1px solid rgba(0,0,0,0.08)",
      background: "rgba(255,255,255,0.55)",
      backdropFilter: "blur(10px)",
    },

    input: {
      width: "100%",
      padding: "6px 8px",
      borderRadius: 8,
      border: "1px solid rgba(0,0,0,0.12)",
      outline: "none",
      fontSize: 10,
      background: "rgba(255,255,255,0.85)",
      color: "rgba(0,0,0,0.88)",
    },

    hint: {
      fontSize: 9,
      opacity: 0.62,
      lineHeight: 1.35,
    },

    msg: {
      fontSize: 10,
      lineHeight: 1.35,
      opacity: 0.85,
      padding: "4px 2px 0",
    },

    error: {
      fontSize: 10,
      lineHeight: 1.35,
      padding: "4px 2px 0",
      color: "rgba(0,0,0,0.86)",
    },

    footer: {
      marginTop: 2,
      display: "grid",
      justifyItems: "center",
      gap: 2,
    },

    smallBtn: {
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(0,0,0,0.10)",
      background: "transparent",
      color: "rgba(0,0,0,0.70)",
      fontSize: 10,
      cursor: "pointer",
      opacity: 0.95,
    },

    icon: {
      width: 14,
      height: 14,
      display: "inline-block",
      verticalAlign: "middle",
      transform: "translateY(-1px)",
      opacity: 0.95,
      flex: "0 0 auto",
    },

    premiumBtnRow: {
      display: "grid",
      gap: 3,
      marginTop: 2,
      width: "100%",
    },

    premiumBtn: {
      width: "100%",
      padding: "4px 6px",
      borderRadius: 999,
      border: "1px solid rgba(200,162,74,0.34)",
      background:
        "linear-gradient(180deg, rgba(200,162,74,0.12) 0%, rgba(255,255,255,0.62) 100%)",
      color: "rgba(0,0,0,0.90)",
      fontSize: 8,
      fontWeight: 800,
      cursor: "pointer",
      textAlign: "center",
      lineHeight: 1.2,
    },

    premiumYearWrapper: {
      position: "relative",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      alignItems: "center",
    },

    savingsBadge: {
      fontSize: 6,
      fontWeight: 700,
      color: "#C8A24A",
      background: "rgba(200,162,74,0.15)",
      padding: "1px 4px",
      borderRadius: 6,
      letterSpacing: 0.2,
      whiteSpace: "nowrap",
      textAlign: "center",
    },

    footerLinks: {
      position: "fixed",
      bottom: 6,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: 5,
      fontSize: 8,
      opacity: 0.6,
      flexWrap: "nowrap",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },

    footerLink: {
      color: "rgba(0,0,0,0.70)",
      cursor: "pointer",
      textDecoration: "none",
      transition: "opacity 0.2s ease",
    },

    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      backdropFilter: "blur(4px)",
      display: "grid",
      placeItems: "center",
      zIndex: 1000,
      padding: 10,
      animation: "modalFadeIn 0.2s ease-out",
    },

    modalBox: {
      width: "100%",
      maxWidth: "95%",
      maxHeight: "85vh",
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(20px)",
      borderRadius: 14,
      boxShadow: "0 22px 60px rgba(0,0,0,0.15), 0 6px 18px rgba(0,0,0,0.08)",
      display: "grid",
      gridTemplateRows: "auto 1fr auto",
      overflow: "hidden",
      animation: "modalScaleIn 0.3s cubic-bezier(0.2, 0.9, 0.2, 1)",
    },

    modalHeader: {
      padding: "12px 14px",
      borderBottom: "1px solid rgba(0,0,0,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },

    modalTitle: {
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: 1.5,
      color: "rgba(0,0,0,0.90)",
    },

    modalClose: {
      width: 22,
      height: 22,
      borderRadius: 999,
      border: "none",
      background: "rgba(0,0,0,0.06)",
      cursor: "pointer",
      display: "grid",
      placeItems: "center",
      fontSize: 14,
      color: "rgba(0,0,0,0.70)",
      transition: "background 0.2s ease",
    },

    modalContent: {
      padding: "14px",
      overflowY: "auto",
      fontSize: 10,
      lineHeight: 1.5,
      color: "rgba(0,0,0,0.86)",
    },

    modalSection: {
      marginBottom: 14,
    },

    modalSectionTitle: {
      fontSize: 11,
      fontWeight: 700,
      marginBottom: 6,
      color: "rgba(0,0,0,0.90)",
    },

    modalText: {
      marginBottom: 8,
      opacity: 0.85,
    },

    modalList: {
      marginLeft: 14,
      marginBottom: 8,
    },

    modalListItem: {
      marginBottom: 4,
      opacity: 0.85,
    },

    supportLinks: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      marginTop: 12,
      flexWrap: "wrap",
    },

    supportLink: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      color: "rgba(0,0,0,0.86)",
      textDecoration: "none",
      fontSize: 10,
      transition: "opacity 0.2s ease",
    },

    supportIcon: {
      width: 14,
      height: 14,
      opacity: 0.8,
    },
  };

  const btnDisabledStyle = { opacity: 0.6, cursor: "default" };

  const handleBack = () => {
    navigate("/", { replace: true });
  };

  // Показываем загрузку, пока проверяем авторизацию
  if (checkingAuth) {
    return (
      <div style={styles.page}>
        <div style={{ opacity: 0.85 }}>Проверяю авторизацию...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.topHeader}>
        <button
          type="button"
          style={styles.backBtn}
          onClick={handleBack}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.9)";
            const icon = e.currentTarget.querySelector("svg");
            if (icon) icon.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.7)";
            const icon = e.currentTarget.querySelector("svg");
            if (icon) icon.style.opacity = "0.7";
          }}
        >
              <svg
                width="10"
                height="10"
                viewBox="0 0 14 14"
                fill="none"
                style={styles.backIcon}
              >
            <path
              d="M8.5 3.5L5 7L8.5 10.5"
              stroke="rgba(0,0,0,0.70)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div style={styles.glow} />
      <div style={styles.noise} />

      <style>{`
        @keyframes toqiboxFadeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes arrowBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .toqiboxFlipWrap {
          width: min(220px, 70vw);
          aspect-ratio: 1 / 1;
          perspective: 1100px;
        }

        .toqiboxFlipInner {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 680ms cubic-bezier(0.2, 0.9, 0.2, 1);
          border-radius: 26px;
          cursor: pointer;
          transform: scale(1);
        }

        .toqiboxFlipInner::before,
        .toqiboxFlipInner::after {
          content: "";
          position: absolute;
          inset: -40px;
          border-radius: 50%;
          pointer-events: none;
          z-index: -1;
          opacity: 0;
          filter: blur(30px);
          transform: scale(0);
        }

        .toqiboxFlipInner::before {
          background: radial-gradient(
            circle at 30% 30%,
            rgba(70, 255, 200, 0.4) 0%,
            rgba(100, 180, 255, 0.3) 30%,
            rgba(120, 120, 255, 0.2) 50%,
            transparent 70%
          );
        }

        .toqiboxFlipInner::after {
          background: radial-gradient(
            circle at 70% 70%,
            rgba(100, 180, 255, 0.35) 0%,
            rgba(120, 120, 255, 0.25) 30%,
            rgba(70, 255, 200, 0.15) 50%,
            transparent 70%
          );
        }

        .toqiboxFlipInner.isFlipped {
          transform: rotateY(180deg) scale(1.15);
          animation: glowFadeOut 0.68s cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
        }

        .toqiboxFlipInner.isFlipped::before {
          animation: particlesOut1 0.68s cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
        }

        .toqiboxFlipInner.isFlipped::after {
          animation: particlesOut2 0.68s cubic-bezier(0.2, 0.9, 0.2, 1) 0.15s forwards;
        }

        .toqiboxFlipInner:not(.isFlipped) {
          box-shadow: 0 22px 60px rgba(0,0,0,0.10), 0 6px 18px rgba(0,0,0,0.06);
          animation: glowFadeIn 0.68s cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
        }

        .toqiboxFlipInner:not(.isFlipped)::before {
          animation: particlesIn1 0.68s cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
        }

        .toqiboxFlipInner:not(.isFlipped)::after {
          animation: particlesIn2 0.68s cubic-bezier(0.2, 0.9, 0.2, 1) 0.15s forwards;
        }

        .toqiboxFlipInner.isFlipped::before,
        .toqiboxFlipInner.isFlipped::after {
          animation-fill-mode: forwards;
        }

        .toqiboxFlipInner:not(.isFlipped)::before,
        .toqiboxFlipInner:not(.isFlipped)::after {
          animation-fill-mode: forwards;
        }

        @keyframes particlesOut1 {
          0% {
            opacity: 0;
            transform: scale(0.3) translate(0, 0);
          }
          15% {
            opacity: 0.9;
            transform: scale(1.1) translate(-25px, -20px);
          }
          40% {
            opacity: 0.7;
            transform: scale(1.5) translate(20px, 25px);
          }
          70% {
            opacity: 0.4;
            transform: scale(1.9) translate(-15px, 15px);
          }
          100% {
            opacity: 0;
            transform: scale(2.5) translate(0, 0);
          }
        }

        @keyframes particlesOut2 {
          0% {
            opacity: 0;
            transform: scale(0.3) translate(0, 0);
          }
          15% {
            opacity: 0.8;
            transform: scale(1.2) translate(30px, -25px);
          }
          40% {
            opacity: 0.6;
            transform: scale(1.6) translate(-25px, 20px);
          }
          70% {
            opacity: 0.3;
            transform: scale(2) translate(18px, -18px);
          }
          100% {
            opacity: 0;
            transform: scale(2.6) translate(0, 0);
          }
        }

        @keyframes particlesIn1 {
          0% {
            opacity: 0;
            transform: scale(0.3) translate(0, 0);
          }
          15% {
            opacity: 0.9;
            transform: scale(1.1) translate(25px, 20px);
          }
          40% {
            opacity: 0.7;
            transform: scale(1.5) translate(-20px, -25px);
          }
          70% {
            opacity: 0.4;
            transform: scale(1.9) translate(15px, -15px);
          }
          100% {
            opacity: 0;
            transform: scale(2.5) translate(0, 0);
          }
        }

        @keyframes particlesIn2 {
          0% {
            opacity: 0;
            transform: scale(0.3) translate(0, 0);
          }
          15% {
            opacity: 0.8;
            transform: scale(1.2) translate(-30px, 25px);
          }
          40% {
            opacity: 0.6;
            transform: scale(1.6) translate(25px, -20px);
          }
          70% {
            opacity: 0.3;
            transform: scale(2) translate(-18px, 18px);
          }
          100% {
            opacity: 0;
            transform: scale(2.6) translate(0, 0);
          }
        }

        @keyframes glowFadeOut {
          0% {
            box-shadow: 0 0 40px rgba(70, 255, 200, 0.3), 0 0 80px rgba(100, 180, 255, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(70, 255, 200, 0.2), 0 0 60px rgba(100, 180, 255, 0.15);
          }
          100% {
            box-shadow: 0 22px 60px rgba(0,0,0,0.10), 0 6px 18px rgba(0,0,0,0.06);
          }
        }

        @keyframes glowFadeIn {
          0% {
            box-shadow: 0 0 40px rgba(70, 255, 200, 0.3), 0 0 80px rgba(100, 180, 255, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(70, 255, 200, 0.2), 0 0 60px rgba(100, 180, 255, 0.15);
          }
          100% {
            box-shadow: 0 22px 60px rgba(0,0,0,0.10), 0 6px 18px rgba(0,0,0,0.06);
          }
        }

        .toqiboxFace {
          position: absolute;
          inset: 0;
          border-radius: 26px;
          overflow: hidden;
          backface-visibility: hidden;
          background: rgba(255,255,255,0.55);
          box-shadow: 0 22px 60px rgba(0,0,0,0.10), 0 6px 18px rgba(0,0,0,0.06);
          backdrop-filter: blur(10px);
          display: grid;
          place-items: center;
        }

        .toqiboxFaceFront img {
          width: 88%;
          height: 88%;
          object-fit: contain;
          transform: translateY(2px);
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.10));
          pointer-events: none;
          user-select: none;
        }

        .toqiboxFaceBack {
          transform: rotateY(180deg);
          padding: 8px;
          align-content: start;
          justify-items: stretch;
          gap: 2px;
        }

        .toqiboxBackTitle {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0;
        }

        .toqiboxBackTitleText {
          font-size: 10px;
          letter-spacing: 1.5px;
          font-weight: 900;
          color: #C8A24A;
          text-shadow: 0 4px 12px rgba(200,162,74,0.18);
        }

        .toqiboxList {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 1px;
          font-size: 8px;
          line-height: 1.15;
          color: rgba(0,0,0,0.86);
        }

        .toqiboxItem {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 1px 0;
        }

        .toqiboxItemText {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .toqiboxGold {
          color: #C8A24A;
          font-weight: 900;
          letter-spacing: 0.5px;
        }

        .toqiboxTight {
          white-space: nowrap;
        }

        .loader-artist {
          width: fit-content;
          font-size: 10px;
          font-family: monospace;
          font-weight: bold;
          text-transform: uppercase;
          color: #0000;
          -webkit-text-stroke: 0.7px #000;
          --g: conic-gradient(#000 0 0) no-repeat text;
          background:
            var(--g) 0,
            var(--g) 1ch,
            var(--g) 2ch,
            var(--g) 3ch,
            var(--g) 4ch,
            var(--g) 5ch,
            var(--g) 6ch,
            var(--g) 7ch,
            var(--g) 8ch;
          animation:
            l20-0 1.5s linear infinite alternate,
            l20-1 3s linear infinite;
        }

        @keyframes l20-0 {
          0% {
            background-size:
              1ch 0,
              1ch 0,
              1ch 0,
              1ch 0,
              1ch 0,
              1ch 0,
              1ch 0,
              1ch 0,
              1ch 0;
          }
          25% {
            background-size:
              1ch 100%,
              1ch 50%,
              1ch 0,
              1ch 0,
              1ch 0,
              1ch 50%,
              1ch 100%,
              1ch 50%,
              1ch 0;
          }
          50% {
            background-size:
              1ch 100%,
              1ch 100%,
              1ch 50%,
              1ch 0,
              1ch 50%,
              1ch 100%,
              1ch 100%,
              1ch 50%,
              1ch 0;
          }
          75% {
            background-size:
              1ch 100%,
              1ch 100%,
              1ch 100%,
              1ch 50%,
              1ch 100%,
              1ch 100%,
              1ch 100%,
              1ch 100%,
              1ch 50%;
          }
          to {
            background-size:
              1ch 100%,
              1ch 100%,
              1ch 100%,
              1ch 100%,
              1ch 100%,
              1ch 100%,
              1ch 100%,
              1ch 100%,
              1ch 100%;
          }
        }

        @keyframes l20-1 {
          0%,
          50% {
            background-position-y: 100%;
          }
          50.01%,
          to {
            background-position-y: 0;
          }
        }

        .loader {
          scale: 0.65;
          position: relative;
          width: 200px;
          height: 200px;
          translate: 10px 0px;
          margin-top: -5px;
        }

        .loader svg {
          position: absolute;
          top: 0;
          left: 0;
        }

        .head {
          translate: 27px -30px;
          z-index: 3;
          animation: bob 1s infinite ease-in;
        }

        .bod {
          translate: 0px 30px;
          z-index: 3;
          animation: bob 1s infinite ease-in-out;
        }

        .legr {
          translate: 75px 135px;
          z-index: 0;
          animation: rstep 1s infinite ease-in;
          animation-delay: 0.45s;
        }

        .legl {
          translate: 30px 155px;
          z-index: 3;
          animation: lstep 1s infinite ease-in;
        }

        @keyframes bob {
          0% {
            transform: translateY(0) rotate(3deg);
          }
          5% {
            transform: translateY(0) rotate(3deg);
          }
          25% {
            transform: translateY(5px) rotate(0deg);
          }
          50% {
            transform: translateY(0px) rotate(-3deg);
          }
          70% {
            transform: translateY(5px) rotate(0deg);
          }
          100% {
            transform: translateY(0) rotate(3deg);
          }
        }

        @keyframes lstep {
          0% {
            transform: translateY(0) rotate(-5deg);
          }
          33% {
            transform: translateY(-15px) translate(32px) rotate(35deg);
          }
          66% {
            transform: translateY(0) translate(25px) rotate(-25deg);
          }
          100% {
            transform: translateY(0) rotate(-5deg);
          }
        }

        @keyframes rstep {
          0% {
            transform: translateY(0) translate(0px) rotate(-5deg);
          }
          33% {
            transform: translateY(-10px) translate(30px) rotate(35deg);
          }
          66% {
            transform: translateY(0) translate(20px) rotate(-25deg);
          }
          100% {
            transform: translateY(0) translate(0px) rotate(-5deg);
          }
        }

        #gnd {
          translate: -140px 0;
          rotate: 10deg;
          z-index: -1;
          filter: blur(0.5px) drop-shadow(1px 3px 5px #000000);
          opacity: 0.25;
          animation: scroll 5s infinite linear;
        }

        @keyframes scroll {
          0% {
            transform: translateY(25px) translate(50px);
            opacity: 0;
          }
          33% {
            opacity: 0.25;
          }
          66% {
            opacity: 0.25;
          }
          to {
            transform: translateY(-50px) translate(-100px);
            opacity: 0;
          }
        }
      `}</style>

      <div style={styles.card}>
        <div style={styles.hero}>
          <div className="toqiboxFlipWrap">
            <div
              className={`toqiboxFlipInner ${premiumOpen ? "isFlipped" : ""}`}
              onClick={() => setPremiumOpen((v) => !v)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setPremiumOpen((v) => !v);
              }}
              aria-label="PREMIUM"
            >
              <div className="toqiboxFace toqiboxFaceFront">
                <img src={toqivhod} alt="" />
              </div>

              <div className="toqiboxFace toqiboxFaceBack">
                <div className="toqiboxBackTitle">
                  <div className="toqiboxBackTitleText">Тариф ПРЕМИУМ</div>
                </div>

                <ul className="toqiboxList">
                  <li className="toqiboxItem">
                    <span className="toqiboxItemText">Без рекламы</span>
                  </li>

                  <li className="toqiboxItem">
                    <span className="toqiboxItemText">Золотая тюбетейка (Верификация)</span>
                    <img src={verifGold} alt="" style={styles.icon} />
                  </li>

                  <li className="toqiboxItem">
                    <span className="toqiboxItemText">
                      Статус: <span className="toqiboxTight">Проверенный артист</span>
                    </span>
                  </li>

                  <li className="toqiboxItem">
                    <span className="toqiboxItemText">
                      <span className="toqiboxGold">PREMIUM</span> Шаблоны в шапке
                    </span>
                  </li>

                  <li className="toqiboxItem">
                    <span className="toqiboxItemText">Выбор цвета имени артиста</span>
                  </li>

                  <li className="toqiboxItem">
                    <span className="toqiboxItemText">Темы кнопок Play, Play Тюбетейки, видеофоны страницы</span>
                  </li>

                  <li className="toqiboxItem">
                    <span className="toqiboxItemText">
                      Подпись: <span className="toqiboxTight">Проверенный артист</span>
                    </span>
                  </li>

                  <li className="toqiboxItem">
                    <span className="toqiboxItemText">Видео шаблоны фона страницы артиста</span>
                  </li>

                  <li className="toqiboxItem">
                    <img src={ico24} alt="" style={styles.icon} />
                    <span className="toqiboxItemText">Живая поддержка</span>
                  </li>
                </ul>

                <div style={styles.premiumBtnRow} onClick={(e) => e.stopPropagation()}>
                  <button type="button" style={styles.premiumBtn} onClick={onPremiumMonth}>
                    Подключить 140 TJS в мес
                  </button>

                  <div style={styles.premiumYearWrapper}>
                    <button type="button" style={styles.premiumBtn} onClick={onPremiumYear}>
                      Подключить 1200 TJS в год
                    </button>
                    <span style={styles.savingsBadge}>30% выгода</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{...styles.brand, marginTop: 35}}>
            <div style={styles.title}>
              <div className="loader-artist">АРТИСТАМ</div>
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                style={{ animation: "arrowBounce 1.5s ease-in-out infinite" }}
              >
                <path
                  d="M8 2L8 14M8 2L3 7M8 2L13 7"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        <div style={{...styles.buttons, marginTop: 35}}>
          <button
            type="button"
            onClick={onGoogle}
            disabled={loading}
            style={{
              ...styles.primary,
              ...(loading ? btnDisabledStyle : null),
            }}
          >
            {loading ? "Вход..." : "Войти через Google"}
          </button>

          <button
            type="button"
            onClick={() => {
              setErrorText("");
              setNote("");
              setShowEmail((v) => !v);
            }}
            disabled={loading}
            style={{
              ...styles.secondary,
              ...(loading ? btnDisabledStyle : null),
            }}
          >
            По почте
          </button>

          {showEmail ? (
            <div style={styles.emailBlock} onClick={(e) => e.stopPropagation()}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                inputMode="email"
                autoComplete="email"
                style={styles.input}
              />

              <button
                type="button"
                onClick={onEmail}
                disabled={loading || !canSend}
                style={{
                  ...styles.primary,
                  ...(loading || !canSend ? btnDisabledStyle : null),
                }}
              >
                Отправить ссылку
              </button>

              <div style={styles.hint}>Письмо со ссылкой для входа</div>
            </div>
          ) : null}

          <div style={{...styles.brand, marginTop: 0}}>
            <div className="loader">
              <svg
                className="legl"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="20.69332"
                height="68.19944"
                viewBox="0,0,20.69332,68.19944"
              >
                <g transform="translate(-201.44063,-235.75466)">
                  <g strokeMiterlimit="10">
                    <path d="" fill="#ffffff" stroke="none" strokeWidth="0.5"></path>
                    <path
                      d=""
                      fillOpacity="0.26667"
                      fill="#97affd"
                      strokeOpacity="0.48627"
                      stroke="#ffffff"
                      strokeWidth="0"
                    ></path>
                    <path
                      d="M218.11971,301.20087c-2.20708,1.73229 -4.41416,0 -4.41416,0l-1.43017,-1.1437c-1.42954,-1.40829 -3.04351,-2.54728 -4.56954,-3.87927c-0.95183,-0.8308 -2.29837,-1.49883 -2.7652,-2.55433c-0.42378,-0.95815 0.14432,-2.02654 0.29355,-3.03399c0.41251,-2.78499 1.82164,-5.43386 2.41472,-8.22683c1.25895,-4.44509 2.73863,-8.98683 3.15318,-13.54796c0.22615,-2.4883 -0.21672,-5.0155 -0.00278,-7.50605c0.30636,-3.56649 1.24602,-7.10406 1.59992,-10.6738c0.29105,-2.93579 -0.00785,-5.9806 -0.00785,-8.93046c0,0 0,-2.44982 3.12129,-2.44982c3.12129,0 3.12129,2.44982 3.12129,2.44982c0,3.06839 0.28868,6.22201 -0.00786,9.27779c-0.34637,3.56935 -1.30115,7.10906 -1.59992,10.6738c-0.2103,2.50918 0.22586,5.05326 -0.00278,7.56284c-0.43159,4.7371 -1.94029,9.46317 -3.24651,14.07835c-0.47439,2.23403 -1.29927,4.31705 -2.05805,6.47156c-0.18628,0.52896 -0.1402,1.0974 -0.327,1.62624c-0.09463,0.26791 -0.64731,0.47816 -0.50641,0.73323c0.19122,0.34617 0.86423,0.3445 1.2346,0.58502c1.88637,1.22503 3.50777,2.79494 5.03,4.28305l0.96971,0.73991c0,0 2.20708,1.73229 0,3.46457z"
                      fill="none"
                      stroke="#191e2e"
                      strokeWidth="7"
                    ></path>
                  </g>
                </g>
              </svg>

              <svg
                className="legr"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="41.02537"
                height="64.85502"
                viewBox="0,0,41.02537,64.85502"
              >
                <g transform="translate(-241.54137,-218.44347)">
                  <g strokeMiterlimit="10">
                    <path
                      d="M279.06674,279.42662c-2.27967,1.98991 -6.08116,0.58804 -6.08116,0.58804l-2.47264,-0.92915c-2.58799,-1.18826 -5.31176,-2.08831 -7.99917,-3.18902c-1.67622,-0.68654 -3.82471,-1.16116 -4.93147,-2.13229c-1.00468,-0.88156 -0.69132,-2.00318 -0.92827,-3.00935c-0.65501,-2.78142 0.12275,-5.56236 -0.287,-8.37565c-0.2181,-4.51941 -0.17458,-9.16283 -1.60696,-13.68334c-0.78143,-2.46614 -2.50162,-4.88125 -3.30086,-7.34796c-1.14452,-3.53236 -1.40387,-7.12078 -2.48433,-10.66266c-0.88858,-2.91287 -2.63779,-5.85389 -3.93351,-8.74177c0,0 -1.07608,-2.39835 3.22395,-2.81415c4.30003,-0.41581 2.41605,1.98254 2.41605,1.98254c1.34779,3.00392 3.13072,6.05282 4.06444,9.0839c1.09065,3.54049 1.33011,7.13302 2.48433,10.66266c0.81245,2.48448 2.5308,4.917 3.31813,7.40431c1.48619,4.69506 1.48366,9.52281 1.71137,14.21503c0.32776,2.25028 0.10631,4.39942 0.00736,6.60975c-0.02429,0.54266 0.28888,1.09302 0.26382,1.63563c-0.01269,0.27488 -0.68173,0.55435 -0.37558,0.78529c0.41549,0.31342 1.34191,0.22213 1.95781,0.40826c3.13684,0.94799 6.06014,2.26892 8.81088,3.52298l1.66093,0.59519c0,0 6.76155,1.40187 4.48187,3.39177z"
                      fill="none"
                      stroke="#000000"
                      strokeWidth="7"
                    ></path>
                    <path d="" fill="#ffffff" stroke="none" strokeWidth="0.5"></path>
                    <path
                      d=""
                      fillOpacity="0.26667"
                      fill="#97affd"
                      strokeOpacity="0.48627"
                      stroke="#ffffff"
                      strokeWidth="0"
                    ></path>
                  </g>
                </g>
              </svg>

              <div className="bod">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="144.10576"
                  height="144.91623"
                  viewBox="0,0,144.10576,144.91623"
                >
                  <g transform="translate(-164.41679,-112.94712)">
                    <g strokeMiterlimit="10">
                      <path
                        d="M166.9168,184.02633c0,-36.49454 35.0206,-66.07921 72.05288,-66.07921c37.03228,0 67.05288,29.58467 67.05288,66.07921c0,6.94489 -1.08716,13.63956 -3.10292,19.92772c-2.71464,8.46831 -7.1134,16.19939 -12.809,22.81158c-2.31017,2.68194 -7.54471,12.91599 -7.54471,12.91599c0,0 -5.46714,-1.18309 -8.44434,0.6266c-3.86867,2.35159 -10.95356,10.86714 -10.95356,10.86714c0,0 -6.96906,-3.20396 -9.87477,-2.58085c-2.64748,0.56773 -6.72538,5.77072 -6.72538,5.77072c0,0 -5.5023,-4.25969 -7.5982,-4.25969c-3.08622,0 -9.09924,3.48259 -9.09924,3.48259c0,0 -6.0782,-5.11244 -9.00348,-5.91884c-4.26461,-1.17561 -12.23343,0.75049 -12.23343,0.75049c0,0 -5.18164,-8.26065 -7.60688,-9.90388c-3.50443,-2.37445 -8.8271,-3.95414 -8.8271,-3.95414c0,0 -5.33472,-8.81718 -7.27019,-11.40895c-4.81099,-6.44239 -13.46422,-9.83437 -15.65729,-17.76175c-1.53558,-5.55073 -2.35527,-21.36472 -2.35527,-21.36472z"
                        fill="#191e2e"
                        stroke="#000000"
                        strokeWidth="5"
                        strokeLinecap="butt"
                      ></path>
                      <path
                        d="M167.94713,180c0,-37.03228 35.0206,-67.05288 72.05288,-67.05288c37.03228,0 67.05288,30.0206 67.05288,67.05288c0,7.04722 -1.08716,13.84053 -3.10292,20.22135c-2.71464,8.59309 -7.1134,16.43809 -12.809,23.14771c-2.31017,2.72146 -7.54471,13.1063 -7.54471,13.1063c0,0 -5.46714,-1.20052 -8.44434,0.63584c-3.86867,2.38624 -10.95356,11.02726 -10.95356,11.02726c0,0 -6.96906,-3.25117 -9.87477,-2.61888c-2.64748,0.5761 -6.72538,5.85575 -6.72538,5.85575c0,0 -5.5023,-4.32246 -7.5982,-4.32246c-3.08622,0 -9.09924,3.5339 -9.09924,3.5339c0,0 -6.0782,-5.18777 -9.00348,-6.00605c-4.26461,-1.19293 -12.23343,0.76155 -12.23343,0.76155c0,0 -5.18164,-8.38236 -7.60688,-10.04981c-3.50443,-2.40943 -8.8271,-4.0124 -8.8271,-4.0124c0,0 -5.33472,-8.9471 -7.27019,-11.57706c-4.81099,-6.53732 -13.46422,-9.97928 -15.65729,-18.02347c-1.53558,-5.63252 -2.35527,-21.67953 -2.35527,-21.67953z"
                        fill="#191e2e"
                        stroke="none"
                        strokeWidth="0"
                        strokeLinecap="butt"
                      ></path>
                      <path
                        d=""
                        fill="#ffffff"
                        stroke="none"
                        strokeWidth="0.5"
                        strokeLinecap="butt"
                      ></path>
                      <path
                        d=""
                        fillOpacity="0.26667"
                        fill="#97affd"
                        strokeOpacity="0.48627"
                        stroke="#ffffff"
                        strokeWidth="0"
                        strokeLinecap="butt"
                      ></path>
                      <path
                        d="M216.22445,188.06994c0,0 1.02834,11.73245 -3.62335,21.11235c-4.65169,9.3799 -13.06183,10.03776 -13.06183,10.03776c0,0 7.0703,-3.03121 10.89231,-10.7381c4.34839,-8.76831 5.79288,-20.41201 5.79288,-20.41201z"
                        fill="none"
                        stroke="#2f3a50"
                        strokeWidth="3"
                        strokeLinecap="round"
                      ></path>
                    </g>
                  </g>
                </svg>

                <svg
                  className="head"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  width="115.68559"
                  height="88.29441"
                  viewBox="0,0,115.68559,88.29441"
                >
                  <g transform="translate(-191.87889,-75.62023)">
                    <g strokeMiterlimit="10">
                      <path
                        d=""
                        fill="#ffffff"
                        stroke="none"
                        strokeWidth="0.5"
                        strokeLinecap="butt"
                      ></path>
                      <path
                        d="M195.12889,128.77752c0,-26.96048 21.33334,-48.81626 47.64934,-48.81626c26.316,0 47.64935,21.85578 47.64935,48.81626c0,0.60102 -9.22352,20.49284 -9.22352,20.49284l-7.75885,0.35623l-7.59417,6.15039l-8.64295,-1.74822l-11.70703,6.06119l-6.38599,-4.79382l-6.45999,2.36133l-7.01451,-7.38888l-8.11916,1.29382l-6.19237,-6.07265l-7.6263,-1.37795l-4.19835,-7.87062l-4.24236,-4.16907c0,0 -0.13314,-2.0999 -0.13314,-3.29458z"
                        fill="none"
                        stroke="#2f3a50"
                        strokeWidth="6"
                        strokeLinecap="butt"
                      ></path>
                      <path
                        d="M195.31785,124.43649c0,-26.96048 21.33334,-48.81626 47.64934,-48.81626c26.316,0 47.64935,21.85578 47.64935,48.81626c0,1.03481 -0.08666,2.8866 -0.08666,2.8866c0,0 16.8538,15.99287 16.21847,17.23929c-0.66726,1.30905 -23.05667,-4.14265 -23.05667,-4.14265l-2.29866,4.5096l-7.75885,0.35623l-7.59417,6.15039l-8.64295,-1.74822l-11.70703,6.06119l-6.38599,-4.79382l-6.45999,2.36133l-7.01451,-7.38888l-8.11916,1.29382l-6.19237,-6.07265l-7.6263,-1.37795l-4.19835,-7.87062l-4.24236,-4.16907c0,0 -0.13314,-2.0999 -0.13314,-3.29458z"
                        fill="#191e2e"
                        strokeOpacity="0.48627"
                        stroke="#ffffff"
                        strokeWidth="0"
                        strokeLinecap="butt"
                      ></path>
                      <path
                        d="M271.10348,122.46768l10.06374,-3.28166l24.06547,24.28424"
                        fill="none"
                        stroke="#2f3a50"
                        strokeWidth="6"
                        strokeLinecap="round"
                      ></path>
                      <path
                        d="M306.56448,144.85764l-41.62024,-8.16845l2.44004,-7.87698"
                        fill="none"
                        stroke="#000000"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      ></path>
                      <path
                        d="M276.02738,115.72434c-0.66448,-4.64715 2.56411,-8.95308 7.21127,-9.61756c4.64715,-0.66448 8.95309,2.56411 9.61757,7.21126c0.46467,3.24972 -1.94776,8.02206 -5.96624,9.09336c-2.11289,-1.73012 -5.08673,-5.03426 -5.08673,-5.03426c0,0 -4.12095,1.16329 -4.60481,1.54229c-0.16433,-0.04891 -0.62732,-0.38126 -0.72803,-0.61269c-0.30602,-0.70328 -0.36302,-2.02286 -0.44303,-2.58239z"
                        fill="#ffffff"
                        stroke="none"
                        strokeWidth="0.5"
                        strokeLinecap="butt"
                      ></path>
                      <path
                        d="M242.49281,125.6424c0,-4.69442 3.80558,-8.5 8.5,-8.5c4.69442,0 8.5,3.80558 8.5,8.5c0,4.69442 -3.80558,8.5 -8.5,8.5c-4.69442,0 -8.5,-3.80558 -8.5,-8.5z"
                        fill="#ffffff"
                        stroke="none"
                        strokeWidth="0.5"
                        strokeLinecap="butt"
                      ></path>
                      <path
                        d=""
                        fillOpacity="0.26667"
                        fill="#97affd"
                        strokeOpacity="0.48627"
                        stroke="#ffffff"
                        strokeWidth="0"
                        strokeLinecap="butt"
                      ></path>
                    </g>
                  </g>
                </svg>
              </div>

              <svg
                id="gnd"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                width="475"
                height="530"
                viewBox="0,0,163.40011,85.20095"
              >
                <g transform="translate(-176.25,-207.64957)">
                  <g
                    stroke="#000000"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeMiterlimit="10"
                  >
                    <path
                      d="M295.5,273.1829c0,0 -57.38915,6.69521 -76.94095,-9.01465c-13.65063,-10.50609 15.70098,-20.69467 -2.5451,-19.94465c-30.31027,2.05753 -38.51396,-26.84135 -38.51396,-26.84135c0,0 6.50084,13.30023 18.93224,19.17888c9.53286,4.50796 26.23632,-1.02541 32.09529,4.95137c3.62417,3.69704 2.8012,6.33005 0.66517,8.49452c-3.79415,3.84467 -11.7312,6.21103 -6.24682,10.43645c22.01082,16.95812 72.55412,12.73944 72.55412,12.73944z"
                      fill="#000000"
                    ></path>
                    <path
                      d="M338.92138,217.76285c0,0 -17.49626,12.55408 -45.36424,10.00353c-8.39872,-0.76867 -17.29557,-6.23066 -17.29557,-6.23066c0,0 3.06461,-2.23972 15.41857,0.72484c26.30467,6.31228 47.24124,-4.49771 47.24124,-4.49771z"
                      fill="#000000"
                    ></path>
                    <path
                      d="M209.14443,223.00182l1.34223,15.4356l-10.0667,-15.4356"
                      fill="none"
                    ></path>
                    <path
                      d="M198.20391,230.41806l12.95386,7.34824l6.71113,-12.08004"
                      fill="none"
                    ></path>
                    <path d="M211.19621,238.53825l8.5262,-6.09014" fill="none"></path>
                    <path
                      d="M317.57068,215.80173l5.27812,6.49615l0.40601,-13.39831"
                      fill="none"
                    ></path>
                    <path d="M323.66082,222.70389l6.09014,-9.33822" fill="none"></path>
                  </g>
                </g>
              </svg>
            </div>
          </div>

          {note ? <div style={styles.msg}>{note}</div> : null}
          {errorText ? <div style={styles.error}>{errorText}</div> : null}
        </div>

        <div style={styles.footer}>
          <div style={styles.footerLinks}>
            <span
              style={styles.footerLink}
              onClick={() => setModalOpen("terms")}
              onMouseEnter={(e) => (e.target.style.opacity = "1")}
              onMouseLeave={(e) => (e.target.style.opacity = "0.6")}
            >
              Условия
            </span>
            <span style={{ opacity: 0.3, fontSize: 9 }}>·</span>
            <span
              style={styles.footerLink}
              onClick={() => setModalOpen("privacy")}
              onMouseEnter={(e) => (e.target.style.opacity = "1")}
              onMouseLeave={(e) => (e.target.style.opacity = "0.6")}
            >
              Конфиденциальность
            </span>
            <span style={{ opacity: 0.3, fontSize: 9 }}>·</span>
            <span
              style={styles.footerLink}
              onClick={() => setModalOpen("support")}
              onMouseEnter={(e) => (e.target.style.opacity = "1")}
              onMouseLeave={(e) => (e.target.style.opacity = "0.6")}
            >
              Поддержка
            </span>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div style={styles.modalOverlay} onClick={() => setModalOpen(null)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                {modalOpen === "terms" && "УСЛОВИЯ ИСПОЛЬЗОВАНИЯ TOQIBOX"}
                {modalOpen === "privacy" && "КОНФИДЕНЦИАЛЬНОСТЬ"}
                {modalOpen === "support" && "ПОДДЕРЖКА"}
              </div>
              <button
                type="button"
                style={styles.modalClose}
                onClick={() => setModalOpen(null)}
                onMouseEnter={(e) => (e.target.style.background = "rgba(0,0,0,0.10)")}
                onMouseLeave={(e) => (e.target.style.background = "rgba(0,0,0,0.06)")}
              >
                ×
              </button>
            </div>

            <div style={styles.modalContent}>
              {modalOpen === "terms" && (
                <>
                  <div style={styles.modalText}>
                    <strong>Дата обновления: 31.12.2025</strong>
                  </div>

                  <div style={styles.modalSection}>
                    <div style={styles.modalSectionTitle}>1. Общие положения</div>
                    <div style={styles.modalText}>
                      TOQIBOX - это сервис официальных страниц треков и артистов.
                    </div>
                    <div style={styles.modalText}>
                      TOQIBOX не является социальной сетью, стримингом или хостингом медиа.
                    </div>
                    <div style={styles.modalText}>
                      Используя сервис, вы соглашаетесь с настоящими Условиями.
                    </div>
                  </div>
                </>
              )}

              {modalOpen === "privacy" && (
                <>
                  <div style={styles.modalSection}>
                    <div style={styles.modalSectionTitle}>Хранение и воспроизведение контента</div>
                    <div style={styles.modalText}>TOQIBOX не хранит аудио или видео файлы.</div>
                    <div style={styles.modalText}>
                      Воспроизведение осуществляется через внешние платформы:
                    </div>
                    <ul style={styles.modalList}>
                      <li style={styles.modalListItem}>YouTube</li>
                      <li style={styles.modalListItem}>TikTok</li>
                      <li style={styles.modalListItem}>Instagram</li>
                    </ul>
                    <div style={styles.modalText}>
                      Все просмотры и прослушивания учитываются на стороне этих платформ.
                    </div>
                  </div>

                  <div style={styles.modalSection}>
                    <div style={styles.modalSectionTitle}>Ответственность за контент</div>
                    <div style={styles.modalText}>Пользователь (артист или представитель) подтверждает, что:</div>
                    <ul style={styles.modalList}>
                      <li style={styles.modalListItem}>
                        имеет права на публикацию трека, обложек и визуальных материалов
                      </li>
                      <li style={styles.modalListItem}>
                        не нарушает авторские и смежные права третьих лиц
                      </li>
                    </ul>
                    <div style={styles.modalText}>
                      TOQIBOX не несёт ответственности за контент, размещённый пользователями.
                    </div>
                  </div>

                  <div style={styles.modalSection}>
                    <div style={styles.modalSectionTitle}>4. Публичные страницы</div>
                    <div style={styles.modalText}>
                      Страницы /t/:slug и /a/:slug являются публичными и доступны без регистрации.
                    </div>
                    <div style={styles.modalText}>
                      Любой пользователь сети Интернет может просматривать эти страницы.
                    </div>
                    <div style={styles.modalText}>TOQIBOX не контролирует дальнейшее распространение ссылок.</div>
                  </div>

                  <div style={styles.modalSection}>
                    <div style={styles.modalSectionTitle}>5. Реакции и взаимодействие</div>
                    <div style={styles.modalText}>
                      Реакции (тюбетейка) не являются голосованием, рейтингом или оценкой.
                    </div>
                    <div style={styles.modalText}>Одна реакция доступна один раз для одного устройства.</div>
                    <div style={styles.modalText}>
                      TOQIBOX не гарантирует сохранность реакций при очистке браузера.
                    </div>
                  </div>

                  <div style={styles.modalSection}>
                    <div style={styles.modalSectionTitle}>6. PREMIUM</div>
                    <div style={styles.modalText}>
                      PREMIUM предоставляет дополнительные визуальные и статусные возможности.
                    </div>
                    <div style={styles.modalText}>
                      PREMIUM не влияет на порядок отображения треков и не даёт алгоритмических преимуществ.
                    </div>
                    <div style={styles.modalText}>
                      Оплата PREMIUM не передаёт TOQIBOX права на контент пользователя.
                    </div>
                    <div style={styles.modalText}>
                      Условия и стоимость PREMIUM могут быть изменены с уведомлением.
                    </div>
                  </div>
                </>
              )}

              {modalOpen === "support" && (
                <>
                  <div style={styles.modalText}>
                    Все вопросы, жалобы и запросы направляются через раздел Поддержка.
                  </div>
                  <div style={styles.modalText}>Или пишите нам:</div>
                  <div style={styles.supportLinks}>
                    <a
                      href="https://t.me/levakand_pro"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.supportLink}
                      onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                      onMouseLeave={(e) => (e.target.style.opacity = "1")}
                    >
                      <img src={telegramIcon} alt="Telegram" style={styles.supportIcon} />
                      <span>Telegram</span>
                    </a>
                    <a
                      href="mailto:levakandproduction@gmail.com"
                      style={styles.supportLink}
                      onMouseEnter={(e) => (e.target.style.opacity = "0.7")}
                      onMouseLeave={(e) => (e.target.style.opacity = "1")}
                    >
                      <img src={gmailIcon} alt="Email" style={styles.supportIcon} />
                      <span>levakandproduction@gmail.com</span>
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
