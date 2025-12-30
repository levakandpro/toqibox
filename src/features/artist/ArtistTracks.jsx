import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import TrackCard from "../track/TrackCard.jsx";
import { getMockTracksByArtistSlug } from "../track/track.mock.js";

import shareIcon from "../../assets/share.svg";
import { supabase } from "../../features/auth/supabaseClient.js";

import youtubeIcon from "../../assets/soc/youtube.svg";
import tiktokIcon from "../../assets/soc/tiktok.svg";
import instagramIcon from "../../assets/soc/instagram.svg";

export default function ArtistTracks({
  artist,
  isOwner = false,
  onShare,
  tracks: tracksProp,
  onUpdate,
}) {
  const navigate = useNavigate();
  const [editingSocial, setEditingSocial] = useState(null); // 'youtube', 'tiktok', 'instagram' или null
  const [socialUrl, setSocialUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const tracks = useMemo(() => {
    return Array.isArray(tracksProp)
      ? tracksProp
      : getMockTracksByArtistSlug(artist?.slug);
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
          Релизы

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
                        background: "#10b981",
                        color: "#fff",
                        borderRadius: 4,
                        cursor: saving ? "default" : "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      ✓
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
                  {hasUrl && isOwner && (
                    <div
                      style={{
                        position: "absolute",
                        top: -2,
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

      <div className="at-grid">
        {tracks.map((t) => (
          <TrackCard key={t.slug} track={t} />
        ))}
      </div>
    </section>
  );
}
