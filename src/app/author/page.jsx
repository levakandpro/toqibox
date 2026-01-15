// FILE: src/app/author/page.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ArtistHeader from "../../features/artist/ArtistHeader.jsx";
import ArtistTracks from "../../features/artist/ArtistTracks.jsx";
import AddTrackSection from "../../features/artist/AddTrackSection.jsx";
import ArtistPageBackground from "../../features/artist/ArtistPageBackground.jsx";
import ShareSheet from "../../features/share/ShareSheet.jsx";
import PremiumLoader from "../../ui/PremiumLoader.jsx";
import { supabase } from "../../features/auth/supabaseClient.js";
import shareIcon from "../../assets/share.svg";

import "./author.css";

function slugifyBase(input) {
  const s = (input || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

  return s || "artist";
}

function randSuffix(len = 6) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function getArtistForUser(user) {
  const { data: existing, error: selErr } = await supabase
    .from("artists")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (selErr) throw selErr;
  return existing || null;
}

async function createArtistForUser(user) {
  const base = slugifyBase(user?.user_metadata?.full_name || user?.email || "artist");

  for (let attempt = 0; attempt < 8; attempt++) {
    const slug = attempt === 0 ? `${base}-${randSuffix(5)}` : `${base}-${randSuffix(7)}`;

    // Для новых пользователей устанавливаем значения по умолчанию:
    // 1 BG видео (индекс 0) - первый доступный фон для видео фонов в шапке
    // 3 фон фото (индекс 2) - "bg-3" (третий вариант) для фото фонов на странице
            const payload = {
              user_id: user.id,
              slug,
              display_name: "TOQIBOX ARTIST",
              header_start_sec: 0,
              page_background_id: "custom-shader-1", // Первый фон (индекс 0) - custom-shader-1
              page_background_left_id: "bg-3", // Третий вариант (индекс 2) для фото фонов
              play_button_id: "cksunandh", // Orbital (индекс 1) - дефолт для новых артистов
            };

    const { data: created, error: insErr } = await supabase
      .from("artists")
      .insert(payload)
      .select("*")
      .single();

    if (!insErr) return created;

    const msg = (insErr?.message || "").toLowerCase();
    const isUnique =
      insErr?.code === "23505" ||
      msg.includes("duplicate key") ||
      msg.includes("unique") ||
      msg.includes("artists_slug_key");

    if (!isUnique) throw insErr;
  }

  throw new Error("Не удалось создать артиста: slug collisions");
}

export default function AuthorPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [artist, setArtist] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [fatal, setFatal] = useState("");
  const [showAddTrack, setShowAddTrack] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [editMode, setEditMode] = useState(true); // На странице /author всегда режим редактирования
  const [showBackgroundPanels, setShowBackgroundPanels] = useState(true); // Показывать боковые панели с фонами
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [isWeb, setIsWeb] = useState(false);

  useEffect(() => {
    const checkWeb = () => {
      setIsWeb(window.innerWidth >= 768);
    };
    checkWeb();
    window.addEventListener('resize', checkWeb);
    return () => window.removeEventListener('resize', checkWeb);
  }, []);

  const shareUrl = useMemo(() => {
    if (!artist?.slug) return "";
    return `${window.location.origin}/a/${artist.slug}`;
  }, [artist?.slug]);

  // Определяем тариф из profiles.toqibox_plan (TOQIBOX тариф)
  const tariffInfo = useMemo(() => {
    if (!profile) {
      return { type: "БЕСПЛАТНЫЙ", expiresAt: null, isExpired: false };
    }
    
    const plan = profile?.toqibox_plan || 'free';
    const planExpiresAt = profile?.toqibox_plan_expires_at;
    
    if (!planExpiresAt || plan === 'free') {
      return { type: "БЕСПЛАТНЫЙ", expiresAt: null, isExpired: false };
    }
    
    const expiresAt = new Date(planExpiresAt);
    const now = new Date();
    
    if (expiresAt <= now) {
      return { type: "БЕСПЛАТНЫЙ", expiresAt: null, isExpired: true };
    }
    
    let type = "БЕСПЛАТНЫЙ";
    if (plan === 'premium') {
      type = "PREMIUM";
    } else if (plan === 'premium_plus') {
      type = "PREMIUM+";
    }
    
    return {
      type,
      expiresAt: expiresAt,
      isExpired: false,
    };
  }, [profile]);

  // Функция для загрузки треков артиста
  const loadTracks = async (artistId) => {
    if (!artistId) {
      setTracks([]);
      return;
    }

    try {
      const { data: tracksData, error: tracksError } = await supabase
        .from("tracks")
        .select("*")
        .eq("artist_id", artistId)
        .order("created_at", { ascending: false });

      if (tracksError) {
        console.error("Error loading tracks:", tracksError);
        setTracks([]);
        return;
      }

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
        return {
          id: track.id,
          slug: track.slug,
          title: track.title,
          link: track.link,
          cover_key: track.cover_key,
          play_icon: track.play_icon || null,
          preview_start_seconds: track.preview_start_seconds || 0,
          source: track.source || "youtube",
          variant: "video",
          coverUrl: null,
          artistSlug: artist?.slug,
          artistName: artist?.display_name || artist?.name,
          youtubeId: youtubeId,
          startSeconds: 0,
          createdAt: track.created_at,
        };
      });

      setTracks(formattedTracks);
    } catch (e) {
      console.error("Error loading tracks:", e);
      setTracks([]);
    }
  };

  // Функция для обновления данных артиста и треков
  const refreshArtist = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session?.user) return;

      // Загружаем артиста с полями premium
      const a = await getArtistForUser(session.user);
      if (a) {
        setArtist(a);
        await loadTracks(a.id);
      }
    } catch (e) {
      console.error("Error refreshing artist:", e);
    }
  };

  useEffect(() => {
    let alive = true;
    let redirected = false;

    const run = async () => {
      setLoading(true);
      setFatal("");

      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;

        if (!alive || redirected) return;

        if (!session) {
          localStorage.setItem("toqibox:returnTo", "/author");
          navigate("/login", { replace: true });
          return;
        }

        const user = session.user;
        setUserEmail(user.email || "");
        
        // Загружаем профиль пользователя (TOQIBOX использует toqibox_plan)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('toqibox_plan, toqibox_plan_expires_at')
          .eq('id', user.id)
          .maybeSingle();
        
        if (!profileError && profileData) {
          setProfile(profileData);
        }
        
        // Ищем артиста для этого пользователя
        let a = await getArtistForUser(user);

        if (!alive || redirected) return;

        // Если артиста нет - создаем автоматически
        if (!a) {
          console.log("🎨 Артист не найден, создаем автоматически для пользователя:", user.id);
          a = await createArtistForUser(user);
          console.log("✅ Артист создан:", a.slug);
        }

        if (!alive || redirected) return;

        // Показываем страницу редактирования
        setArtist(a);
        await loadTracks(a.id);
        setLoading(false);
      } catch (e) {
        if (!alive || redirected) return;
        setFatal(e?.message || "Ошибка загрузки кабинета");
        setLoading(false);
      }
    };

    run();

    return () => {
      alive = false;
    };
  }, [navigate]);

  const onCreate = async () => {
    setSaving(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;
      if (!session) {
        setSaving(false);
        navigate("/login", { replace: true });
        return;
      }

      const user = session.user;
      
      // Проверяем, нет ли уже артиста
      const existing = await getArtistForUser(user);
      if (existing) {
        // Если артист уже есть, просто редиректим на его страницу
        navigate(`/a/${existing.slug}`, { replace: true });
        setSaving(false);
        return;
      }

      // Создаем нового артиста
      const created = await createArtistForUser(user);

      // Редиректим на публичную страницу артиста
      navigate(`/a/${created.slug}`, { replace: true });
    } catch (e) {
      console.error("Ошибка создания артиста:", e);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="author-shell">
        <PremiumLoader fullScreen message="connecting" />
      </div>
    );
  }

  if (fatal) {
    return (
      <div className="author-shell">
        <div className="author-fatal">
          <div className="author-fatal__title">Не удалось открыть кабинет</div>
          <div className="author-fatal__text">{fatal}</div>
          <button
            className="author-fatal__btn"
            onClick={() => {
              localStorage.setItem("toqibox:returnTo", "/author");
              navigate("/login", { replace: true });
            }}
            type="button"
          >
            Войти снова
          </button>
        </div>
      </div>
    );
  }

  // Если артиста нет - показываем заглушку с кнопкой создания
  if (!artist) {
    return (
      <div className="author-shell">
        <div style={{ 
          minHeight: "100vh", 
          display: "grid", 
          placeItems: "center", 
          padding: 20,
          textAlign: "center"
        }}>
          <div style={{ maxWidth: 500 }}>
            <h1 style={{ 
              fontSize: "clamp(32px, 5vw, 48px)", 
              fontWeight: 800, 
              marginBottom: 20,
              letterSpacing: "0.05em"
            }}>
              Создай страницу артиста
            </h1>
            <p style={{ 
              fontSize: 16, 
              opacity: 0.7, 
              marginBottom: 40,
              lineHeight: 1.6
            }}>
              У тебя ещё нет страницы артиста. Создай её, чтобы начать добавлять треки и делиться своей музыкой.
            </p>
            <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center" }}>
              <button
                type="button"
                onClick={onCreate}
                disabled={saving}
                style={{
                  padding: "14px 28px",
                  borderRadius: 999,
                  border: "1px solid rgba(0,0,0,0.16)",
                  background: "#0b0b0b",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  letterSpacing: "0.05em",
                  cursor: saving ? "default" : "pointer",
                  opacity: saving ? 0.7 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {saving ? "Создаю..." : "Создать страницу артиста"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EDIT PAGE (CANON) - если артист есть
  return (
    <div className={`a-page ${editMode ? 'is-edit' : ''}`}>
      {/* Блок с email и тарифом */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 10001,
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "12px 60px 12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
        pointerEvents: "auto",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.9)",
        }}>
          <span style={{ opacity: 0.7 }}>Email:</span>
          <span style={{ fontWeight: 600 }}>{userEmail}</span>
        </div>
        
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.9)",
        }}>
          <a 
            href="https://toqibox.win/pricing"
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              opacity: 0.7,
              color: "rgba(255, 255, 255, 0.7)",
              textDecoration: "none",
              cursor: "pointer",
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = "1";
              e.target.style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = "0.7";
              e.target.style.textDecoration = "none";
            }}
          >
            Тариф:
          </a>
          <span style={{
            fontWeight: 700,
            letterSpacing: "0.05em",
            color: tariffInfo.type === "БЕСПЛАТНЫЙ" ? "rgba(255, 255, 255, 0.8)" : "#C8A24A",
          }}>
            {tariffInfo.type}
          </span>
          {tariffInfo.isExpired && tariffInfo.type === "БЕСПЛАТНЫЙ" && (
            <span style={{
              fontSize: "9px",
              opacity: 0.6,
              marginLeft: "6px",
              fontStyle: "italic",
            }}>
              истёк
            </span>
          )}
          {tariffInfo.expiresAt && !tariffInfo.isExpired && (
            <span style={{
              fontSize: "11px",
              opacity: 0.7,
              marginLeft: "8px",
            }}>
              до: {tariffInfo.expiresAt.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
          )}
          
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
            {/* Кнопка скрытия/показа панелей фонов */}
            {editMode && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Toggle background panels clicked, current state:", showBackgroundPanels);
                  setShowBackgroundPanels(!showBackgroundPanels);
                }}
                onTouchStart={(e) => {
                  // Для мобильных - сразу срабатываем на touch
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Toggle background panels touched, current state:", showBackgroundPanels);
                  setShowBackgroundPanels(!showBackgroundPanels);
                }}
                className="ah-tooltip"
                data-tooltip={showBackgroundPanels ? "Скрыть панели фонов" : "Показать панели фонов"}
                style={{
                  width: isWeb ? "28px" : "32px",
                  height: isWeb ? "28px" : "32px",
                  minWidth: isWeb ? "28px" : "32px",
                  minHeight: isWeb ? "28px" : "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: showBackgroundPanels ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "6px",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.2s ease",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                  WebkitTouchCallout: "none",
                  userSelect: "none",
                  position: "relative",
                  zIndex: 10002,
                }}
                aria-label={showBackgroundPanels ? "Скрыть панели фонов" : "Показать панели фонов"}
                title={showBackgroundPanels ? "Скрыть панели фонов" : "Показать панели фонов"}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = showBackgroundPanels ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = showBackgroundPanels ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                }}
              >
                <svg
                  width={isWeb ? "14" : "12"}
                  height={isWeb ? "14" : "12"}
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ display: "block" }}
                >
                  <path
                    d={showBackgroundPanels ? "M19 12H5M12 5L5 12L12 19" : "M5 12H19M12 5L19 12L12 19"}
                    stroke="rgba(255, 255, 255, 0.9)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="ah-tooltip"
              data-tooltip="Поделиться"
              style={{
                width: isWeb ? "28px" : "26px",
                height: isWeb ? "28px" : "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.2s ease",
              }}
              aria-label="Поделиться"
              title="Поделиться"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
            >
              <img 
                src={shareIcon} 
                alt="" 
                style={{ width: isWeb ? "14px" : "12px", height: isWeb ? "14px" : "12px", display: "block" }}
              />
            </button>

            <button
              type="button"
              onClick={() => setEditMode(!editMode)}
              className="ah-tooltip"
              data-tooltip={editMode ? "Посмотреть" : "Редактировать"}
              style={{
                width: isWeb ? "28px" : "26px",
                height: isWeb ? "28px" : "26px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
                cursor: "pointer",
                padding: 0,
                transition: "all 0.2s ease",
              }}
              aria-label={editMode ? "Посмотреть" : "Редактировать"}
              title={editMode ? "Посмотреть" : "Редактировать"}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
            >
              <svg
                width={isWeb ? "14" : "12"}
                height={isWeb ? "14" : "12"}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: "block" }}
              >
                <path
                  d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
                  stroke="rgba(255, 255, 255, 0.9)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="rgba(255, 255, 255, 0.9)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <ArtistPageBackground 
        artist={artist} 
        isOwner={true} 
        editMode={editMode}
        showPanel={showBackgroundPanels}
        onUpdate={refreshArtist}
      />

      <ArtistHeader 
        artistSlug={artist.slug} 
        artist={artist} 
        isOwner={true} 
        onUpdate={refreshArtist}
        editMode={editMode}
        onShare={() => setShareOpen(true)}
        showBackgroundPanels={showBackgroundPanels}
        onToggleBackgroundPanels={() => setShowBackgroundPanels(!showBackgroundPanels)}
        hideActionButtons={true}
      />

      {editMode && showAddTrack && (
        <AddTrackSection 
          artist={artist} 
          isOwner={true}
          onTrackAdded={() => {
            refreshArtist();
            setShowAddTrack(false);
          }}
          onCancel={() => setShowAddTrack(false)}
        />
      )}

      <div className="a-content">
        <ArtistTracks
          artistSlug={artist.slug}
          artist={artist}
          isOwner={true}
          editMode={editMode} // Используем состояние editMode для переключения режимов
          showBackgroundPanels={showBackgroundPanels}
          onShare={() => setShareOpen(true)}
          onToggleBackgroundPanels={() => setShowBackgroundPanels(!showBackgroundPanels)}
          onUpdate={refreshArtist}
          tracks={tracks}
          onAddTrack={editMode ? () => setShowAddTrack(true) : undefined}
        />
      </div>

      <ShareSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        url={shareUrl}
        title="TOQIBOX"
      />
    </div>
  );
}
