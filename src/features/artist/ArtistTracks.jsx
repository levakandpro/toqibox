import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TrackCard from "../track/TrackCard.jsx";
import { getMockTracksByArtistSlug } from "../track/track.mock.js";
import BackgroundSelector from "../track/BackgroundSelector.jsx";

import shareIcon from "../../assets/share.svg";
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
}) {
  const navigate = useNavigate();
  const [editingSocial, setEditingSocial] = useState(null); // 'youtube', 'tiktok', 'instagram' или null
  const [socialUrl, setSocialUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [localSelectedTrack, setLocalSelectedTrack] = useState(selectedTrack);
  
  // Обновляем локальный выбранный трек при изменении пропса
  useEffect(() => {
    setLocalSelectedTrack(selectedTrack);
  }, [selectedTrack]);

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
    if (!isOwner) {
      // Если не владелец - просто открываем ссылку
      window.open(social.href, "_blank");
      return;
    }

    // Если владелец - открываем редактирование
    setEditingSocial(social.key);
    setSocialUrl(getSocialUrl(social.key));
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


  return (
    <section className="at-root">
      <div className="at-head">
        <div className="at-title">
          <span>Релизы</span>

          {/* Переключатель режимов (только на мобильных, только для владельца) */}
          {isOwner && onToggleEditMode && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginLeft: "12px",
            }}>
              <span style={{
                fontSize: "10px",
                color: "rgba(255, 255, 255, 0.6)",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}>
                {editMode ? "РЕД" : "ПРОСМ"}
              </span>
              <button
                type="button"
                onClick={onToggleEditMode}
                style={{
                  width: "32px",
                  height: "18px",
                  borderRadius: "9px",
                  background: editMode ? "#10b981" : "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.3s ease",
                  outline: "none",
                  padding: 0,
                }}
                aria-label={editMode ? "Режим редактирования" : "Режим просмотра"}
              >
                <div style={{
                  position: "absolute",
                  top: "2px",
                  left: editMode ? "16px" : "2px",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "all 0.3s ease",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
                }} />
              </button>
            </div>
          )}

          {/* Стильная кнопка "Добавить трек" (только в режиме редактирования) */}
          {isOwner && editMode && onAddTrack && (
            <button
              type="button"
              onClick={onAddTrack}
              style={{
                marginLeft: "12px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                background: "rgba(139, 92, 246, 0.2)",
                backdropFilter: "blur(10px)",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.5px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(139, 92, 246, 0.4)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(139, 92, 246, 0.2)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
              aria-label="Добавить трек"
              title="Добавить трек"
            >
              <span>+</span>
              <span>Добавить трек</span>
            </button>
          )}

          <button
            type="button"
            className="at-share"
            onClick={onShare}
            aria-label="Поделиться"
          >
            <img src={shareIcon} alt="" aria-hidden="true" />
          </button>

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
                    filter: hasUrl && isOwner ? "brightness(1.4) saturate(1.8) hue-rotate(90deg)" : "none",
                    transition: "filter 0.2s",
                    boxShadow: hasUrl && isOwner ? "0 0 8px rgba(16, 185, 129, 0.4)" : "none",
                  }}
                  title={isOwner ? `Нажмите, чтобы ${hasUrl ? "изменить" : "добавить"} ссылку` : s.label}
                >
                  <img src={s.icon} alt="" aria-hidden="true" />
                  {isOwner && (
                    <div
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -4,
                        fontSize: 12,
                        color: "#ffffff",
                        textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                        zIndex: 10,
                        pointerEvents: "none",
                      }}
                      title="Редактировать"
                    >
                      ✏️
                    </div>
                  )}
                  {hasUrl && isOwner && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: -2,
                        right: -2,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#10b981",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            className="at-back"
            onClick={handleBack}
            aria-label="Назад"
          >
            ← назад
          </button>
        </div>
      </div>

      {/* Блок с треками - ограничен 3 рядами, остальные с прокруткой */}
      <div className="at-grid-wrapper">
        <div className="at-grid">
          {tracks.length === 0 ? (
            <div style={{ 
              gridColumn: "1 / -1", 
              textAlign: "center", 
              padding: "40px 20px",
              opacity: 0.6,
              fontSize: "14px"
            }}>
              Пока нет треков
            </div>
          ) : (
            tracks.map((t) => (
              <div
                key={t.slug}
                onClick={() => {
                  if (isOwner && editMode) {
                    setLocalSelectedTrack(t);
                    if (onTrackClick) {
                      onTrackClick(t);
                    }
                  }
                }}
                style={{
                  cursor: isOwner && editMode ? "pointer" : "default",
                  position: "relative",
                }}
              >
                <TrackCard 
                  track={t} 
                  isOwner={isOwner && editMode}
                  onEdit={handleEditTrack}
                  onDelete={handleDeleteTrack}
                />
                {isOwner && editMode && (localSelectedTrack?.id === t.id || selectedTrack?.id === t.id) && (
                  <div style={{
                    position: "absolute",
                    top: "8px",
                    left: "8px",
                    background: "rgba(16, 185, 129, 0.9)",
                    color: "#fff",
                    fontSize: "9px",
                    fontWeight: 700,
                    padding: "4px 8px",
                    borderRadius: "4px",
                    zIndex: 100,
                    pointerEvents: "none",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.4)",
                  }}>
                    Выбран для настройки
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Разделитель */}
      <div className="at-divider" />

      {/* Секция выбора фона главной страницы трека */}
      {isOwner && editMode && (localSelectedTrack || selectedTrack) && (
        <div className="at-background-selector">
          <BackgroundSelector
            track={localSelectedTrack || selectedTrack}
            isOwner={isOwner && editMode}
            onApply={onApplyBackground}
          />
        </div>
      )}
      
      {isOwner && editMode && !localSelectedTrack && !selectedTrack && (
        <div className="at-background-selector">
          <div style={{
            padding: "20px",
            textAlign: "center",
            opacity: 0.7,
            fontSize: "14px",
          }}>
            Выберите трек для настройки фона
          </div>
        </div>
      )}
    </section>
  );
}
