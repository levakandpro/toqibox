import React, { useState } from "react";
import { supabase } from "../../features/auth/supabaseClient.js";

import artistCoverFallback from "../../assets/covers/artist-cover-placeholder.png";
import verifGold from "../../assets/verifgold.svg";

export default function ArtistHeader({ artist, isOwner = false, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(artist?.display_name || "");
  const [saving, setSaving] = useState(false);

  // Обновляем displayName когда artist меняется
  React.useEffect(() => {
    setDisplayName(artist?.display_name || "");
  }, [artist?.display_name]);

  const coverUrl = artistCoverFallback;
  const isPremium = !!artist?.isPremium;

  const handleSave = async () => {
    if (!artist?.id || !isOwner) return;

    setSaving(true);
    try {
      const { error, data } = await supabase
        .from("artists")
        .update({ display_name: displayName.trim() })
        .eq("id", artist.id)
        .select()
        .single();

      if (error) throw error;

      // Обновляем локальное состояние с новыми данными
      if (data) {
        setDisplayName(data.display_name || "");
        // Вызываем callback для обновления данных в родительском компоненте
        if (onUpdate) {
          onUpdate();
        }
      }

      setIsEditing(false);
    } catch (e) {
      console.error("Error saving display_name:", e);
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
        <div className="ah-name" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isEditing && isOwner ? (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              disabled={saving}
              autoFocus
              style={{
                background: "rgba(255,255,255,0.95)",
                border: "2px solid rgba(0,0,0,0.2)",
                borderRadius: 8,
                padding: "4px 8px",
                fontSize: "inherit",
                fontFamily: "inherit",
                fontWeight: "inherit",
                color: "#000",
                outline: "none",
                minWidth: 200,
              }}
            />
          ) : (
            <>
              {artist?.display_name || artist?.name || "ARTIST"}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
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
            </>
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
