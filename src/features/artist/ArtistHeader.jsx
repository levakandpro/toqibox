import React, { useState } from "react";
import { supabase } from "../../features/auth/supabaseClient.js";

import artistCoverFallback from "../../assets/covers/artist-cover-placeholder.png";
import verifGold from "../../assets/verifgold.svg";

export default function ArtistHeader({ artist, isOwner = false, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(artist?.display_name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  console.log("🎨 ArtistHeader render:", { 
    hasArtist: !!artist, 
    artistId: artist?.id, 
    isOwner, 
    isEditing, 
    saved, 
    saving,
    displayName 
  });

  // Обновляем displayName когда artist меняется (но не сбрасываем saved если мы только что сохранили)
  React.useEffect(() => {
    if (!saved) {
      setDisplayName(artist?.display_name || "");
    }
  }, [artist?.display_name, saved]);

  const coverUrl = artistCoverFallback;
  const isPremium = !!artist?.isPremium;

  const handleSave = async () => {
    if (!artist?.id || !isOwner || saving) {
      console.log("❌ handleSave blocked:", { hasArtist: !!artist?.id, isOwner, saving });
      return;
    }

    console.log("💾 Starting save...");
    setSaving(true);
    setSaved(false);
    
    try {
      const { error, data } = await supabase
        .from("artists")
        .update({ display_name: displayName.trim() })
        .eq("id", artist.id)
        .select()
        .single();

      if (error) throw error;

      console.log("✅ Save successful, data:", data);

      // Показываем галочку СРАЗУ, ДО обновления данных
      console.log("✅ Setting saved=true");
      setSaved(true);

      // Обновляем локальное состояние с новыми данными
      if (data) {
        setDisplayName(data.display_name || "");
      }
      
      // Закрываем поле редактирования через 2 секунды
      setTimeout(() => {
        console.log("⏰ Closing edit field");
        setIsEditing(false);
        // Обновляем данные в родительском компоненте ПОСЛЕ показа галочки
        if (onUpdate) {
          onUpdate();
        }
        // Скрываем галочку через еще 0.5 секунды после закрытия поля
        setTimeout(() => {
          console.log("⏰ Hiding checkmark");
          setSaved(false);
        }, 500);
      }, 2000);
    } catch (e) {
      console.error("❌ Error saving display_name:", e);
      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setDisplayName(artist?.display_name || "");
      setIsEditing(false);
    }
  };

  return (
    <section className="ah-root">
      <div
        className="ah-cover"
        style={{ backgroundImage: `url(${coverUrl})` }}
        aria-hidden="true"
      />

      <div className="ah-overlay" aria-hidden="true" />

      <div className="ah-content">
        <div className="ah-name" style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
          {isEditing && isOwner ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={saving}
                autoFocus
                style={{
                  background: "rgba(255,255,255,0.95)",
                  border: saved ? "2px solid #10b981" : "2px solid rgba(0,0,0,0.2)",
                  borderRadius: 8,
                  padding: "4px 8px",
                  fontSize: "inherit",
                  fontFamily: "inherit",
                  fontWeight: "inherit",
                  color: "#000",
                  outline: "none",
                  minWidth: 200,
                  transition: "border-color 0.3s ease",
                }}
              />
              {saved ? (
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    display: "block",
                    flexShrink: 0,
                    animation: "fadeIn 0.3s ease",
                    zIndex: 100,
                    filter: "drop-shadow(0 2px 6px rgba(16, 185, 129, 0.5))",
                  }}
                >
                  <circle cx="12" cy="12" r="11" fill="#10b981" opacity="0.5" />
                  <path
                    d="M7 12L11 16L17 9"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              ) : null}
              {saving && !saved && (
                <div style={{ fontSize: 12, opacity: 0.7 }}>Сохранение...</div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {artist?.display_name || artist?.name || "ARTIST"}
              {saved && (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    display: "block",
                    flexShrink: 0,
                    animation: "fadeIn 0.3s ease",
                  }}
                >
                  <circle cx="12" cy="12" r="11" fill="#10b981" opacity="0.2" />
                  <path
                    d="M7 12L11 16L17 9"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              )}
              {isOwner && !saved && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setSaved(false);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                    opacity: 0.7,
                  }}
                  aria-label="Редактировать имя"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ display: "block", color: "#fff" }}
                  >
                    <path
                      d="M11.333 2.00001C11.5084 1.82445 11.7163 1.68506 11.9447 1.58933C12.1731 1.4936 12.4173 1.44336 12.664 1.44336C12.9107 1.44336 13.1549 1.4936 13.3833 1.58933C13.6117 1.68506 13.8196 1.82445 13.995 2.00001C14.1706 2.17545 14.31 2.38331 14.4057 2.61172C14.5014 2.84013 14.5517 3.08431 14.5517 3.33101C14.5517 3.57771 14.5014 3.82189 14.4057 4.0503C14.31 4.27871 14.1706 4.48657 13.995 4.66201L5.162 13.495L2 14.333L2.838 11.171L11.671 2.33801L11.333 2.00001Z"
                      stroke="#fff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
          {isPremium && (
            <img
              src={verifGold}
              alt=""
              className="ah-verifGold"
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </section>
  );
}
