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
          // Если уже авторизован, редиректим на /author
          const raw = localStorage.getItem("toqibox:returnTo") || "";
          localStorage.removeItem("toqibox:returnTo");
          
          let path = raw;
          if (raw.startsWith("http://") || raw.startsWith("https://")) {
            try {
              const url = new URL(raw);
              path = url.pathname;
            } catch (e) {
              path = "";
            }
          }

          const bad =
            path.startsWith("/a/") ||
            path.startsWith("/t/") ||
            path.includes("edit=1") ||
            path.startsWith("/create") ||
            path.includes("toqibox.win");

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
      } catch (e) {
        path = "";
      }
    }

    const bad =
      path.startsWith("/a/") ||
      path.startsWith("/t/") ||
      path.includes("edit=1") ||
      path.startsWith("/create") ||
      path.includes("toqibox.win");

    const next = bad ? "/author" : (path || "/author");

    navigate(next, { replace: true });
    return true;
  };

  const onGoogle = async () => {
    setErrorText("");
    setNote("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: "select_account", // Показывать выбор аккаунта
            access_type: "offline",
          },
        },
      });

      if (error) setErrorText("Ошибка входа");
    } catch {
      setErrorText("Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const onEmail = async () => {
    if (!canSend) return;

    setErrorText("");
    setNote("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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

  const onAlreadyLogged = async () => {
    setErrorText("");
    setNote("");
    setLoading(true);

    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        returnBack();
      } else {
        setErrorText("Сначала войди");
      }
    } catch {
      setErrorText("Сначала войди");
    } finally {
      setLoading(false);
    }
  };

  const onPremiumMonth = (e) => {
    e.stopPropagation();
    setErrorText("");
    setNote("PREMIUM - 100 TJS в мес");
  };

  const onPremiumYear = (e) => {
    e.stopPropagation();
    setErrorText("");
    setNote("PREMIUM - 1000 TJS в год");
  };

  const styles = {
    page: {
      minHeight: "100vh",
      padding: 18,
      display: "grid",
      alignContent: "center",
      justifyItems: "center",
      background: "#ffffff",
      backgroundColor: "#ffffff",
      position: "fixed",
      inset: 0,
      overflow: "auto",
      gridTemplateRows: "auto 1fr auto",
      zIndex: 1,
    },

    topHeader: {
      position: "fixed",
      top: 12,
      right: 12,
      zIndex: 1000,
    },

    backBtn: {
      width: 28,
      height: 28,
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
      width: 12,
      height: 12,
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
      width: 520,
      height: 520,
      borderRadius: 520,
      top: "18%",
      left: "50%",
      transform: "translateX(-50%)",
      background:
        "radial-gradient(circle, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.02) 35%, rgba(0,0,0,0) 70%)",
      opacity: 0.55,
    },

    card: {
      width: "100%",
      maxWidth: 420,
      display: "grid",
      gap: 14,
      position: "relative",
      zIndex: 2,
    },

    hero: {
      display: "grid",
      justifyItems: "center",
      gap: 10,
      marginBottom: 4,
      animation: "toqiboxFadeIn 520ms ease-out both",
    },

    brand: {
      textAlign: "center",
      lineHeight: 1.1,
    },

    title: {
      fontSize: 18,
      letterSpacing: 6,
      fontWeight: 700,
      opacity: 0.92,
      color: "#000000",
      display: "flex",
      alignItems: "center",
      gap: 8,
      justifyContent: "center",
    },

    premiumWord: {
      color: "#C8A24A",
      fontWeight: 900,
      letterSpacing: 5,
      textShadow: "0 6px 18px rgba(200,162,74,0.18)",
    },

    subtitle: {
      marginTop: 6,
      fontSize: 13,
      opacity: 0.62,
    },

    buttons: {
      display: "grid",
      gap: 10,
      marginTop: 6,
    },

    primary: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: 999,
      border: "1px solid rgba(0,0,0,0.16)",
      background: "#0b0b0b",
      color: "#ffffff",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      transition: "transform 120ms ease, opacity 120ms ease",
    },

    secondary: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: 999,
      border: "1px solid rgba(0,0,0,0.14)",
      background: "rgba(255,255,255,0.7)",
      color: "rgba(0,0,0,0.86)",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      transition: "transform 120ms ease, opacity 120ms ease",
    },

    emailBlock: {
      display: "grid",
      gap: 10,
      marginTop: 2,
      padding: 12,
      borderRadius: 18,
      border: "1px solid rgba(0,0,0,0.08)",
      background: "rgba(255,255,255,0.55)",
      backdropFilter: "blur(10px)",
    },

    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: 14,
      border: "1px solid rgba(0,0,0,0.12)",
      outline: "none",
      fontSize: 14,
      background: "rgba(255,255,255,0.85)",
      color: "rgba(0,0,0,0.88)",
    },

    hint: {
      fontSize: 12,
      opacity: 0.62,
      lineHeight: 1.35,
    },

    msg: {
      fontSize: 13,
      lineHeight: 1.35,
      opacity: 0.85,
      padding: "8px 2px 0",
    },

    error: {
      fontSize: 13,
      lineHeight: 1.35,
      padding: "8px 2px 0",
      color: "rgba(0,0,0,0.86)",
    },

    footer: {
      marginTop: 10,
      display: "grid",
      justifyItems: "center",
      gap: 6,
    },

    smallBtn: {
      padding: "10px 14px",
      borderRadius: 999,
      border: "1px solid rgba(0,0,0,0.10)",
      background: "transparent",
      color: "rgba(0,0,0,0.70)",
      fontSize: 13,
      cursor: "pointer",
      opacity: 0.95,
    },

    icon: {
      width: 16,
      height: 16,
      display: "inline-block",
      verticalAlign: "middle",
      transform: "translateY(-1px)",
      opacity: 0.95,
      flex: "0 0 auto",
    },

    premiumBtnRow: {
      display: "grid",
      gap: 4,
      marginTop: 4,
    },

    premiumBtn: {
      width: "100%",
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(200,162,74,0.34)",
      background:
        "linear-gradient(180deg, rgba(200,162,74,0.12) 0%, rgba(255,255,255,0.62) 100%)",
      color: "rgba(0,0,0,0.90)",
      fontSize: 11,
      fontWeight: 800,
      cursor: "pointer",
    },

    footerLinks: {
      position: "fixed",
      bottom: 18,
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      gap: 8,
      fontSize: 11,
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
      padding: 18,
      animation: "modalFadeIn 0.2s ease-out",
    },

    modalBox: {
      width: "100%",
      maxWidth: 520,
      maxHeight: "85vh",
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(20px)",
      borderRadius: 20,
      boxShadow: "0 22px 60px rgba(0,0,0,0.15), 0 6px 18px rgba(0,0,0,0.08)",
      display: "grid",
      gridTemplateRows: "auto 1fr auto",
      overflow: "hidden",
      animation: "modalScaleIn 0.3s cubic-bezier(0.2, 0.9, 0.2, 1)",
    },

    modalHeader: {
      padding: "18px 20px",
      borderBottom: "1px solid rgba(0,0,0,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },

    modalTitle: {
      fontSize: 16,
      fontWeight: 800,
      letterSpacing: 2,
      color: "rgba(0,0,0,0.90)",
    },

    modalClose: {
      width: 28,
      height: 28,
      borderRadius: 999,
      border: "none",
      background: "rgba(0,0,0,0.06)",
      cursor: "pointer",
      display: "grid",
      placeItems: "center",
      fontSize: 18,
      color: "rgba(0,0,0,0.70)",
      transition: "background 0.2s ease",
    },

    modalContent: {
      padding: "20px",
      overflowY: "auto",
      fontSize: 13,
      lineHeight: 1.6,
      color: "rgba(0,0,0,0.86)",
    },

    modalSection: {
      marginBottom: 20,
    },

    modalSectionTitle: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 8,
      color: "rgba(0,0,0,0.90)",
    },

    modalText: {
      marginBottom: 12,
      opacity: 0.85,
    },

    modalList: {
      marginLeft: 18,
      marginBottom: 12,
    },

    modalListItem: {
      marginBottom: 6,
      opacity: 0.85,
    },

    supportLinks: {
      display: "flex",
      gap: 12,
      alignItems: "center",
      marginTop: 16,
      flexWrap: "wrap",
    },

    supportLink: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      color: "rgba(0,0,0,0.86)",
      textDecoration: "none",
      fontSize: 13,
      transition: "opacity 0.2s ease",
    },

    supportIcon: {
      width: 18,
      height: 18,
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
            width="12"
            height="12"
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
          width: min(320px, 78vw);
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
        }

        .toqiboxFlipInner {
          transition: transform 680ms cubic-bezier(0.2, 0.9, 0.2, 1);
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
          transform: rotateY(180deg);
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
          padding: 10px;
          align-content: start;
          justify-items: stretch;
          gap: 4px;
        }

        .toqiboxBackTitle {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0;
        }

        .toqiboxBackTitleText {
          font-size: 12px;
          letter-spacing: 2px;
          font-weight: 900;
          color: #C8A24A;
          text-shadow: 0 6px 18px rgba(200,162,74,0.18);
        }

        .toqiboxList {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          gap: 3px;
          font-size: 11px;
          line-height: 1.2;
          color: rgba(0,0,0,0.86);
        }

        .toqiboxItem {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 0;
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
                    <span className="toqiboxItemText">Золотая тюбетейка</span>
                    <img src={verifGold} alt="" style={styles.icon} />
                  </li>

                  <li className="toqiboxItem">
                    <span className="toqiboxItemText">
                      Статус <span className="toqiboxTight">Проверенный артист</span>{" "}
                      <span className="toqiboxGold">PREMIUM</span>
                    </span>
                  </li>

                  <li className="toqiboxItem">
                    <span className="toqiboxItemText">Шапка: фото и видео</span>
                  </li>

                  <li className="toqiboxItem">
                    <span className="toqiboxItemText">Темы и Play-тюбетейки</span>
                  </li>

                  <li className="toqiboxItem">
                    <span className="toqiboxItemText">
                      Подпись: <span className="toqiboxTight">Проверенный артист</span>{" "}
                      <span className="toqiboxGold">PREMIUM</span>
                    </span>
                  </li>

                  <li className="toqiboxItem">
                    <span className="toqiboxItemText">Цвет ника</span>
                  </li>

                  <li className="toqiboxItem">
                    <img src={ico24} alt="" style={styles.icon} />
                    <span className="toqiboxItemText">Живая поддержка</span>
                  </li>
                </ul>

                <div style={styles.premiumBtnRow} onClick={(e) => e.stopPropagation()}>
                  <button type="button" style={styles.premiumBtn} onClick={onPremiumMonth}>
                    Подключить 100 TJS в мес
                  </button>

                  <button type="button" style={styles.premiumBtn} onClick={onPremiumYear}>
                    Подключить 1000 TJS в год
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.brand}>
            <div style={styles.title}>
              ВЫ АРТИСТ?
              <svg
                width="16"
                height="16"
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

        <div style={styles.buttons}>
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

          {note ? <div style={styles.msg}>{note}</div> : null}
          {errorText ? <div style={styles.error}>{errorText}</div> : null}
        </div>

        <div style={styles.footer}>
          <button
            type="button"
            onClick={onAlreadyLogged}
            disabled={loading}
            style={{
              ...styles.smallBtn,
              ...(loading ? btnDisabledStyle : null),
            }}
          >
            Я уже вошёл
          </button>

          <div style={styles.footerLinks}>
            <span
              style={styles.footerLink}
              onClick={() => setModalOpen("terms")}
              onMouseEnter={(e) => (e.target.style.opacity = "1")}
              onMouseLeave={(e) => (e.target.style.opacity = "0.6")}
            >
              Условия
            </span>
            <span style={{ opacity: 0.3, fontSize: 11 }}>·</span>
            <span
              style={styles.footerLink}
              onClick={() => setModalOpen("privacy")}
              onMouseEnter={(e) => (e.target.style.opacity = "1")}
              onMouseLeave={(e) => (e.target.style.opacity = "0.6")}
            >
              Конфиденциальность
            </span>
            <span style={{ opacity: 0.3, fontSize: 11 }}>·</span>
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
