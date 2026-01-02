import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import TrackPlayer from "../../../features/track/TrackPlayer.jsx";
import PreviewPlayer from "../../../features/track/PreviewPlayer.jsx";
import TubeteikaReaction from "../../../features/reaction/TubeteikaReaction.jsx";
import ShareSheet from "../../../features/share/ShareSheet.jsx";
import ShaderToyBackground from "../../../features/track/ShaderToyBackground.jsx";
import VantaBackground from "../../../features/track/VantaBackground.jsx";
import BackgroundSelector from "../../../features/track/BackgroundSelector.jsx";
import TrackEditForm from "../../../features/track/TrackEditForm.jsx";
import { getPremiumBackgroundById } from "../../../utils/premiumBackgrounds.js";
import YoutubeEmbed from "../../../features/video/YoutubeEmbed.jsx";
import TiktokEmbed from "../../../features/video/TiktokEmbed.jsx";
import InstagramEmbed from "../../../features/video/InstagramEmbed.jsx";
import { getMockTrackBySlug } from "../../../features/track/track.mock.js";
import { getMockArtistBySlug } from "../../../features/artist/artist.mock.js";
import { supabase } from "../../../features/auth/supabaseClient.js";
import { setTrackOgTags, clearOgTags } from "../../../utils/ogTags.js";
import PremiumLoader from "../../../ui/PremiumLoader.jsx";

import verifGold from "../../../assets/verifgold.svg";
import shareIcon from "../../../assets/share.svg";
import editIcon from "../../../assets/icons/edit.svg";

export default function TrackPage() {
  const navigate = useNavigate();
  const { slug = "test" } = useParams();

  const [track, setTrack] = useState(null);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [previewEnded, setPreviewEnded] = useState(false);
  const [mainPlayerPlaying, setMainPlayerPlaying] = useState(false);
  const [isOwner, setIsOwner] = useState(false); // ВРЕМЕННО: для локальной разработки всегда true
  const [showEditForm, setShowEditForm] = useState(false);
  const [showVerticalVideo, setShowVerticalVideo] = useState(false);
  const [viewAsUser, setViewAsUser] = useState(false); // Режим просмотра как пользователь

  // Функции для извлечения ID из ссылок
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

  const extractTikTokId = (url) => {
    if (!url) return null;
    // TikTok URL форматы:
    // https://www.tiktok.com/@user/video/1234567890
    // https://tiktok.com/@user/video/1234567890
    // https://vm.tiktok.com/xxxxx
    // https://m.tiktok.com/v/1234567890
    const patterns = [
      /tiktok\.com\/@[^\/]+\/video\/(\d+)/i,
      /vm\.tiktok\.com\/([A-Za-z0-9]+)/i,
      /m\.tiktok\.com\/v\/(\d+)/i,
      /tiktok\.com\/t\/([A-Za-z0-9]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    
    return null;
  };

  const extractInstagramShortcode = (url) => {
    if (!url) return null;
    // Instagram Reels URL форматы:
    // https://www.instagram.com/reel/ABC123/
    // https://instagram.com/reel/ABC123/
    // https://www.instagram.com/p/ABC123/
    // https://instagram.com/p/ABC123/
    // https://www.instagram.com/reels/ABC123/
    const patterns = [
      /instagram\.com\/reel\/([A-Za-z0-9_-]+)/i,
      /instagram\.com\/reels\/([A-Za-z0-9_-]+)/i,
      /instagram\.com\/p\/([A-Za-z0-9_-]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    
    return null;
  };

  // Загружаем трек из БД
  useEffect(() => {
    let alive = true;

    const loadTrack = async () => {
      setLoading(true);
      try {
        // Загружаем трек из БД
        const { data: trackData, error: trackError } = await supabase
          .from("tracks")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (trackError) {
          console.error("Error loading track:", trackError);
          // Fallback на мок, если трек не найден
          const mockTrack = getMockTrackBySlug(slug);
          if (alive) {
            setTrack(mockTrack);
            const mockArtist = getMockArtistBySlug(mockTrack.artistSlug);
            setArtist(mockArtist);
          }
          setLoading(false);
          return;
        }

        if (!trackData) {
          // Fallback на мок, если трек не найден
          const mockTrack = getMockTrackBySlug(slug);
          if (alive) {
            setTrack(mockTrack);
            const mockArtist = getMockArtistBySlug(mockTrack.artistSlug);
            setArtist(mockArtist);
          }
          setLoading(false);
          return;
        }

        // Загружаем артиста
        const { data: artistData, error: artistError } = await supabase
          .from("artists")
          .select("*")
          .eq("id", trackData.artist_id)
          .maybeSingle();

        if (artistError) {
          console.error("Error loading artist:", artistError);
        }

        if (alive) {
          // ВРЕМЕННО: Для локальной разработки всегда считаем пользователя владельцем
          setIsOwner(true);
          
          // Преобразуем трек из БД в формат для компонента
          const source = String(trackData.source || "youtube").toLowerCase();
          const link = trackData.link || "";
          
          let youtubeId = null;
          let tiktokId = null;
          let instagramShortcode = null;
          
          if (source === "youtube") {
            youtubeId = extractYoutubeId(link);
          } else if (source === "tiktok") {
            tiktokId = extractTikTokId(link);
          } else if (source === "instagram") {
            instagramShortcode = extractInstagramShortcode(link);
          }
          
          const formattedTrack = {
            id: trackData.id,
            slug: trackData.slug,
            title: trackData.title,
            link: trackData.link, // YouTube ссылка для центрального плеера
            cover_key: trackData.cover_key, // Ключ обложки в R2
            play_icon: trackData.play_icon || null, // Иконка плеера
            preview_start_seconds: trackData.preview_start_seconds || 0, // Начало превью
            shadertoy_background_id: trackData.shadertoy_background_id || null, // ShaderToy фон
            artistSlug: artistData?.slug || "unknown",
            artistName: artistData?.display_name || artistData?.name || "Unknown Artist",
            source: "youtube", // Всегда YouTube для центрального плеера
            variant: "video",
            coverUrl: null,
            youtubeId: youtubeId, // Извлекаем из link (YouTube ссылка)
            startSeconds: 0,
            createdAt: trackData.created_at,
            // Вертикальные видео для кнопки в шапке
            vertical_video_source: trackData.vertical_video_source || null,
            shorts_link: trackData.shorts_link || null,
            tiktok_link: trackData.tiktok_link || null,
            reels_link: trackData.reels_link || null,
          };
          

          setTrack(formattedTrack);
          setArtist(artistData || null);
        }
      } catch (e) {
        console.error("Error loading track:", e);
        // Fallback на мок
        const mockTrack = getMockTrackBySlug(slug);
        if (alive) {
          setTrack(mockTrack);
          const mockArtist = getMockArtistBySlug(mockTrack.artistSlug);
          setArtist(mockArtist);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    loadTrack();

    return () => {
      alive = false;
    };
  }, [slug]);

  // Обновляем данные артиста при фокусе страницы (чтобы видеть изменения с страницы автора)
  useEffect(() => {
    if (!track?.artist_id) return;

    const handleFocus = async () => {
      try {
        const { data: artistData, error } = await supabase
          .from("artists")
          .select("*")
          .eq("id", track.artist_id)
          .maybeSingle();

        if (!error && artistData) {
          setArtist(artistData);
          // Обновляем имя артиста в track
          setTrack(prev => ({
            ...prev,
            artistName: artistData?.display_name || artistData?.name || prev.artistName
          }));
        }
      } catch (e) {
        console.error("Error refreshing artist on focus:", e);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [track?.artist_id]);

  const isPremium = !!artist?.isPremium;

  const shareUrl = useMemo(() => {
    return `${window.location.origin}/t/${slug}`;
  }, [slug]);

  // Обновляем Open Graph теги при загрузке данных трека
  useEffect(() => {
    if (!track || !artist) {
      clearOgTags();
      return;
    }

    setTrackOgTags({
      trackTitle: track.title,
      artistName: track.artistName,
      slug: track.slug,
      coverKey: track.cover_key || null,
      source: track.source || "youtube",
      artistSlug: track.artistSlug || null,
    });

    // Очищаем теги при размонтировании
    return () => {
      clearOgTags();
    };
  }, [track, artist]);

  // Блокируем скролл body когда открыто вертикальное видео
  useEffect(() => {
    if (showVerticalVideo) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [showVerticalVideo]);

  const handleShare = () => {
    setShareOpen(true);
  };

  // Определяем вертикальное видео для кнопки в шапке
  const verticalVideo = useMemo(() => {
    if (!track) return null;
    const source = String(track.vertical_video_source || "").toLowerCase();
    
    if (source === "shorts" && track.shorts_link) {
      const youtubeId = extractYoutubeId(track.shorts_link);
      return { type: "shorts", link: track.shorts_link, youtubeId };
    } else if (source === "tiktok" && track.tiktok_link) {
      const tiktokId = extractTikTokId(track.tiktok_link);
      return { type: "tiktok", link: track.tiktok_link, tiktokId };
    } else if (source === "reels" && track.reels_link) {
      const instagramShortcode = extractInstagramShortcode(track.reels_link);
      return { type: "reels", link: track.reels_link, instagramShortcode };
    }
    
    return null;
  }, [track?.vertical_video_source, track?.shorts_link, track?.tiktok_link, track?.reels_link]);

  const sourceLabel = useMemo(() => {
    if (!verticalVideo) return "";
    
    if (verticalVideo.type === "shorts") return "SHORTS";
    if (verticalVideo.type === "reels") return "REELS";
    if (verticalVideo.type === "tiktok") return "TIK TOK";
    
    return "";
  }, [verticalVideo]);

  const sourceType = useMemo(() => {
    if (!verticalVideo) return null;
    return verticalVideo.type;
  }, [verticalVideo]);

  const handleAddTrack = async (e) => {
    e.preventDefault();

    try {
      // ВРЕМЕННО: Отключаем проверку авторизации для локальной разработки
      // TODO: Вернуть проверку авторизации позже
      
      // ВРЕМЕННО: Просто переходим на /author без проверки
      navigate("/author", { replace: true });
      
      /* ЗАКОММЕНТИРОВАНО ДЛЯ ЛОКАЛЬНОЙ РАЗРАБОТКИ
      const { data } = await supabase.auth.getSession();
      const hasSession = !!data?.session;

      if (!hasSession) {
        localStorage.setItem("toqibox:returnTo", "/author");
        navigate("/login", { replace: true });
        return;
      }

      navigate("/author", { replace: true });
      */
    } catch (err) {
      console.error("Ошибка при переходе в редактирование:", err);
      // ВРЕМЕННО: Не редиректим на логин
      // localStorage.setItem("toqibox:returnTo", "/author");
      // navigate("/login", { replace: true });
    }
  };

  if (loading || !track) {
    return (
      <div className="t-page">
        <PremiumLoader fullScreen message="track" />
      </div>
    );
  }

  // Получаем обложку для фона
  const coverUrl = track.coverUrl || (track.youtubeId 
    ? `https://img.youtube.com/vi/${track.youtubeId}/maxresdefault.jpg`
    : null);

  // Проверяем, является ли выбранный фон премиум
  const premiumBackground = getPremiumBackgroundById(track.shadertoy_background_id);
  const isVantaBackground = premiumBackground && premiumBackground.type === "vanta" && premiumBackground.effectType;
  const isPremiumShaderToy = premiumBackground && premiumBackground.type === "shadertoy" && premiumBackground.shaderId;
  const isRegularShaderToy = track.shadertoy_background_id && !premiumBackground;

  return (
    <div className="t-page">
      {/* Vanta.js фон (если выбран премиум Vanta) */}
      {isVantaBackground && (
        <VantaBackground 
          effectType={premiumBackground.effectType} 
          color={premiumBackground.color || 0xe30a0a}
          color1={premiumBackground.color1 || null}
          color2={premiumBackground.color2 || null}
        />
      )}
      
      {/* ShaderToy премиум фон (если выбран премиум ShaderToy) */}
      {isPremiumShaderToy && (
        <ShaderToyBackground backgroundId={track.shadertoy_background_id} />
      )}
      
      {/* ShaderToy фон (если выбран обычный ShaderToy фон) */}
      {isRegularShaderToy && (
        <ShaderToyBackground backgroundId={track.shadertoy_background_id} />
      )}
      
      <div className="t-overlay" aria-hidden="true" />

      <header className="t-header" style={{ position: "relative", zIndex: 100, display: showVerticalVideo ? "none" : "flex" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            className="t-share"
            onClick={handleShare}
            aria-label="Share"
            type="button"
            style={{ position: "relative", zIndex: 101 }}
          >
            <img src={shareIcon} alt="" className="t-shareIcon" />
          </button>

          {/* Кнопка просмотра как пользователь (только для владельца) - иконка глазика */}
          {isOwner && (
            <button
              type="button"
              onClick={() => setViewAsUser(!viewAsUser)}
              style={{
                padding: "6px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: viewAsUser ? "rgba(255, 255, 255, 0.1)" : "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                position: "relative",
                zIndex: 101,
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                if (!viewAsUser) {
                  e.target.style.background = "rgba(255, 255, 255, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                if (!viewAsUser) {
                  e.target.style.background = "transparent";
                } else {
                  e.target.style.background = "rgba(255, 255, 255, 0.1)";
                }
              }}
              title={viewAsUser ? "Выйти из режима просмотра" : "Просмотр как пользователь"}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.6, display: "block" }}
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          )}
          {/* Кнопка редактирования трека (только для владельца) - иконка карандаша - скрыта в режиме просмотра как пользователь */}
          {isOwner && !viewAsUser && (
            <button
              type="button"
              onClick={() => setShowEditForm(true)}
              style={{
                padding: "6px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "transparent",
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                position: "relative",
                zIndex: 101,
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                e.target.style.background = "rgba(255, 255, 255, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.target.style.background = "transparent";
              }}
              title="Редактировать трек"
            >
              <img src={editIcon} alt="Редактировать" style={{ width: "14px", height: "14px", display: "block", opacity: 0.6 }} />
            </button>
          )}
        </div>

        <div className="t-headerRight">
          {/* Канон: "Добавить трек" всегда ведёт в /author (через проверку сессии) - скрыта в режиме просмотра как пользователь */}
          {!viewAsUser && (
            <Link 
              to="/author" 
              onClick={handleAddTrack}
              title="Add New"
              className="add-track-btn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                className="add-track-svg"
              >
                <path
                  d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z"
                  strokeWidth="1.5"
                ></path>
                <path d="M8 12H16" strokeWidth="1.5"></path>
                <path d="M12 16V8" strokeWidth="1.5"></path>
              </svg>
            </Link>
          )}
          {sourceType && verticalVideo && (
            <button
              type="button"
              onClick={() => setShowVerticalVideo(true)}
              className="t-source"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#fff",
                opacity: 1,
              }}
            >
              <svg
                className="t-formatIcon"
                viewBox="0 0 10 10"
                aria-hidden="true"
              >
                <path
                  d="M2 2 L7 5 L2 8 Z"
                  fill="rgba(144, 238, 144, 0.8)"
                  stroke="rgba(144, 238, 144, 0.6)"
                  strokeWidth="0.3"
                />
              </svg>
              {sourceLabel}
            </button>
          )}
        </div>
      </header>

      <main className="t-center" style={{ position: "relative" }}>
        {/* Превью-плеер: автовоспроизведение 30 секунд на фоне (скрыто) до нажатия главного плеера */}
        {track?.youtubeId && !previewEnded && !mainPlayerPlaying && (
          <PreviewPlayer
            videoId={track.youtubeId}
            startSeconds={track.preview_start_seconds || 0}
            onPreviewEnd={() => {
              setPreviewEnded(true);
            }}
            onPlayClick={() => {
              setPreviewEnded(true);
              setMainPlayerPlaying(true);
            }}
          />
        )}
        {/* Главный плеер - воспроизводит от начала до конца при нажатии */}
        {track && (
          <TrackPlayer 
            track={{
              ...track,
              startSeconds: 0, // Всегда воспроизводим от начала при нажатии на плей
            }}
            artist={artist}
            onPlay={() => {
              setPreviewEnded(true);
              setMainPlayerPlaying(true);
            }}
          />
        )}

        {/* Вертикальное видео (показывается при клике на кнопку в шапке) */}
        {showVerticalVideo && verticalVideo && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowVerticalVideo(false);
              }
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#000000",
              zIndex: 10000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0",
              overflow: "hidden",
              width: "100vw",
              height: "100vh",
            }}
          >
            <div
              style={{
                width: "100vw",
                height: "100vh",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                backgroundColor: "#000000",
              }}
            >
              <button
                type="button"
                onClick={() => setShowVerticalVideo(false)}
                style={{
                  position: "fixed",
                  top: "20px",
                  right: "20px",
                  background: "rgba(0, 0, 0, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "50%",
                  color: "#fff",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "24px",
                  zIndex: 10001,
                  lineHeight: "1",
                  padding: "0",
                }}
              >
                ×
              </button>
              <div
                style={{
                  width: "100vw",
                  height: "calc(100vw * 16 / 9)",
                  maxHeight: "100vh",
                  aspectRatio: "9/16",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#000000",
                }}
              >
                {verticalVideo.type === "shorts" && verticalVideo.youtubeId ? (
                  <YoutubeEmbed videoId={verticalVideo.youtubeId} startSeconds={0} vertical={true} />
                ) : verticalVideo.type === "shorts" ? (
                  <div style={{ color: "#fff", padding: "20px", textAlign: "center" }}>
                    Ошибка: не удалось извлечь ID из ссылки Shorts
                    <br />
                    <small>{verticalVideo.link}</small>
                  </div>
                ) : null}
                {verticalVideo.type === "tiktok" && verticalVideo.tiktokId && (
                  <TiktokEmbed videoId={verticalVideo.tiktokId} />
                )}
                {verticalVideo.type === "reels" && verticalVideo.instagramShortcode && (
                  <InstagramEmbed shortcode={verticalVideo.instagramShortcode} />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="t-bottom" style={{ display: showVerticalVideo ? "none" : "flex" }}>
        <div className="t-meta">
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "clamp(16px, 3.2vw, 34px)",
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              {(() => {
                // Проверяем localStorage для обхода RLS
                if (artist?.id) {
                  const localValue = localStorage.getItem(`toqibox:artist:${artist.id}:display_name`);
                  if (localValue) {
                    return localValue;
                  }
                }
                return artist?.display_name || artist?.name || track?.artistName || "Unknown Artist";
              })()}
            </span>
            {isPremium && (
              <img
                src={verifGold}
                alt=""
                className="t-verifGold"
                aria-hidden="true"
              />
            )}
          </div>
          
          <div style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
            fontSize: "clamp(13px, 2vw, 16px)",
            fontWeight: 300,
            color: "rgba(255, 255, 255, 0.9)",
            letterSpacing: "0.05em",
            marginTop: "2px",
          }}>
            {track.title}
          </div>
        </div>

        <div className="t-actions">
          {/* Лайки скрыты в режиме редактирования, показываются в режиме просмотра как пользователь */}
          {!showEditForm && (viewAsUser || !isOwner) && <TubeteikaReaction trackSlug={track.slug} />}
        </div>
      </footer>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title={track.title}
      />
      
      {/* Форма редактирования трека - скрыта в режиме просмотра как пользователь */}
      {showEditForm && track && !viewAsUser && (
        <TrackEditForm
          track={track}
          artist={artist}
          onSave={(updatedTrack) => {
            setTrack(updatedTrack);
            setShowEditForm(false);
            // Перезагружаем страницу для обновления данных
            window.location.reload();
          }}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
}
