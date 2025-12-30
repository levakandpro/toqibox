import React, { useState } from "react";
import { supabase } from "../../features/auth/supabaseClient.js";

export default function AddTrackSection({ artist, isOwner = false, onTrackAdded }) {
  const [showForm, setShowForm] = useState(false);
  const [newTrack, setNewTrack] = useState({ link: "", title: "" });
  const [saving, setSaving] = useState(false);

  if (!isOwner) return null;

  const handleAddTrack = async () => {
    if (!artist?.id || !newTrack.title || !newTrack.link) return;

    // Проверяем, что ссылка на YouTube
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(newTrack.link.trim())) {
      alert("Пожалуйста, введите ссылку на YouTube видео");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("tracks")
        .insert({
          artist_id: artist.id,
          title: newTrack.title.trim(),
          source: "youtube", // Всегда YouTube
          link: newTrack.link.trim(),
          slug: `${artist.slug}-${Date.now()}`, // временный slug
        });

      if (error) throw error;

      // Очищаем форму и закрываем
      setNewTrack({ link: "", title: "" });
      setShowForm(false);
      
      // Обновляем список треков
      if (onTrackAdded) {
        onTrackAdded();
      }
    } catch (e) {
      console.error("Error adding track:", e);
      alert("Ошибка при добавлении трека: " + (e.message || "Неизвестная ошибка"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      padding: "16px 20px",
      background: "rgba(255, 255, 255, 0.02)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    }}>
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          style={{
            padding: "12px 20px",
            borderRadius: 8,
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(255, 255, 255, 0.05)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 0.2s",
            width: "100%",
            textAlign: "center",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.05)";
          }}
        >
          + Добавить трек
        </button>
      ) : (
        <div style={{
          display: "grid",
          gap: 12,
          padding: 16,
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: 12,
          border: "1px solid rgba(0, 0, 0, 0.1)",
        }}>
          <input
            type="text"
            placeholder="Название трека"
            value={newTrack.title}
            onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(0, 0, 0, 0.15)",
              outline: "none",
              fontSize: 14,
              width: "100%",
            }}
          />
          <input
            type="url"
            placeholder="Ссылка на YouTube видео"
            value={newTrack.link}
            onChange={(e) => setNewTrack({ ...newTrack, link: e.target.value })}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(0, 0, 0, 0.15)",
              outline: "none",
              fontSize: 14,
              width: "100%",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={handleAddTrack}
              disabled={saving || !newTrack.title || !newTrack.link}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: "#0b0b0b",
                color: "#fff",
                fontWeight: 700,
                cursor: saving ? "default" : "pointer",
                opacity: (saving || !newTrack.title || !newTrack.link) ? 0.5 : 1,
                flex: 1,
              }}
            >
              {saving ? "Добавляю..." : "Добавить"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewTrack({ link: "", title: "" });
              }}
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid rgba(0, 0, 0, 0.15)",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

