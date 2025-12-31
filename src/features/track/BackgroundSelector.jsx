import React, { useState } from "react";
import { SHADERTOY_BACKGROUNDS, getShaderToyEmbedUrl } from "../../utils/shadertoyBackgrounds.js";
import PremiumLoader from "../../ui/PremiumLoader.jsx";

export default function BackgroundSelector({ track, isOwner = false, onApply }) {
  const [applying, setApplying] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(track?.shadertoy_background_id || null);
  
  // Обновляем выбранный фон при изменении трека
  useEffect(() => {
    setSelectedBackground(track?.shadertoy_background_id || null);
  }, [track?.shadertoy_background_id]);

  const handleApply = async (backgroundId) => {
    if (!onApply || applying) return;
    
    setApplying(true);
    try {
      await onApply(backgroundId);
      setSelectedBackground(backgroundId);
    } catch (error) {
      console.error("Error applying background:", error);
      alert("Ошибка при применении фона");
    } finally {
      setApplying(false);
    }
  };

  if (!isOwner) return null;

  return (
    <div style={{
      padding: "20px 0",
    }}>
      <div style={{
        fontSize: "14px",
        fontWeight: 600,
        color: "rgba(255, 255, 255, 0.9)",
        marginBottom: "16px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}>
        Выбор фона главной страницы трека
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
        gap: "12px",
      }}>
        {SHADERTOY_BACKGROUNDS.map((bg) => {
          const isActive = selectedBackground === bg.id;
          const isApplying = applying && selectedBackground === bg.id;

          return (
            <div
              key={bg.id}
              style={{
                position: "relative",
                aspectRatio: "16 / 9",
                borderRadius: "8px",
                overflow: "hidden",
                background: "rgba(0, 0, 0, 0.4)",
                border: isActive 
                  ? "2px solid #10b981" 
                  : "1px solid rgba(255, 255, 255, 0.2)",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onClick={() => !isApplying && handleApply(bg.id)}
            >
              {/* Превью ShaderToy */}
              <iframe
                src={getShaderToyEmbedUrl(bg.shaderId)}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  pointerEvents: "none",
                  opacity: isApplying ? 0.5 : 1,
                }}
                title={bg.name}
              />

              {/* Overlay с названием и кнопкой */}
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 100%)",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}>
                <div style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: "#fff",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}>
                  {bg.name}
                </div>

                {isActive && (
                  <div style={{
                    fontSize: "9px",
                    color: "#10b981",
                    fontWeight: 600,
                  }}>
                    Активно
                  </div>
                )}

                {!isActive && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(bg.id);
                    }}
                    disabled={isApplying}
                    style={{
                      padding: "4px 8px",
                      fontSize: "10px",
                      fontWeight: 600,
                      background: "rgba(139, 92, 246, 0.8)",
                      border: "none",
                      borderRadius: "4px",
                      color: "#fff",
                      cursor: isApplying ? "default" : "pointer",
                      opacity: isApplying ? 0.6 : 1,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isApplying ? (
                      <PremiumLoader size="tiny" message="saving" />
                    ) : (
                      "Применить"
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

