import React, { useState, useMemo } from "react";
import { supabase } from "../../features/auth/supabaseClient.js";

import artistCoverFallback from "../../assets/covers/artist-cover-placeholder.png";
import artistCover2 from "../../assets/covers/artist-cover-placeholder2.jpg";
import artistCover3 from "../../assets/covers/artist-cover-placeholder3.jpg";
import artistCover4 from "../../assets/covers/artist-cover-placeholder4.jpg";
import artistCover5 from "../../assets/covers/artist-cover-placeholder5.jpg";
import artistCover6 from "../../assets/covers/artist-cover-placeholder6.jpg";
import artistCover7 from "../../assets/covers/artist-cover-placeholder7.jpg";
import artistCover8 from "../../assets/covers/artist-cover-placeholder8.jpg";
import artistCover9 from "../../assets/covers/artist-cover-placeholder9.jpg";
import artistCover10 from "../../assets/covers/artist-cover-placeholder10.jpg";
import verifGold from "../../assets/verifgold.svg";

export default function ArtistHeader({ artist, isOwner = false, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(artist?.display_name || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Список всех обложек (определяем сразу, без useMemo)
  const coverOptions = [
    artistCoverFallback,
    artistCover2,
    artistCover3,
    artistCover4,
    artistCover5,
    artistCover6,
    artistCover7,
    artistCover8,
    artistCover9,
    artistCover10,
  ];

  // Определяем текущую обложку и индекс (синхронно)
  const getCurrentCoverData = () => {
    // По умолчанию используем первую обложку
    let cover = artistCoverFallback;
    let index = 0;

    // Проверяем localStorage для сохраненной обложки
    const savedCoverName = artist?.id ? localStorage.getItem(`toqibox:cover:${artist.id}`) : null;
    const coverNameToFind = artist?.cover_image || savedCoverName;

    if (coverNameToFind) {
      const foundIndex = coverOptions.findIndex(opt => {
        const optName = opt.split('/').pop();
        return optName === coverNameToFind || coverNameToFind.includes(optName);
      });
      if (foundIndex >= 0) {
        cover = coverOptions[foundIndex];
        index = foundIndex;
      }
    }

    return { currentCover: cover, currentCoverIndex: index };
  };

  const { currentCover, currentCoverIndex } = getCurrentCoverData();
  
  // Состояние для выбора обложки (инициализируем с вычисленным значением)
  const [previewCoverIndex, setPreviewCoverIndex] = useState(currentCoverIndex);
  const [savingCover, setSavingCover] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

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

  // Обновляем previewCoverIndex когда меняется текущая обложка
  React.useEffect(() => {
    const newIndex = currentCoverIndex >= 0 ? currentCoverIndex : 0;
    setPreviewCoverIndex(newIndex);
  }, [currentCoverIndex]);

  const isPremium = !!artist?.isPremium;

  const handleCoverSave = async () => {
    if (!artist?.id || !isOwner || savingCover) return;

    setSavingCover(true);
    try {
      // Получаем имя файла из пути
      const selectedCover = coverOptions[previewCoverIndex];
      const coverFileName = selectedCover.split('/').pop();

      // Пока не сохраняем в БД, так как поле cover_image не существует
      // В будущем можно добавить это поле в таблицу artists
      // const { error } = await supabase
      //   .from("artists")
      //   .update({ cover_image: coverFileName })
      //   .eq("id", artist.id);
      // if (error) throw error;

      // Сохраняем в localStorage как временное решение
      localStorage.setItem(`toqibox:cover:${artist.id}`, coverFileName);

      // Обновляем данные
      if (onUpdate) {
        onUpdate();
      }
    } catch (e) {
      console.error("Error saving cover:", e);
      alert("Ошибка при сохранении обложки: " + (e.message || "Неизвестная ошибка"));
    } finally {
      setSavingCover(false);
    }
  };

  const handleCoverPrev = () => {
    setPreviewCoverIndex((prev) => (prev > 0 ? prev - 1 : coverOptions.length - 1));
  };

  const handleCoverNext = () => {
    setPreviewCoverIndex((prev) => (prev < coverOptions.length - 1 ? prev + 1 : 0));
  };

  // Обработка свайпа
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleCoverNext();
    }
    if (isRightSwipe) {
      handleCoverPrev();
    }
  };

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

  // Определяем, показывать ли превью обложки или текущую
  const displayCover = isOwner ? coverOptions[previewCoverIndex] : currentCover;
  const isPreviewDifferent = previewCoverIndex !== currentCoverIndex;

  console.log("🎨 ArtistHeader - Cover picker:", { 
    isOwner, 
    showCoverPicker: isOwner, 
    previewCoverIndex, 
    currentCoverIndex,
    displayCover: displayCover?.substring(0, 50) 
  });

  return (
    <section className="ah-root" style={{ position: "relative", overflow: "hidden" }}>
      <div
        className="ah-cover"
        style={{ 
          backgroundImage: `url(${displayCover})`,
          transition: "background-image 0.3s ease",
        }}
        onTouchStart={isOwner ? onTouchStart : undefined}
        onTouchMove={isOwner ? onTouchMove : undefined}
        onTouchEnd={isOwner ? onTouchEnd : undefined}
        aria-hidden="true"
      />

      <div className="ah-overlay" aria-hidden="true" />

      {/* Вертикальная полоска сбоку для выбора обложки (только для владельца) */}
      {isOwner && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "clamp(45px, 8vw, 60px)",
            minWidth: 45,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(10px)",
            borderLeft: "2px solid rgba(255, 255, 255, 0.2)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "20px 6px",
            touchAction: "none", // Предотвращаем скролл при свайпе
          }}
        >
          {/* Стрелка вверх */}
          <button
            type="button"
            onClick={handleCoverPrev}
            style={{
              width: "clamp(36px, 7vw, 40px)",
              height: "clamp(36px, 7vw, 40px)",
              minWidth: 36,
              minHeight: 36,
              background: "rgba(255, 255, 255, 0.2)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              borderRadius: 8,
              color: "#fff",
              cursor: "pointer",
              fontSize: "clamp(20px, 4vw, 24px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              fontWeight: "bold",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.3)";
              e.target.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
              e.target.style.transform = "scale(1)";
            }}
          >
            ↑
          </button>

          {/* Кнопка сохранения (галочка) */}
          <button
            type="button"
            onClick={handleCoverSave}
            disabled={savingCover || !isPreviewDifferent}
            style={{
              width: "clamp(40px, 8vw, 44px)",
              height: "clamp(40px, 8vw, 44px)",
              minWidth: 40,
              minHeight: 40,
              background: isPreviewDifferent ? "#10b981" : "rgba(255, 255, 255, 0.15)",
              border: isPreviewDifferent ? "2px solid rgba(255, 255, 255, 0.3)" : "2px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "50%",
              color: "#fff",
              cursor: (savingCover || !isPreviewDifferent) ? "default" : "pointer",
              fontSize: "clamp(22px, 5vw, 26px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: (savingCover || !isPreviewDifferent) ? 0.5 : 1,
              transition: "all 0.2s",
              fontWeight: "bold",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseEnter={(e) => {
              if (isPreviewDifferent && !savingCover) {
                e.target.style.transform = "scale(1.15)";
                e.target.style.boxShadow = "0 0 12px rgba(16, 185, 129, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
            }}
          >
            {savingCover ? "..." : "✓"}
          </button>

          {/* Стрелка вниз */}
          <button
            type="button"
            onClick={handleCoverNext}
            style={{
              width: "clamp(36px, 7vw, 40px)",
              height: "clamp(36px, 7vw, 40px)",
              minWidth: 36,
              minHeight: 36,
              background: "rgba(255, 255, 255, 0.2)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
              borderRadius: 8,
              color: "#fff",
              cursor: "pointer",
              fontSize: "clamp(20px, 4vw, 24px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              fontWeight: "bold",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.3)";
              e.target.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.2)";
              e.target.style.transform = "scale(1)";
            }}
          >
            ↓
          </button>
        </div>
      )}

      <div className="ah-content">
        <div 
          className="ah-name" 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 8, 
            position: "relative",
            zIndex: 100,
            color: "#ffffff",
            WebkitTextStroke: "0.5px rgba(0, 0, 0, 0.3)",
            textShadow: "0 2px 4px rgba(0,0,0,1), 0 4px 8px rgba(0,0,0,0.9), 0 6px 12px rgba(0,0,0,0.8)",
          }}
        >
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
              <span
                style={{
                  color: "#ffffff !important",
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  padding: "4px 12px",
                  borderRadius: "8px",
                  textShadow: "0 2px 4px rgba(0,0,0,1), 0 4px 8px rgba(0,0,0,1), 0 6px 12px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,0.9)",
                  WebkitTextStroke: "1px rgba(255, 255, 255, 0.5)",
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,1)) drop-shadow(0 8px 16px rgba(0,0,0,1))",
                  position: "relative",
                  zIndex: 1000,
                  fontWeight: 900,
                  fontSize: "inherit",
                  display: "inline-block",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                {artist?.display_name || artist?.name || "ARTIST"}
              </span>
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
