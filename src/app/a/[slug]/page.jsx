// FILE: src/app/a/[slug]/page.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import ArtistHeader from "../../../features/artist/ArtistHeader.jsx";
import ArtistTracks from "../../../features/artist/ArtistTracks.jsx";
import AddTrackSection from "../../../features/artist/AddTrackSection.jsx";

import ShareSheet from "../../../features/share/ShareSheet.jsx";
import { supabase } from "../../../features/auth/supabaseClient.js";

export default function ArtistPage() {
  const { slug = "artist" } = useParams();

  const [shareOpen, setShareOpen] = useState(false);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [devEditEnabled, setDevEditEnabled] = useState(false);

  const refreshArtist = async () => {
    try {
      const { data: artistData, error: artistError } = await supabase
        .from("artists")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (artistError) throw artistError;
      if (artistData) {
        setArtist(artistData);
      }
    } catch (e) {
      console.error("Error refreshing artist:", e);
    }
  };

  const shareUrl = useMemo(() => {
    return `${window.location.origin}/a/${slug}`;
  }, [slug]);

  // Убрали subscriptionRef - больше не слушаем auth state changes

  // Проверяем, локальный ли это адрес (для dev режима)
  const isLocalDev = useMemo(() => {
    if (!import.meta.env.DEV) return false;
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1" || host.startsWith("192.168.") || host.startsWith("10.") || host.startsWith("172.");
  }, []);

  // Загружаем состояние dev режима из localStorage и обновляем isOwner
  useEffect(() => {
    if (isLocalDev) {
      const enabled = localStorage.getItem("toqibox:dev:enableEdit") === "true";
      setDevEditEnabled(enabled);
      setIsOwner(enabled); // Просто включаем/выключаем редактирование
    } else {
      setIsOwner(false); // На продакшене редактирование выключено
    }
  }, [isLocalDev, artist]);

  // Функция для переключения dev режима редактирования
  const toggleDevEdit = () => {
    const newState = !devEditEnabled;
    setDevEditEnabled(newState);
    localStorage.setItem("toqibox:dev:enableEdit", newState ? "true" : "false");
    setIsOwner(newState); // Сразу обновляем isOwner
  };

  useEffect(() => {
    let alive = true;
    let timeoutId = null;

    const run = async () => {
      console.log("🚀 Starting load for slug:", slug);
      console.log("🌐 Location:", window.location.href);
      console.log("📱 User Agent:", navigator.userAgent);
      setLoading(true);

      // Таймаут на случай, если запрос зависнет
      timeoutId = setTimeout(() => {
        if (alive) {
          console.warn("⚠️ Loading timeout after 5s, showing page anyway");
          setLoading(false);
          setArtist(null);
        }
      }, 5000);

      try {
        console.log("📡 Fetching artist from Supabase...");
        console.log("🔍 Supabase URL:", import.meta.env.VITE_SUPABASE_URL ? "✅ Set" : "❌ Missing");
        
        // Загружаем артиста из БД
        const { data: artistData, error: artistError } = await supabase
          .from("artists")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        
        console.log("📦 Supabase response:", { 
          hasData: !!artistData, 
          error: artistError?.message || null,
          slug 
        });

        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        if (!alive) {
          console.log("❌ Component unmounted, aborting");
          return;
        }

        if (artistError) {
          console.error("❌ Artist query error:", artistError);
          setArtist(null);
          setLoading(false);
          return;
        }

        console.log("✅ Artist loaded:", artistData ? "found" : "not found");

        // Сразу показываем контент
        setArtist(artistData || null);
        setLoading(false);

        // Проверяем только dev режим из localStorage (никаких проверок auth)
        if (artistData && isLocalDev) {
          const devMode = localStorage.getItem("toqibox:dev:enableEdit") === "true";
          setIsOwner(devMode);
        } else {
          setIsOwner(false);
        }
      } catch (e) {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (!alive) return;
        console.error("❌ Error loading artist:", e);
        setArtist(null);
        setLoading(false);
      }
    };

    run();

    return () => {
      alive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    // Убрали проверку авторизации - больше не слушаем изменения сессии

    return () => {
      alive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      // Убрали подписку на auth state change
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="a-page">
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "20px" }}>
          <div style={{ opacity: 0.7, textAlign: "center" }}>
            <div>Загрузка...</div>
            <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.5 }}>
              slug: {slug}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="a-page">
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "20px" }}>
          <div style={{ opacity: 0.7, textAlign: "center" }}>
            <div>Артист не найден</div>
            <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.5 }}>
              slug: {slug}
            </div>
            <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.5 }}>
              Проверьте подключение к интернету
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log("🎨 Rendering ArtistPage:", { slug, hasArtist: !!artist, isOwner, artistId: artist?.id });

  return (
    <div className="a-page">
      <ArtistHeader artist={artist} isOwner={isOwner} onUpdate={refreshArtist} />

      <AddTrackSection 
        artist={artist} 
        isOwner={isOwner}
        onTrackAdded={refreshArtist}
      />

      <div className="a-content">
        <ArtistTracks 
          artist={artist} 
          isOwner={isOwner}
          onShare={() => setShareOpen(true)}
          onUpdate={refreshArtist}
        />
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title="TOQIBOX"
      />

      {/* Кнопка для включения dev режима редактирования (только локально) */}
      {isLocalDev && (
        <button
          type="button"
          onClick={toggleDevEdit}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 12,
            border: "2px solid",
            borderColor: devEditEnabled ? "#10b981" : "rgba(255,255,255,0.3)",
            background: devEditEnabled ? "rgba(16, 185, 129, 0.2)" : "rgba(0,0,0,0.7)",
            color: devEditEnabled ? "#10b981" : "rgba(255,255,255,0.7)",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            boxShadow: devEditEnabled ? "0 0 20px rgba(16, 185, 129, 0.5)" : "0 4px 12px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
            WebkitTapHighlightColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.05)";
            e.target.style.boxShadow = devEditEnabled 
              ? "0 0 25px rgba(16, 185, 129, 0.7)" 
              : "0 6px 16px rgba(0,0,0,0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = devEditEnabled 
              ? "0 0 20px rgba(16, 185, 129, 0.5)" 
              : "0 4px 12px rgba(0,0,0,0.3)";
          }}
        >
          {devEditEnabled ? "✏️ Редактирование ВКЛ" : "🔒 Редактирование ВЫКЛ"}
        </button>
      )}
    </div>
  );
}
