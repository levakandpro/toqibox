// FILE: src/app/a/[slug]/page.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import ArtistHeader from "../../../features/artist/ArtistHeader.jsx";
import ArtistTracks from "../../../features/artist/ArtistTracks.jsx";
import ArtistPageBackground from "../../../features/artist/ArtistPageBackground.jsx";
import ArtistPageBackgroundLeft from "../../../features/artist/ArtistPageBackgroundLeft.jsx";

import ShareSheet from "../../../features/share/ShareSheet.jsx";
import CopyNotification from "../../../ui/CopyNotification.jsx";
import PremiumLoader from "../../../ui/PremiumLoader.jsx";
import ErrorPage from "../../../ui/ErrorPage.jsx";
import ShaderToyBackground from "../../../features/track/ShaderToyBackground.jsx";
import { supabase } from "../../../features/auth/supabaseClient.js";
import { setArtistOgTags, clearOgTags } from "../../../utils/ogTags.js";
import { createArtistStructuredData, setStructuredData, clearStructuredData } from "../../../utils/structuredData.js";
import { logger } from "../../../utils/logger.js";
import shareIcon from "../../../assets/share.svg";

export default function ArtistPage() {
  const { slug = "artist" } = useParams();
  const navigate = useNavigate();

  const [shareOpen, setShareOpen] = useState(false);
  const [artist, setArtist] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
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
            // Поддержка Shorts: youtube.com/shorts/VIDEO_ID
            const shortsMatch = url.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/);
            if (shortsMatch) return shortsMatch[1];
            // Обычные ссылки YouTube
            const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const match = url.match(regex);
            return match ? match[1] : null;
          };

          // Преобразуем треки из БД в формат для TrackCard
          const formattedTracks = (tracksData || []).map(track => {
            const youtubeId = extractYoutubeId(track.link);
            logger.log("🎵 Processing track:", { 
              id: track.id, 
              title: track.title, 
              link: track.link, 
              youtubeId,
              hasLink: !!track.link,
            });
            
            if (!track.link) {
              logger.warn("⚠️ Track without link:", track.id);
            }
            
            if (!youtubeId && track.link) {
              logger.warn("⚠️ Could not extract YouTube ID from link:", track.link);
            }
            
            return {
              id: track.id,
              slug: track.slug,
              title: track.title,
              link: track.link,
              cover_key: track.cover_key, // Ключ обложки в R2
              play_icon: track.play_icon || null, // Иконка плеера
              preview_start_seconds: track.preview_start_seconds || 0, // Время начала превью
              shadertoy_background_id: track.shadertoy_background_id || null, // ShaderToy фон
              source: track.source || "youtube",
              variant: "video", // По умолчанию video, так как поле variant не существует в БД
              coverUrl: null, // null для fallback в TrackCard
              artistSlug: artistData.slug,
              artistName: artistData.display_name || artistData.name,
              youtubeId: youtubeId,
              startSeconds: track.preview_start_seconds || 0,
              createdAt: track.created_at,
              views_count: track.views_count || 0, // Количество просмотров
              likes_count: track.likes_count || 0, // Количество лайков (Тюбитеек)
            };
          });
          logger.log("🎨 Formatted tracks:", formattedTracks.length);
          setTracks(formattedTracks);
        }
      }
    } catch (e) {
      logger.error("❌ Error refreshing artist:", e);
    }
  };

  const shareUrl = useMemo(() => {
    return `${window.location.origin}/a/${slug}`;
  }, [slug]);

  // Убрали subscriptionRef - больше не слушаем auth state changes


  // Получаем фон из первого трека (последний созданный) - ВАЖНО: вызывается безусловно до всех return
  const backgroundId = useMemo(() => {
    if (tracks.length > 0) {
      // Берем фон из первого трека (самый последний созданный)
      return tracks[0]?.shadertoy_background_id || null;
    }
    return null;
  }, [tracks]);

  // ВРЕМЕННО: Отключаем проверку авторизации для локальной разработки
  // TODO: Вернуть проверку авторизации позже
  useEffect(() => {
    // ВРЕМЕННО: Всегда делаем пользователя владельцем для локальной разработки
    if (artist?.id) {
      setIsOwner(true);
      console.log("⚠️ ВРЕМЕННО: Режим разработки - пользователь считается владельцем");
    } else {
      setIsOwner(false);
    }
    
    /* ЗАКОММЕНТИРОВАНО ДЛЯ ЛОКАЛЬНОЙ РАЗРАБОТКИ
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
    */
  }, [artist?.id, artist?.user_id]);


  // Функция сохранения данных артиста

  useEffect(() => {
    let alive = true;
    let timeoutId = null;

    const run = async () => {
      logger.log("🚀 Starting load for slug:", slug);
      logger.log("🌐 Location:", window.location.href);
      setLoading(true);

      // Таймаут на случай, если запрос зависнет
      timeoutId = setTimeout(() => {
        if (alive) {
          logger.warn("⚠️ Loading timeout after 5s, showing page anyway");
          setLoading(false);
          setArtist(null);
        }
      }, 5000);

      try {
        logger.log("📡 Fetching artist from Supabase...");
        logger.log("🔍 Supabase URL:", import.meta.env.VITE_SUPABASE_URL ? "✅ Set" : "❌ Missing");
        
        // Загружаем артиста из БД
        const { data: artistData, error: artistError } = await supabase
          .from("artists")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        
        logger.log("📦 Supabase response:", { 
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
          logger.log("❌ Component unmounted, aborting");
          return;
        }

        if (artistError) {
          logger.error("❌ Artist query error:", artistError);
          setArtist(null);
          setLoading(false);
          return;
        }

        logger.log("✅ Artist loaded:", artistData ? "found" : "not found");

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
            logger.error("Error loading tracks:", tracksError);
            setTracks([]);
          } else {
            // Функция для извлечения YouTube ID из ссылки
            const extractYoutubeId = (url) => {
              if (!url) return null;
              // Поддержка Shorts: youtube.com/shorts/VIDEO_ID
              const shortsMatch = url.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/);
              if (shortsMatch) return shortsMatch[1];
              // Обычные ссылки YouTube
              const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
              const match = url.match(regex);
              return match ? match[1] : null;
            };

            // Преобразуем треки из БД в формат для TrackCard
            const formattedTracks = (tracksData || []).map(track => {
              const youtubeId = extractYoutubeId(track.link);
              logger.log("🎵 Processing track (initial load):", { 
                id: track.id, 
                title: track.title, 
                link: track.link, 
                youtubeId,
                hasLink: !!track.link 
              });
              
              if (!track.link) {
                logger.warn("⚠️ Track without link:", track.id);
              }
              
              if (!youtubeId && track.link) {
                logger.warn("⚠️ Could not extract YouTube ID from link:", track.link);
              }
              
              return {
                id: track.id,
                slug: track.slug,
                title: track.title,
                link: track.link,
                cover_key: track.cover_key, // Ключ обложки в R2
                play_icon: track.play_icon || null, // Иконка плеера
                preview_start_seconds: track.preview_start_seconds || 0, // Время начала превью
                shadertoy_background_id: track.shadertoy_background_id || null, // ShaderToy фон
                source: track.source || "youtube",
                variant: "video", // По умолчанию video, так как поле variant не существует в БД
                coverUrl: null, // null для fallback в TrackCard
                artistSlug: artistData.slug,
                artistName: artistData.display_name || artistData.name,
                youtubeId: youtubeId,
                startSeconds: track.preview_start_seconds || 0,
                createdAt: track.created_at,
                views_count: track.views_count || 0, // Количество просмотров
                likes_count: track.likes_count || 0, // Количество лайков (Тюбитеек)
              };
            });
            logger.log("🎨 Formatted tracks (initial):", formattedTracks.length);
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
        logger.error("❌ Error loading artist:", e);
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

  // Обновляем Open Graph теги и Structured Data при загрузке данных артиста
  useEffect(() => {
    if (!artist) {
      clearOgTags();
      clearStructuredData();
      return;
    }

    const artistName = artist.display_name || artist.name || "Unknown Artist";
    const coverKey = artist.cover_key || null;
    const tracksCount = tracks.length;

    // Open Graph теги для соцсетей
    setArtistOgTags({
      artistName,
      slug: artist.slug,
      coverKey,
      tracksCount,
    });

    // Structured Data (JSON-LD) для поисковых систем
    const structuredData = createArtistStructuredData({
      artistName,
      slug: artist.slug,
      coverKey,
      tracksCount,
      tracks: tracks.slice(0, 10), // Первые 10 треков для SEO
    });
    setStructuredData(structuredData);

    // Очищаем теги при размонтировании
    return () => {
      clearOgTags();
      clearStructuredData();
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
      <ErrorPage
        code={404}
        title="Артист не найден"
        message="Похоже, страница этого артиста не существует или была удалена."
        hint="Проверьте правильность ссылки или вернитесь на главную страницу."
        buttonAction="home"
      />
    );
  }

  logger.log("🎨 Rendering ArtistPage:", { 
    slug, 
    hasArtist: !!artist, 
    isOwner, 
    artistId: artist?.id,
  });

  const handleEditClick = async () => {
    try {
      // ВРЕМЕННО: Отключаем проверку авторизации для локальной разработки
      // TODO: Вернуть проверку авторизации позже
      
      // ВРЕМЕННО: Просто переходим на /author без проверки
      navigate("/author", { replace: false });
      
      /* ЗАКОММЕНТИРОВАНО ДЛЯ ЛОКАЛЬНОЙ РАЗРАБОТКИ
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
      */
    } catch (e) {
      logger.error("Ошибка при переходе в редактирование:", e);
      // ВРЕМЕННО: Не редиректим на логин
      // localStorage.setItem("toqibox:returnTo", `/a/${slug}`);
      // navigate("/login", { replace: false });
    }
  };

  return (
    <div className="a-page">
      {/* ShaderToy фон из первого трека (если выбран) */}
      {backgroundId && (
        <ShaderToyBackground backgroundId={backgroundId} />
      )}

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

      <ArtistHeader 
        artist={artist} 
        isOwner={false}
        onUpdate={refreshArtist} 
        editMode={false}
        onShare={() => setShareOpen(true)}
      />

      <ArtistPageBackground 
        artist={artist} 
        isOwner={false}
        editMode={false}
        onUpdate={refreshArtist}
        key={`bg-public-${artist?.id}`}
      />

      <ArtistPageBackgroundLeft 
        artist={artist} 
        isOwner={false}
        editMode={false}
        onUpdate={refreshArtist}
        key={`bg-left-public-${artist?.id}`}
      />

      <div className="a-content">
        <ArtistTracks 
          artist={artist} 
          isOwner={false}
          editMode={false}
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
                    logger.error("Failed to copy:", err);
                  }
                  document.body.removeChild(input);
                }
              } catch (e) {
                logger.error("Failed to copy:", e);
              }
          }}
        />
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title={artist?.display_name || artist?.name || "TOQIBOX"}
      />

      <CopyNotification 
        show={showCopyNotification} 
        onClose={() => setShowCopyNotification(false)} 
      />
    </div>
  );
}
