import React, { useState, useEffect } from "react";
import { SHADERTOY_BACKGROUNDS } from "../../utils/shadertoyBackgrounds.js";
import PremiumLoader from "../../ui/PremiumLoader.jsx";
import ShaderToyPreview from "./ShaderToyPreview.jsx";
import VantaPreview from "./VantaPreview.jsx";

export default function BackgroundSelector({ track = null, isOwner = false, onApply, selectedBackgroundId, onSelect, title = "Фон страницы трека" }) {
  // Получаем дефолтный фон (первый из списка)
  const defaultBackgroundId = SHADERTOY_BACKGROUNDS[0]?.id || null;
  
  const [applying, setApplying] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(
    selectedBackgroundId || (track?.shadertoy_background_id ?? null) || defaultBackgroundId
  );
  
  // Обновляем выбранный фон при изменении трека или пропса
  useEffect(() => {
    const newBackground = selectedBackgroundId || (track?.shadertoy_background_id ?? null) || defaultBackgroundId;
    setSelectedBackground(newBackground);
  }, [track?.shadertoy_background_id, selectedBackgroundId, defaultBackgroundId]);

  const handleApply = async (backgroundId) => {
    if (applying) return;
    
    // Если есть onSelect (для TrackEditForm), просто вызываем его
    if (onSelect) {
      onSelect(backgroundId);
      setSelectedBackground(backgroundId);
      return;
    }
    
    // Иначе используем onApply (для старого API)
    if (!onApply || !track) {
      return;
    }
    
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
    <div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
        gap: "8px",
        maxHeight: "200px",
        overflowY: "auto",
      }}>
        {/* Кнопка "Нет" для сброса фона */}
        <button
          type="button"
          onClick={() => handleApply(null)}
          style={{
            aspectRatio: "1",
            padding: "4px",
            background: selectedBackground === null
              ? "linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(124, 58, 237, 0.4) 100%)"
              : "rgba(255, 255, 255, 0.05)",
            border: selectedBackground === null
              ? "2px solid rgba(139, 92, 246, 0.9)"
              : "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "8px",
            boxShadow: selectedBackground === null
              ? "0 0 0 2px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
              : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            if (selectedBackground !== null) {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
              e.target.style.transform = "scale(1.05)";
              e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (selectedBackground !== null) {
              e.target.style.background = "rgba(255, 255, 255, 0.05)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
            }
          }}
          title="Без фона"
        >
          <div style={{
            fontSize: "10px",
            color: selectedBackground === null ? "#fff" : "rgba(255, 255, 255, 0.6)",
            fontWeight: 600,
          }}>
            Нет
          </div>
          {selectedBackground === null && (
            <div style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              background: "rgba(139, 92, 246, 1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "9px",
              color: "#fff",
              fontWeight: "bold",
            }}>
              ✓
            </div>
          )}
        </button>

        {/* Карточки фонов */}
        {SHADERTOY_BACKGROUNDS.map((bg) => {
          const isSelected = selectedBackground === bg.id;
          const isApplying = applying && selectedBackground === bg.id;

          return (
            <div
              key={bg.id}
              style={{
                position: "relative",
                aspectRatio: "1",
                borderRadius: "8px",
                overflow: "hidden",
                background: "rgba(0, 0, 0, 0.4)",
                border: isSelected
                  ? "2px solid rgba(139, 92, 246, 0.9)"
                  : "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: isSelected
                  ? "0 0 0 2px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                  : "none",
                cursor: "pointer",
                transition: "all 0.2s",
                opacity: isApplying ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.4)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }
              }}
              onClick={() => handleApply(bg.id)}
            >
              {/* Превью фона (ShaderToy или Vanta) */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {bg.type === "vanta" ? (
                  <VantaPreview
                    effectType={bg.effectType || "dots"}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                    }}
                  />
                ) : (
                  <ShaderToyPreview 
                    backgroundId={bg.id}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                    }}
                  />
                )}
              </div>

              {/* Overlay с названием и статусом/кнопкой */}
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, transparent 100%)",
                padding: "6px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}>
                <div style={{
                  fontSize: "9px",
                  fontWeight: 600,
                  color: "#fff",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}>
                  {bg.name}
                </div>

                {isSelected ? (
                  <div style={{
                    fontSize: "8px",
                    color: "rgba(139, 92, 246, 1)",
                    fontWeight: 600,
                  }}>
                    Активно
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(bg.id);
                    }}
                    disabled={isApplying}
                    style={{
                      padding: "3px 6px",
                      fontSize: "8px",
                      fontWeight: 600,
                      background: "rgba(139, 92, 246, 0.8)",
                      border: "none",
                      borderRadius: "4px",
                      color: "#fff",
                      cursor: isApplying ? "not-allowed" : "pointer",
                      opacity: isApplying ? 0.5 : 1,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isApplying ? "..." : "Применить"}
                  </button>
                )}
              </div>

              {/* Индикатор выбора */}
              {isSelected && (
                <div style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: "rgba(139, 92, 246, 1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  color: "#fff",
                  fontWeight: "bold",
                }}>
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

