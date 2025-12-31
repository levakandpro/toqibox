// FILE: src/app/a/[slug]/page.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import ArtistHeader from "../../../features/artist/ArtistHeader.jsx";
import ArtistTracks from "../../../features/artist/ArtistTracks.jsx";
import AddTrackSection from "../../../features/artist/AddTrackSection.jsx";

import ShareSheet from "../../../features/share/ShareSheet.jsx";
import CopyNotification from "../../../ui/CopyNotification.jsx";
import PremiumLoader from "../../../ui/PremiumLoader.jsx";
import { supabase } from "../../../features/auth/supabaseClient.js";
import { setArtistOgTags, clearOgTags } from "../../../utils/ogTags.js";

export default function ArtistPage() {
  const { slug = "artist" } = useParams();
  const navigate = useNavigate();

  const [shareOpen, setShareOpen] = useState(false);
  const [artist, setArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [devEditEnabled, setDevEditEnabled] = useState(false);
  const [showCopyNotification, setShowCopyNotification] = useState(false);

  const refreshArtist = async () => {
    try {
      console.log("🔄 refreshArtist called");
      const { data: artistData, error: artistError } = await supabase
        .from("artists")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (artistError) throw artistError;
      if (artistData) {
        setArtist(artistData);
        
        // Загружаем треки артиста
        console.log("📡 Loading tracks for artist_id:", artistData.id);
        const { data: tracksData, error: tracksError } = await supabase
          .from("tracks")
          .select("*")
          .eq("artist_id", artistData.id)
          .order("created_at", { ascending: false });

        if (tracksError) {
          console.error("❌ Error loading tracks:", tracksError);
          setTracks([]);
        } else {
          console.log("✅ Loaded tracks:", tracksData?.length || 0);
          // Функция для извлечения YouTube ID из ссылки
          const extractYoutubeId = (url) => {
            if (!url) return null;
            const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const match = url.match(regex);
            return match ? match[1] : null;
          };

          // Преобразуем треки из БД в формат для TrackCard
          const formattedTracks = (tracksData || []).map(track => {
            const youtubeId = extractYoutubeId(track.link);
            return {
              id: track.id,
              slug: track.slug,
              title: track.title,
              link: track.link,
              cover_key: track.cover_key, // Ключ обложки в R2
              play_icon: track.play_icon || null, // Иконка плеера
              source: track.source || "youtube",
              variant: "video", // По умолчанию video, так как поле variant не существует в БД
              coverUrl: null, // null для fallback в TrackCard
              artistSlug: artistData.slug,
              artistName: artistData.display_name || artistData.name,
              youtubeId: youtubeId,
              startSeconds: 0,
              createdAt: track.created_at,
            };
          });
          console.log("🎨 Formatted tracks:", formattedTracks.length);
          setTracks(formattedTracks);
        }
      }
    } catch (e) {
      console.error("❌ Error refreshing artist:", e);
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

  // Проверяем, является ли текущий пользователь владельцем артиста
  useEffect(() => {
    const checkOwnership = async () => {
      if (!artist?.id) {
        setIsOwner(false);
        return;
      }

      try {
        // Проверяем сессию пользователя
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;
        
        if (!session) {
          setIsOwner(false);
          return;
        }

        const userId = session.user.id;
        
        console.log("🔍 Проверка владельца:", {
          artistUserId: artist.user_id,
          currentUserId: userId,
          match: artist.user_id === userId
        });
        
        // Сравниваем user_id артиста с текущим пользователем
        if (artist.user_id === userId) {
          setIsOwner(true);
          console.log("✅ Пользователь является владельцем артиста");
        } else {
          setIsOwner(false);
          console.log("❌ Пользователь не является владельцем артиста", {
            artistUserId: artist.user_id,
            currentUserId: userId
          });
        }
      } catch (e) {
        console.error("Ошибка при проверке владельца:", e);
        setIsOwner(false);
      }
    };

    checkOwnership();
  }, [artist?.id, artist?.user_id]);

  // Заполняем поля редактирования данными артиста
  useEffect(() => {
    if (artist && isOwner) {
      setDisplayName(artist.display_name || "");
      setSocInstagram(artist.soc_instagram || "");
      setSocTiktok(artist.soc_tiktok || "");
      setSocYoutube(artist.soc_youtube || "");
      setHeaderYoutubeUrl(artist.header_youtube_url || "");
      setHeaderStartSec(String(artist.header_start_sec || 0));
    }
  }, [artist, isOwner]);

  // Функция сохранения данных артиста

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
          slug,
          artistUserId: artistData?.user_id,
          artistId: artistData?.id
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
        
        // Загружаем треки артиста
        if (artistData) {
          const { data: tracksData, error: tracksError } = await supabase
            .from("tracks")
            .select("*")
            .eq("artist_id", artistData.id)
            .order("created_at", { ascending: false });

          if (tracksError) {
            console.error("Error loading tracks:", tracksError);
            setTracks([]);
          } else {
            // Функция для извлечения YouTube ID из ссылки
            const extractYoutubeId = (url) => {
              if (!url) return null;
              const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
              const match = url.match(regex);
              return match ? match[1] : null;
            };

            // Преобразуем треки из БД в формат для TrackCard
            const formattedTracks = (tracksData || []).map(track => {
              const youtubeId = extractYoutubeId(track.link);
              return {
                id: track.id,
                slug: track.slug,
                title: track.title,
                link: track.link,
                cover_key: track.cover_key, // Ключ обложки в R2
                source: track.source || "youtube",
                variant: "video", // По умолчанию video, так как поле variant не существует в БД
                coverUrl: null, // null для fallback в TrackCard
                artistSlug: artistData.slug,
                artistName: artistData.display_name || artistData.name,
                youtubeId: youtubeId,
                startSeconds: 0,
                createdAt: track.created_at,
              };
            });
            setTracks(formattedTracks);
          }
        } else {
          setTracks([]);
        }
        
        setLoading(false);

        // Проверка владельца будет выполнена в отдельном useEffect после загрузки артиста
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
  }, [slug]);

  // Обновляем Open Graph теги при загрузке данных артиста
  useEffect(() => {
    if (!artist) {
      clearOgTags();
      return;
    }

    const artistName = artist.display_name || artist.name || "Unknown Artist";
    const coverKey = artist.cover_key || null;
    const tracksCount = tracks.length;

    setArtistOgTags({
      artistName,
      slug: artist.slug,
      coverKey,
      tracksCount,
    });

    // Очищаем теги при размонтировании
    return () => {
      clearOgTags();
    };
  }, [artist, tracks.length]);

  if (loading) {
    return (
      <div className="a-page">
        <PremiumLoader fullScreen message="artist" />
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

  console.log("🎨 Rendering ArtistPage:", { 
    slug, 
    hasArtist: !!artist, 
    isOwner, 
    artistId: artist?.id,
    artistUserId: artist?.user_id,
  });

  const handleEditClick = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      
      if (!session) {
        // Если не авторизован, редиректим на логин
        localStorage.setItem("toqibox:returnTo", `/a/${slug}`);
        navigate("/login", { replace: false });
        return;
      }

      // Если авторизован, редиректим на /author (который потом редиректит на страницу артиста)
      navigate("/author", { replace: false });
    } catch (e) {
      console.error("Ошибка при переходе в редактирование:", e);
      localStorage.setItem("toqibox:returnTo", `/a/${slug}`);
      navigate("/login", { replace: false });
    }
  };

  return (
    <div className="a-page">

      {/* Кнопка входа для неавторизованных */}
      {!isOwner && (
        <div style={{
          position: "fixed",
          top: "12px",
          right: "12px",
          zIndex: 1000,
        }}>
          <button
            onClick={handleEditClick}
            style={{
              padding: "10px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              background: "rgba(0, 0, 0, 0.6)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              backdropFilter: "blur(10px)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(139, 92, 246, 0.8)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(0, 0, 0, 0.6)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
            }}
          >
            {artist ? "Войти в кабинет" : "Войти"}
          </button>
        </div>
      )}

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
          tracks={tracks}
          onCopyLink={async () => {
            const artistUrl = `${window.location.origin}/a/${slug}`;
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(artistUrl);
                setShowCopyNotification(true);
              } else {
                const input = document.createElement("input");
                input.value = artistUrl;
                input.style.position = "fixed";
                input.style.opacity = "0";
                document.body.appendChild(input);
                input.select();
                input.setSelectionRange(0, 99999);
                try {
                  document.execCommand("copy");
                  setShowCopyNotification(true);
                } catch (err) {
                  console.error("Failed to copy:", err);
                }
                document.body.removeChild(input);
              }
            } catch (e) {
              console.error("Failed to copy:", e);
            }
          }}
        />
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title="TOQIBOX"
      />

      <CopyNotification 
        show={showCopyNotification} 
        onClose={() => setShowCopyNotification(false)} 
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
