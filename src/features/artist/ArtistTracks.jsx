import React, { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import TrackCard from "../track/TrackCard.jsx";
import { getMockTracksByArtistSlug } from "../track/track.mock.js";
import verifGold from "../../assets/verifgold.svg";
import ArtistPageBackground from "./ArtistPageBackground.jsx";
import ArtistPageBackgroundLeft from "./ArtistPageBackgroundLeft.jsx";
import { getR2Url } from "../../utils/r2Upload.js";
import coverDefault from "../../assets/cover.png";
import tqVideo from "../../assets/covers/tq.mp4";

import copyIcon from "../../assets/copy.svg";
import { supabase } from "../../features/auth/supabaseClient.js";
import PremiumLoader from "../../ui/PremiumLoader.jsx";

import youtubeIcon from "../../assets/soc/youtube.svg";
import tiktokIcon from "../../assets/soc/tiktok.svg";
import instagramIcon from "../../assets/soc/instagram.svg";

export default function ArtistTracks({
  artist,
  isOwner = false,
  onShare,
  tracks: tracksProp,
  onUpdate,
  onCopyLink,
  onAddTrack,
  editMode = false,
  onToggleEditMode,
  showBackgroundPanels = true,
  onToggleBackgroundPanels,
}) {
  const [editingSocial, setEditingSocial] = useState(null); // 'youtube', 'tiktok', 'instagram' или null
  const [socialUrl, setSocialUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const cardsGridRef = useRef(null);


  const handleEditTrack = async (trackId, data) => {
    if (!onUpdate) return;
    
    try {
      // Обновляем трек в БД
      const updateData = {
        title: data.title,
        link: data.link,
        updated_at: new Date().toISOString(),
      };

      // Если передан cover_key, обновляем его
      if (data.cover_key !== undefined) {
        updateData.cover_key = data.cover_key;
      }

      // Если передан play_icon, пытаемся обновить его
      // Если поле не существует в БД, просто пропускаем его
      let playIconData = {};
      if (data.play_icon !== undefined && data.play_icon !== null) {
        playIconData.play_icon = data.play_icon;
      }

      // Если передан preview_start_seconds, обновляем его
      if (data.preview_start_seconds !== undefined) {
        updateData.preview_start_seconds = Number(data.preview_start_seconds) || 0;
      }

      // Если передан shadertoy_background_id, обновляем его
      if (data.shadertoy_background_id !== undefined) {
        updateData.shadertoy_background_id = data.shadertoy_background_id;
      }

      console.log("📝 Обновление трека:", { trackId, updateData, playIconData });

      // Сначала пытаемся обновить с play_icon
      let updateDataWithIcon = { ...updateData, ...playIconData };
      let { error, data: updateResult } = await supabase
        .from("tracks")
        .update(updateDataWithIcon)
        .eq("id", trackId)
        .select();

      // Если ошибка связана с play_icon, пробуем без него
      if (error && error.message && (
        error.message.includes("play_icon") || 
        error.message.includes("column") ||
        error.code === "42703" // PostgreSQL error code for undefined column
      )) {
        console.warn("⚠️ Поле play_icon не существует в БД, сохраняем без него");
        console.warn("💡 Добавьте поле play_icon в таблицу tracks в Supabase (см. SUPABASE_PLAY_ICON_SETUP.md)");
        
        // Пробуем обновить без play_icon
        const { error: errorWithoutIcon } = await supabase
          .from("tracks")
          .update(updateData)
          .eq("id", trackId)
          .select();
        
        if (errorWithoutIcon) {
          console.error("❌ Ошибка обновления трека (без play_icon):", errorWithoutIcon);
          throw errorWithoutIcon;
        }
        
        console.log("✅ Трек обновлен (без play_icon)");
      } else if (error) {
        console.error("❌ Ошибка обновления трека:", error);
        console.error("📋 Данные для обновления:", updateDataWithIcon);
        console.error("🔍 Детали ошибки:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      } else {
        console.log("✅ Трек успешно обновлен (с play_icon):", updateResult);
      }

      console.log("✅ Трек успешно обновлен:", updateResult);

      // Обновляем список треков
      await onUpdate();
    } catch (error) {
      console.error("Error updating track:", error);
      throw error;
    }
  };

  const handleDeleteTrack = async (trackId) => {
    if (!onUpdate) return;
    
    try {
      // Удаляем трек из БД
      // Обложка в R2 останется, но это не критично (можно очистить вручную при необходимости)
      const { error } = await supabase
        .from("tracks")
        .delete()
        .eq("id", trackId);

      if (error) {
        console.error("Error deleting track:", error);
        throw error;
      }

      // Обновляем список треков
      await onUpdate();
    } catch (error) {
      console.error("Error deleting track:", error);
      throw error;
    }
  };

  const tracks = useMemo(() => {
    const result = Array.isArray(tracksProp)
      ? tracksProp
      : getMockTracksByArtistSlug(artist?.slug);
    console.log("🎵 ArtistTracks - tracks:", result.length, "from prop:", tracksProp?.length || 0);
    return result;
  }, [tracksProp, artist?.slug]);

  const getSocialUrl = (key) => {
    switch (key) {
      case "youtube":
        return (artist?.soc_youtube || artist?.youtubeUrl || "").trim();
      case "tiktok":
        return (artist?.soc_tiktok || artist?.tiktokUrl || "").trim();
      case "instagram":
        return (artist?.soc_instagram || artist?.instagramUrl || "").trim();
      default:
        return "";
    }
  };

  const hasSocialUrl = (key) => {
    return getSocialUrl(key).length > 0;
  };

  const socials = [
    {
      key: "youtube",
      href: getSocialUrl("youtube") || "https://youtube.com",
      icon: youtubeIcon,
      label: "YouTube",
      dbField: "soc_youtube",
    },
    {
      key: "tiktok",
      href: getSocialUrl("tiktok") || "https://tiktok.com",
      icon: tiktokIcon,
      label: "TikTok",
      dbField: "soc_tiktok",
    },
    {
      key: "instagram",
      href: getSocialUrl("instagram") || "https://instagram.com",
      icon: instagramIcon,
      label: "Instagram",
      dbField: "soc_instagram",
    },
  ];

  const handleSocialClick = (social) => {
    const url = getSocialUrl(social.key);
    
    // Если есть ссылка и (не владелец ИЛИ владелец в режиме просмотра) - открываем ссылку
    if (url && (!isOwner || (isOwner && !editMode))) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    
    // Если владелец в режиме редактирования - открываем редактирование
    if (isOwner && editMode) {
      setEditingSocial(social.key);
      setSocialUrl(url || "");
    }
  };

  const handleSocialSave = async (social) => {
    if (!artist?.id || !isOwner) return;

    setSaving(true);
    try {
      const updateData = { [social.dbField]: socialUrl.trim() };
      
      const { error } = await supabase
        .from("artists")
        .update(updateData)
        .eq("id", artist.id);

      if (error) throw error;

      // Обновляем данные
      if (onUpdate) {
        onUpdate();
      }

      setEditingSocial(null);
      setSocialUrl("");
    } catch (e) {
      console.error("Error saving social:", e);
      alert("Ошибка при сохранении: " + (e.message || "Неизвестная ошибка"));
    } finally {
      setSaving(false);
    }
  };

  const handleSocialCancel = () => {
    setEditingSocial(null);
    setSocialUrl("");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    const first = tracks?.[0]?.slug;
    navigate(first ? `/t/${first}` : "/t/test");
  };

  // Обработчик горизонтального скролла колесиком мыши
  useEffect(() => {
    const container = cardsGridRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      // Проверяем, что событие происходит на контейнере или его дочерних элементах
      if (!container.contains(e.target) && e.target !== container) return;
      
      e.preventDefault();
      e.stopPropagation();
      container.scrollLeft += e.deltaY;
    };

    // Используем capture phase для более надежного перехвата
    container.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      container.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [tracks.length]); // Переподключаем при изменении количества треков

  return (
    <section className="at-root">
      {/* "РЕЛИЗЫ" над каруселью */}
      <div className="at-releases-title">
        <button className="releases-button">
          РЕЛИЗЫ
        </button>
        {/* Кнопка "+" для добавления трека (только в режиме редактирования) */}
        {isOwner === true && editMode === true && onAddTrack && (
          <button
            type="button"
            onClick={onAddTrack}
            style={{
              width: "28px",
              height: "28px",
              padding: 0,
              borderRadius: "50%",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              background: "rgba(139, 92, 246, 0.2)",
              backdropFilter: "blur(10px)",
              color: "#fff",
              fontSize: "18px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(139, 92, 246, 0.4)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.5)";
              e.target.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(139, 92, 246, 0.2)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
              e.target.style.transform = "scale(1)";
            }}
            aria-label="Добавить трек"
            title="Добавить трек"
          >
            +
          </button>
        )}
      </div>

      {/* "ПРОВЕРЕННЫЙ АРТИСТ" под "РЕЛИЗЫ" - только для PREMIUM и PREMIUM+ */}
      {artist?.plan && artist.plan !== 'free' && (
        <div
          style={{
            fontSize: "clamp(10px, 2vw, 12px)",
            fontWeight: 300,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "rgba(255, 255, 255, 0.7)",
            opacity: 1,
            textAlign: "center",
            marginTop: "2px",
            marginBottom: "16px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <img 
            src={verifGold} 
            alt="" 
            style={{
              width: "14px",
              height: "14px",
              opacity: 0.85,
              filter: "drop-shadow(0 0 6px rgba(255, 210, 120, 0.35)) drop-shadow(0 2px 6px rgba(0,0,0,0.6))"
            }}
          />
          <span>ПРОВЕРЕННЫЙ АРТИСТ</span>
        </div>
      )}

      {/* Блок с треками - карточки с 3D эффектом */}
      <div className="at-grid-wrapper">
        {tracks.length === 0 ? (
          <div style={{ 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            minHeight: "200px",
            textAlign: "center", 
            padding: "40px 20px",
            opacity: 0.6,
            fontSize: "14px"
          }}>
            Пока нет треков
          </div>
        ) : (
          <div 
            ref={cardsGridRef}
            className="at-cards-grid"
          >
            {tracks.map((t, index) => {
              // Получаем обложку трека для лицевой стороны
              const coverUrl = t.cover_key ? getR2Url(t.cover_key) : (t.coverUrl || coverDefault);
              
              // Получаем превью YouTube для обратной стороны
              const getYoutubeThumbnail = (youtubeId) => {
                if (!youtubeId) return coverDefault;
                // Используем maxresdefault для лучшего качества
                return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
              };
              const youtubeThumbnail = getYoutubeThumbnail(t.youtubeId);
              
              return (
                <a 
                  key={t.slug} 
                  href={`/t/${t.slug}`}
                  className="card"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className="content">
                    <div 
                      className="back"
                      style={{
                        backgroundImage: `url(${youtubeThumbnail})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat"
                      }}
                      loading="lazy"
                    >
                    </div>
                    <div className="front">
                      <div className="img">
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          preload="auto"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center",
                            pointerEvents: "none"
                          }}
                          onLoadedData={(e) => {
                            e.target.play().catch(() => {});
                          }}
                        >
                          <source src={tqVideo} type="video/mp4" />
                        </video>
                      </div>
                      <div className="front-content">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#ffffff" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff3b5c" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            <span style={{ fontWeight: 600 }}>{t.likes_count || 0} Тюбитеек</span>
                          </div>
                        </div>
                        <div className="description">
                          <div className="title">
                            <p className="title">
                              <strong>{t.title}</strong>
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const trackUrl = `${window.location.origin}/t/${t.slug}`;
                                // Копируем ссылку в буфер обмена
                                if (navigator.clipboard && navigator.clipboard.writeText) {
                                  navigator.clipboard.writeText(trackUrl).catch(() => {});
                                } else {
                                  // Fallback для старых браузеров
                                  const input = document.createElement("input");
                                  input.value = trackUrl;
                                  document.body.appendChild(input);
                                  input.select();
                                  document.execCommand("copy");
                                  document.body.removeChild(input);
                                }
                              }}
                              style={{
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: 0.7,
                                transition: "opacity 0.2s",
                              }}
                              onMouseEnter={(e) => e.target.style.opacity = "1"}
                              onMouseLeave={(e) => e.target.style.opacity = "0.7"}
                              aria-label="Копировать ссылку"
                              title="Копировать ссылку на трек"
                            >
                              <img 
                                src={copyIcon} 
                                alt="" 
                                style={{ width: "12px", height: "12px", display: "block" }}
                              />
                            </button>
                          </div>
                          <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "space-between",
                            marginTop: "4px"
                          }}>
                            <p className="card-footer" style={{ margin: 0 }}>
                              {t.source || "Трек"}
                            </p>
                            <div style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "4px", 
                              fontSize: "10px", 
                              color: "#ffffff",
                              fontWeight: 700,
                              textShadow: "0 1px 2px rgba(0, 0, 0, 0.8)"
                            }}>
                              <span style={{ opacity: 0.9 }}>ПРОСМОТРОВ</span>
                              <span style={{ fontWeight: 800, color: "#ffffff" }}>{t.views_count || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* Иконки соцсетей под каруселью */}
      <div className="at-head">
        <div className="at-title" style={{ gap: "2px" }}>
          <div className="at-socials" aria-label="Соцсети артиста">
            {socials.map((s) => {
              const isEditing = editingSocial === s.key;
              const hasUrl = hasSocialUrl(s.key);

              if (isEditing && isOwner) {
                return (
                  <div
                    key={s.key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 8px",
                      background: "rgba(255, 255, 255, 0.95)",
                      borderRadius: 6,
                      minWidth: 200,
                    }}
                  >
                    <input
                      type="url"
                      value={socialUrl}
                      onChange={(e) => setSocialUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSocialSave(s);
                        } else if (e.key === "Escape") {
                          handleSocialCancel();
                        }
                      }}
                      placeholder={`Ссылка на ${s.label}`}
                      autoFocus
                      style={{
                        flex: 1,
                        padding: "4px 6px",
                        border: "1px solid rgba(0, 0, 0, 0.15)",
                        borderRadius: 4,
                        outline: "none",
                        fontSize: 12,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSocialSave(s)}
                      disabled={saving}
                      style={{
                        padding: "4px 8px",
                        border: "none",
                        background: saving ? "rgba(16, 185, 129, 0.6)" : "#10b981",
                        color: "#fff",
                        borderRadius: 4,
                        cursor: saving ? "default" : "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: saving ? "24px" : "auto",
                        minHeight: saving ? "24px" : "auto",
                      }}
                    >
                      {saving ? (
                        <PremiumLoader size="small" message="social" />
                      ) : "✓"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSocialCancel}
                      style={{
                        padding: "4px 8px",
                        border: "none",
                        background: "transparent",
                        color: "#666",
                        cursor: "pointer",
                        fontSize: 11,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                );
              }

              return (
                <button
                  key={s.key}
                  type="button"
                  className="at-social"
                  onClick={() => handleSocialClick(s)}
                  aria-label={s.label}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: isOwner ? "pointer" : "default",
                    padding: 0,
                    position: "relative",
                  }}
                  title={isOwner && editMode ? `Нажмите, чтобы ${hasUrl ? "изменить" : "добавить"} ссылку` : (hasUrl ? `Открыть ${s.label}` : s.label)}
                >
                  <img src={s.icon} alt="" aria-hidden="true" />
                </button>
              );
            })}
            {/* Кнопка выхода - только для владельца на странице /author */}
            {isOwner === true && editMode === true && (
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="at-social"
                aria-label="Выйти"
                title="Выйти из аккаунта"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  position: "relative",
                  opacity: 0.7,
                  transition: "opacity 0.2s",
                  marginLeft: "8px",
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = "0.7";
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ display: "block" }}
                >
                  <path
                    d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9"
                    stroke="rgba(255, 255, 255, 0.9)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Блок выбора фона страницы артиста (справа) - рендерим всегда для применения фона, панель показываем только в режиме редактирования */}
      <ArtistPageBackground
        key={`bg-${artist?.id}`}
        artist={artist}
        isOwner={isOwner}
        editMode={editMode}
        showPanel={showBackgroundPanels}
        onUpdate={onUpdate}
      />

      {/* Блок выбора фона страницы артиста (слева, из backgrounds.css) - только в режиме редактирования */}
      {isOwner && editMode && (
        <ArtistPageBackgroundLeft
          key={`bg-left-${artist?.id}-${editMode}`}
          artist={artist}
          isOwner={isOwner}
          editMode={editMode}
          showPanel={showBackgroundPanels}
          onUpdate={onUpdate}
        />
      )}

    </section>
  );
}
