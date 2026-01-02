import React, { useState, useEffect } from "react";
import { PREMIUM_BACKGROUNDS } from "../../utils/premiumBackgrounds.js";
import VantaPreview from "./VantaPreview.jsx";
import ShaderToyPreview from "./ShaderToyPreview.jsx";

export default function PremiumBackgroundSelector({ track = null, isOwner = false, selectedBackgroundId, onSelect }) {
  const [selectedBackground, setSelectedBackground] = useState(selectedBackgroundId || null);
  
  // Обновляем выбранный фон при изменении пропса
  useEffect(() => {
    setSelectedBackground(selectedBackgroundId || null);
  }, [selectedBackgroundId]);

  const handleApply = (backgroundId) => {
    if (onSelect) {
      onSelect(backgroundId);
      setSelectedBackground(backgroundId);
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
        {/* Карточки премиум фонов */}
        {PREMIUM_BACKGROUNDS.map((bg) => {
          const isSelected = selectedBackground === bg.id;

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
              }}
              onClick={() => handleApply(bg.id)}
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
            >
              {/* Превью в зависимости от типа */}
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {bg.type === "vanta" && bg.effectType && (
                  <VantaPreview
                    effectType={bg.effectType}
                    color={bg.color || 0xe30a0a}
                    color1={bg.color1 || null}
                    color2={bg.color2 || null}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                    }}
                  />
                )}
                {bg.type === "shadertoy" && bg.shaderId && (
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
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}>
                  {bg.color && (
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: `#${bg.color.toString(16).padStart(6, '0')}`,
                        flexShrink: 0,
                        boxShadow: "0 0 2px rgba(0,0,0,0.5)",
                      }}
                    />
                  )}
                  <span>{bg.name}</span>
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
                    style={{
                      padding: "3px 6px",
                      fontSize: "8px",
                      fontWeight: 600,
                      background: "rgba(139, 92, 246, 0.8)",
                      border: "none",
                      borderRadius: "4px",
                      color: "#fff",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Применить
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

