import React, { useState, useEffect } from "react";
import { supabase } from "../../features/auth/supabaseClient.js";
import { SHADERTOY_BACKGROUNDS } from "../../utils/shadertoyBackgrounds.js";
import { DEFAULT_PLAY_ICON } from "../../utils/playIcons.js";

export default function AddTrackSection({ artist, isOwner = false, onTrackAdded, onClose }) {
  const [showForm, setShowForm] = useState(false);
  const [newTrack, setNewTrack] = useState({ link: "", title: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdTrackSlug, setCreatedTrackSlug] = useState(null);

  if (!isOwner) return null;

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

  const handleAddTrack = async () => {
    if (!artist?.id || !newTrack.title || !newTrack.link) return;

    // Извлекаем YouTube ID из ссылки
    const youtubeId = extractYoutubeId(newTrack.link.trim());
    if (!youtubeId) {
      alert("Пожалуйста, введите корректную ссылку на YouTube видео");
      return;
    }

    setSaving(true);
    try {
      // Генерируем slug из названия трека
      const slugBase = newTrack.title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const slug = `${slugBase}-${Date.now()}`;

      // Получаем первый фон по умолчанию
      const defaultBackgroundId = SHADERTOY_BACKGROUNDS[0]?.id || null;
      
      // Собираем данные для вставки с дефолтными значениями
      const insertData = {
        artist_id: artist.id,
        title: newTrack.title.trim(),
        source: "youtube",
        link: newTrack.link.trim(),
        slug: slug,
        shadertoy_background_id: defaultBackgroundId, // Первый фон по умолчанию
        play_icon: DEFAULT_PLAY_ICON, // Первая иконка по умолчанию
      };

      console.log("📤 Inserting track data:", insertData);

      const { error, data } = await supabase
        .from("tracks")
        .insert(insertData);

      if (error) {
        console.error("❌ Supabase insert error:", error);
        console.error("❌ Error details:", JSON.stringify(error, null, 2));
        console.error("❌ Error code:", error.code);
        console.error("❌ Error message:", error.message);
        throw error;
      }

      console.log("✅ Insert successful, data:", data);

      console.log("✅ Track added successfully");

      // Сохраняем slug созданного трека для экрана успеха
      setCreatedTrackSlug(slug);
      setSuccess(true);
      
      // Обновляем список треков
      if (onTrackAdded) {
        console.log("🔄 Calling onTrackAdded...");
        await onTrackAdded();
      } else {
        console.warn("⚠️ onTrackAdded callback not provided!");
      }
    } catch (e) {
      console.error("Error adding track:", e);
      alert("Ошибка при добавлении трека: " + (e.message || "Неизвестная ошибка"));
    } finally {
      setSaving(false);
    }
  };

  // Экран "Готово"
  if (success) {
    const trackUrl = `${window.location.origin}/t/${createdTrackSlug}`;
    
    return (
      <div style={{
        padding: "40px 20px",
        background: "rgba(255, 255, 255, 0.02)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: "clamp(24px, 5vw, 32px)",
          fontWeight: 700,
          color: "#fff",
          marginBottom: "12px",
          lineHeight: 1.3,
        }}>
          Теперь ваш трек под своей Тюбетейкой
        </div>
        
        <div style={{
          fontSize: "14px",
          color: "rgba(255, 255, 255, 0.6)",
          marginBottom: "24px",
        }}>
          Забирай ссылку и размещай в сторис и био
        </div>

        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
        }}>
          <input
            type="text"
            readOnly
            value={trackUrl}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#fff",
              fontSize: "14px",
              flex: "1",
              minWidth: "200px",
              maxWidth: "400px",
            }}
            onClick={(e) => e.target.select()}
          />
          <button
            type="button"
            onClick={async () => {
              try {
                // Пробуем использовать Clipboard API
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  await navigator.clipboard.writeText(trackUrl);
                  alert("Ссылка скопирована!");
                } else {
                  // Fallback для старых браузеров
                  const input = document.createElement("input");
                  input.value = trackUrl;
                  input.style.position = "fixed";
                  input.style.opacity = "0";
                  document.body.appendChild(input);
                  input.select();
                  input.setSelectionRange(0, 99999); // Для мобильных устройств
                  try {
                    document.execCommand("copy");
                    alert("Ссылка скопирована!");
                  } catch (err) {
                    alert("Не удалось скопировать. Ссылка: " + trackUrl);
                  }
                  document.body.removeChild(input);
                }
              } catch (e) {
                console.error("Failed to copy:", e);
                // Показываем ссылку, если копирование не удалось
                alert("Не удалось скопировать. Ссылка: " + trackUrl);
              }
            }}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.1)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
            }}
          >
            Копировать ссылку
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setShowForm(false);
            setNewTrack({ link: "", title: "" });
            setCreatedTrackSlug(null);
          }}
          style={{
            marginTop: "24px",
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "transparent",
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "#fff";
            e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "rgba(255, 255, 255, 0.7)";
            e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
          }}
        >
          Добавить ещё трек
        </button>
      </div>
    );
  }

  // Автоматически показываем форму при монтировании
  React.useEffect(() => {
    if (!showForm && !success) {
      setShowForm(true);
    }
  }, []);

  return (
    <div style={{
      padding: "12px 16px",
      background: "rgba(255, 255, 255, 0.02)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    }}>
      {showForm && (
        <div style={{
          display: "grid",
          gap: 12,
          padding: "16px",
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(20px)",
          borderRadius: 12,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          maxWidth: "400px",
          margin: "0 auto",
        }}>
          <input
            type="text"
            placeholder="Название трека"
            value={newTrack.title}
            onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
            disabled={saving}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.05)",
              outline: "none",
              fontSize: 14,
              color: "#fff",
              width: "100%",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(255, 255, 255, 0.4)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
          />
          <input
            type="url"
            placeholder="Ссылка на YouTube видео"
            value={newTrack.link}
            onChange={(e) => setNewTrack({ ...newTrack, link: e.target.value })}
            disabled={saving}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.05)",
              outline: "none",
              fontSize: 14,
              color: "#fff",
              width: "100%",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(255, 255, 255, 0.4)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
          />
          
          <button
            type="button"
            onClick={handleAddTrack}
            disabled={saving || !newTrack.title || !newTrack.link}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: saving ? "rgba(255, 255, 255, 0.1)" : "#fff",
              color: saving ? "rgba(255, 255, 255, 0.7)" : "#000",
              fontWeight: 600,
              fontSize: 14,
              cursor: (saving || !newTrack.title || !newTrack.link) ? "default" : "pointer",
              opacity: (saving || !newTrack.title || !newTrack.link) ? 0.5 : 1,
              transition: "all 0.2s",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              if (!saving && newTrack.title && newTrack.link) {
                e.target.style.transform = "scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
            }}
          >
            ОПУБЛИКОВАТЬ
          </button>

          {saving && (
            <div style={{
              textAlign: "center",
              fontSize: 12,
              color: "rgba(255, 255, 255, 0.6)",
              marginTop: "-4px",
            }}>
              Создаём Тюбетейку…
            </div>
          )}

          {!saving && (
            <div style={{
              textAlign: "center",
              fontSize: 11,
              color: "rgba(255, 255, 255, 0.5)",
              marginTop: "-4px",
            }}>
              После публикации для трека будет создана Тюбетейка
            </div>
          )}

          {!saving && (
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewTrack({ link: "", title: "" });
                if (onClose) onClose();
              }}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "transparent",
                color: "rgba(255, 255, 255, 0.7)",
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.color = "#fff";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "rgba(255, 255, 255, 0.7)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
            >
              Отмена
            </button>
          )}
        </div>
      )}
    </div>
  );
}

