import React, { useState, useMemo } from "react";
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
}) {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTrack, setNewTrack] = useState({ source: "", link: "", title: "" });
  const [saving, setSaving] = useState(false);

  const tracks = useMemo(() => {
    return Array.isArray(tracksProp)
      ? tracksProp
      : getMockTracksByArtistSlug(artist?.slug);
  }, [tracksProp, artist?.slug]);

  const socials = [
    {
      key: "youtube",
      href:
        (artist?.soc_youtube || artist?.youtubeUrl || "").trim().length > 0
          ? (artist?.soc_youtube || artist?.youtubeUrl)
          : "https://youtube.com",
      icon: youtubeIcon,
      label: "YouTube",
    },
    {
      key: "tiktok",
      href:
        (artist?.soc_tiktok || artist?.tiktokUrl || "").trim().length > 0
          ? (artist?.soc_tiktok || artist?.tiktokUrl)
          : "https://tiktok.com",
      icon: tiktokIcon,
      label: "TikTok",
    },
    {
      key: "instagram",
      href:
        (artist?.soc_instagram || artist?.instagramUrl || "").trim().length > 0
          ? (artist?.soc_instagram || artist?.instagramUrl)
          : "https://instagram.com",
      icon: instagramIcon,
      label: "Instagram",
    },
  ];

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    const first = tracks?.[0]?.slug;
    navigate(first ? `/t/${first}` : "/t/test");
  };

  const handleAddTrack = async () => {
    if (!artist?.id || !isOwner) return;

    setSaving(true);
    try {
      // TODO: реализовать создание трека в БД
      // Пока просто закрываем форму
      setShowAddForm(false);
      setNewTrack({ source: "", link: "", title: "" });
    } catch (e) {
      console.error("Error adding track:", e);
    } finally {
      setSaving(false);
    }
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
            {socials.map((s) => (
              <a
                key={s.key}
                className="at-social"
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
              >
                <img src={s.icon} alt="" aria-hidden="true" />
              </a>
            ))}
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

          {isOwner && (
            <button
              type="button"
              className="at-back"
              onClick={() => setShowAddForm(!showAddForm)}
              aria-label="Добавить трек"
            >
              + добавить трек
            </button>
          )}
        </div>
      </div>

      {isOwner && showAddForm && (
        <div style={{
          padding: 16,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 12,
          marginBottom: 16,
          border: "1px solid rgba(0,0,0,0.1)",
        }}>
          <div style={{ display: "grid", gap: 12 }}>
            <input
              type="text"
              placeholder="Название трека"
              value={newTrack.title}
              onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.15)",
                outline: "none",
                fontSize: 14,
              }}
            />
            <select
              value={newTrack.source}
              onChange={(e) => setNewTrack({ ...newTrack, source: e.target.value })}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.15)",
                outline: "none",
                fontSize: 14,
              }}
            >
              <option value="">Выберите источник</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="instagram">Instagram</option>
            </select>
            <input
              type="url"
              placeholder="Ссылка на трек"
              value={newTrack.link}
              onChange={(e) => setNewTrack({ ...newTrack, link: e.target.value })}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.15)",
                outline: "none",
                fontSize: 14,
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={handleAddTrack}
                disabled={saving || !newTrack.title || !newTrack.source || !newTrack.link}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#0b0b0b",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: saving ? "default" : "pointer",
                  opacity: (saving || !newTrack.title || !newTrack.source || !newTrack.link) ? 0.5 : 1,
                }}
              >
                {saving ? "Добавляю..." : "Добавить"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewTrack({ source: "", link: "", title: "" });
                }}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,0,0,0.15)",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="at-grid">
        {tracks.map((t) => (
          <TrackCard key={t.slug} track={t} />
        ))}
      </div>
    </section>
  );
}
