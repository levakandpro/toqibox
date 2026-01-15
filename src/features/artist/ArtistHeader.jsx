import React, { useState, useMemo, useEffect } from "react";
import { supabase } from "../../features/auth/supabaseClient.js";

import coverDefault from "../../assets/cover.png";
import verifGold from "../../assets/verifgold.svg";
import shareIcon from "../../assets/share.svg";

// Цвета для переключения (вынесено за пределы компонента)
const NAME_COLORS = [
  "#ffffff",      // белый (по умолчанию)
  "#8B5CF6",      // фиолетовый
  "#06B6D4",      // бирюзовый
  "#FBBF24",      // желтый
  "#EF4444",      // красный
  "#F97316",      // оранжевый
  "#10B981",      // зеленый
  "#3B82F6",      // синий
];

export default function ArtistHeader({ artist, isOwner = false, onUpdate, editMode = false, onToggleEditMode, onShare, showBackgroundPanels, onToggleBackgroundPanels, hideActionButtons = false }) {
  const [isWeb, setIsWeb] = useState(false);
  
  // Определяем веб-версию
  useEffect(() => {
    const checkWeb = () => {
      setIsWeb(window.innerWidth >= 768);
    };
    checkWeb();
    window.addEventListener('resize', checkWeb);
    return () => window.removeEventListener('resize', checkWeb);
  }, []);

  // Загружаем значение из localStorage если есть (обход RLS)
  const getDisplayName = () => {
    if (artist?.id) {
      const localValue = localStorage.getItem(`toqibox:artist:${artist.id}:display_name`);
      if (localValue) {
        return localValue;
      }
    }
    return artist?.display_name || "";
  };

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(getDisplayName());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameColorIndex, setNameColorIndex] = useState(0);
  const lastSavedNameRef = React.useRef(getDisplayName());
  const isSavingRef = React.useRef(false);
  const skipNextUpdateRef = React.useRef(false);
  
  // Обновляем ref при изменении artist
  React.useEffect(() => {
    if (artist?.display_name) {
      lastSavedNameRef.current = artist.display_name;
    }
  }, [artist?.display_name]);
  
  // Загружаем цвет из БД или localStorage при загрузке артиста
  const artistId = artist?.id;
  const artistNameColor = artist?.name_color ?? null;
  
  React.useEffect(() => {
    if (artistId) {
      // Сначала пробуем загрузить из БД (если поле есть)
      const dbColor = artistNameColor;
      if (dbColor !== null && dbColor !== undefined && dbColor >= 0 && dbColor < NAME_COLORS.length) {
        setNameColorIndex(dbColor);
        // Синхронизируем с localStorage
        localStorage.setItem(`toqibox:nameColor:${artistId}`, dbColor.toString());
      } else {
        // Если в БД нет, загружаем из localStorage
        const saved = localStorage.getItem(`toqibox:nameColor:${artistId}`);
        const index = saved ? parseInt(saved, 10) : 0;
        setNameColorIndex(index >= 0 && index < NAME_COLORS.length ? index : 0);
      }
    } else {
      setNameColorIndex(0);
    }
  }, [artistId, artistNameColor]);
  
  // Всегда используем обложку cover.png
  const currentCoverPath = typeof coverDefault === "string" ? coverDefault : coverDefault.src || coverDefault;


  // Обновляем displayName когда artist меняется (только при первой загрузке или если мы не редактируем)
  React.useEffect(() => {
    // Пропускаем обновление если установлен флаг
    if (skipNextUpdateRef.current) {
      console.log("⏭️ Skipping update - flag set");
      skipNextUpdateRef.current = false;
      return;
    }
    
    // Не обновляем если мы в процессе редактирования или сохранения
    if (isEditing || isSavingRef.current) {
      return;
    }
    
    // НЕ обновляем если мы только что сохранили - это предотвратит возврат к старому значению
    if (saved) {
      console.log("⏭️ Skipping update - just saved, keeping new value");
      return;
    }
    
    // Проверяем localStorage сначала (обход RLS)
    const localValue = artist?.id ? localStorage.getItem(`toqibox:artist:${artist.id}:display_name`) : null;
    const valueToUse = localValue || artist?.display_name || "";
    
    // НЕ обновляем если значение совпадает с тем, что мы только что сохранили
    if (valueToUse === lastSavedNameRef.current) {
      console.log("⏭️ Skipping update - same as last saved value");
      return;
    }
    
    // Обновляем только если значение действительно изменилось
    if (valueToUse && valueToUse !== displayName) {
      console.log("🔄 Updating displayName:", {
        old: displayName,
        new: valueToUse,
        fromLocalStorage: !!localValue
      });
      
      setDisplayName(valueToUse);
      lastSavedNameRef.current = valueToUse;
    }
  }, [artist?.display_name, isEditing, saved, displayName]);

  // Сохраняем цвет в localStorage и в БД при изменении
  React.useEffect(() => {
    if (!artist?.id) return;
    
    // Сохраняем в localStorage всегда
    localStorage.setItem(`toqibox:nameColor:${artist.id}`, nameColorIndex.toString());
    
    // Сохраняем в БД только если владелец и цвет не белый (индекс > 0)
    if (isOwner && nameColorIndex > 0) {
      supabase
        .from("artists")
        .update({ name_color: nameColorIndex })
        .eq("id", artist.id)
        .then(({ error }) => {
          if (error) {
            console.log("⚠️ name_color field not in DB yet, saving only to localStorage");
          }
        });
    }
  }, [nameColorIndex, artist?.id, isOwner]);
  
  // Переключение цвета
  const toggleNameColor = () => {
    setNameColorIndex((prev) => (prev + 1) % NAME_COLORS.length);
  };

  const isPremium = !!artist?.isPremium;


  const handleSave = async () => {
    if (!artist?.id || !isOwner || saving) {
      console.log("❌ handleSave blocked:", { hasArtist: !!artist?.id, isOwner, saving });
      return;
    }

    console.log("💾 Starting save...");
    setSaving(true);
    setSaved(false);
    isSavingRef.current = true; // Устанавливаем флаг сохранения
    
    try {
      const trimmedName = displayName.trim();
      
      console.log("💾 Saving display_name:", { 
        artistId: artist.id, 
        oldName: artist?.display_name, 
        newName: trimmedName 
      });
      
      // Проверяем текущее значение в БД перед обновлением
      const { data: beforeData, error: beforeError } = await supabase
        .from("artists")
        .select("display_name, id")
        .eq("id", artist.id)
        .single();
      
      if (beforeError) {
        console.error("❌ Error reading before update:", beforeError);
      }
      console.log("📊 Before update - DB value:", beforeData?.display_name, "ID:", artist.id);

      // Пробуем обновить через RPC функцию (обходит RLS)
      console.log("💾 Attempting UPDATE via RPC function:", {
        id: artist.id,
        newValue: trimmedName,
        oldValue: beforeData?.display_name
      });

      let updateSuccess = false;
      let error = null;
      let data = null;

      // Сначала пробуем через RPC функцию
      const { data: rpcData, error: rpcError } = await supabase.rpc('update_artist_display_name', {
        artist_id: artist.id,
        new_display_name: trimmedName
      });

      if (rpcError) {
        console.warn("⚠️ RPC function not available, trying direct UPDATE:", rpcError);
        
        // Если RPC функция не существует, пробуем обычный UPDATE
        const updateResult = await supabase
          .from("artists")
          .update({ display_name: trimmedName })
          .eq("id", artist.id)
          .select("id, display_name");
        
        error = updateResult.error;
        data = updateResult.data;
      } else {
        // RPC функция успешно выполнилась
        if (rpcData?.success) {
          console.log("✅ RPC function successful:", rpcData);
          data = [{ id: rpcData.id, display_name: rpcData.display_name }];
          updateSuccess = true;
        } else {
          error = { message: rpcData?.error || "RPC function returned false" };
        }
      }

      if (error) {
        console.error("❌ Supabase UPDATE error:", error);
        console.error("❌ Error code:", error.code);
        console.error("❌ Error message:", error.message);
        throw error;
      }

      console.log("✅ UPDATE query successful", { 
        data, 
        dataLength: data?.length,
        firstItem: data?.[0],
        expectedValue: trimmedName,
        actualInResponse: data?.[0]?.display_name
      });
      
      // Проверяем, действительно ли обновилось в ответе
      if (data && data.length > 0) {
        if (data[0].display_name === trimmedName) {
          console.log("✅ UPDATE confirmed - value matches in response");
          updateSuccess = true;
        } else {
          console.warn("⚠️ UPDATE response contains OLD value!", { 
            responseValue: data[0].display_name,
            expected: trimmedName,
            message: "This means RLS is blocking the UPDATE - the query succeeds but doesn't actually update"
          });
        }
      } else {
        console.warn("⚠️ UPDATE returned no data", { 
          response: data,
          expected: trimmedName 
        });
      }

      // Ждем немного, чтобы БД обновилась
      await new Promise(resolve => setTimeout(resolve, 200));

      // Проверяем значение в БД после обновления
      const { data: afterData, error: afterError } = await supabase
        .from("artists")
        .select("display_name, id")
        .eq("id", artist.id)
        .single();
      
      if (afterError) {
        console.error("❌ Error reading after update:", afterError);
      }
      console.log("📊 After update - DB value:", afterData?.display_name, "ID:", artist.id);
      
      if (afterData?.display_name !== trimmedName) {
        console.error("⚠️ WARNING: Value in DB doesn't match what we saved!", {
          expected: trimmedName,
          actual: afterData?.display_name
        });
        console.log("💾 Saving to localStorage as workaround (RLS blocking UPDATE)");
        
        // ВРЕМЕННОЕ РЕШЕНИЕ: Сохраняем в localStorage и используем это значение
        if (artist.id) {
          localStorage.setItem(`toqibox:artist:${artist.id}:display_name`, trimmedName);
          console.log("✅ Saved to localStorage, will use this value");
        }
      } else {
        // Удаляем из localStorage если успешно обновилось в БД
        if (artist.id) {
          localStorage.removeItem(`toqibox:artist:${artist.id}:display_name`);
        }
      }

      // Сохраняем последнее сохраненное имя
      lastSavedNameRef.current = trimmedName;
      
      // Устанавливаем флаг, чтобы пропустить следующее обновление из useEffect
      skipNextUpdateRef.current = true;
      
      // Обновляем локальное состояние СРАЗУ
      setDisplayName(trimmedName);
      
      // Показываем галочку
      console.log("✅ Setting saved=true");
      setSaved(true);
      
      // Закрываем поле редактирования через 2 секунды
      setTimeout(() => {
        console.log("⏰ Closing edit field");
        setIsEditing(false);
        
        // Обновляем данные в родительском компоненте ПОСЛЕ закрытия поля
        // Устанавливаем флаг снова, чтобы пропустить обновление после onUpdate
        skipNextUpdateRef.current = true;
        
        if (onUpdate) {
          console.log("🔄 Calling onUpdate to refresh artist data");
          onUpdate().then(() => {
            console.log("✅ onUpdate completed");
            // Обновляем ref с новым значением из БД
            if (artist?.display_name) {
              lastSavedNameRef.current = artist.display_name;
            }
          }).catch(err => {
            console.error("Error in onUpdate:", err);
          });
        }
        
        // Сбрасываем флаг сохранения и скрываем галочку через еще 0.5 секунды
        setTimeout(() => {
          console.log("⏰ Hiding checkmark");
          setSaved(false);
          isSavingRef.current = false;
        }, 500);
      }, 2000);
    } catch (e) {
      console.error("❌ Error saving display_name:", e);
      setSaved(false);
      isSavingRef.current = false;
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
    <section className="ah-root" style={{ position: "relative", overflow: "hidden" }}>
      <div
        className="ah-cover"
        style={{ 
          backgroundImage: `url(${currentCoverPath})`,
          transition: "all 0.3s ease",
        }}
        aria-hidden="true"
      />

      <div className="ah-overlay" aria-hidden="true" />

      {/* Переключатель режима редактирования в левом верхнем углу - только если onToggleEditMode передан (не в кабинете) */}
      {onToggleEditMode && (
        <button
          type="button"
          onClick={onToggleEditMode}
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            zIndex: 10000,
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            background: editMode ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {editMode ? "ПОСМОТРЕТЬ" : "РЕДАКТИРОВАТЬ"}
        </button>
      )}

      {/* Кнопка скрытия/показа панелей фонов (только в режиме редактирования) */}
      {!hideActionButtons && isOwner && editMode && onToggleBackgroundPanels && (
        <button
          type="button"
          onClick={onToggleBackgroundPanels}
          style={{
            position: "absolute",
            top: isWeb ? "10px" : "8px",
            right: isWeb ? "76px" : "74px",
            zIndex: 10001,
            width: isWeb ? "24px" : "22px",
            height: isWeb ? "24px" : "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: showBackgroundPanels ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "6px",
            cursor: "pointer",
            padding: 0,
            transition: "all 0.2s ease",
          }}
          aria-label={showBackgroundPanels ? "Скрыть панели фонов" : "Показать панели фонов"}
          title={showBackgroundPanels ? "Скрыть панели фонов" : "Показать панели фонов"}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = showBackgroundPanels ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = showBackgroundPanels ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
          }}
        >
          <svg
            width={isWeb ? "12" : "10"}
            height={isWeb ? "12" : "10"}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block" }}
          >
            <path
              d={showBackgroundPanels ? "M19 12H5M12 5L5 12L12 19" : "M5 12H19M12 5L19 12L12 19"}
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Кнопка "поделиться" в правом верхнем углу шапки */}
      {!hideActionButtons && (
        <button
          type="button"
          onClick={onShare || (() => {})}
          style={{
            position: "absolute",
            top: isWeb ? "10px" : "8px",
            right: (isOwner && editMode && onToggleBackgroundPanels) ? (isWeb ? "42px" : "40px") : (isOwner ? "42px" : "10px"),
            zIndex: 10001,
            width: isWeb ? "28px" : "26px",
            height: isWeb ? "28px" : "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "6px",
            cursor: "pointer",
            padding: 0,
            transition: "all 0.2s ease",
          }}
          aria-label="Поделиться"
          title="Поделиться"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
          }}
        >
          <img 
            src={shareIcon} 
            alt="" 
            style={{ width: isWeb ? "14px" : "12px", height: isWeb ? "14px" : "12px", display: "block" }}
          />
        </button>
      )}

      {/* Кнопка "просмотр как пользователь" (только для авторов) */}
      {!hideActionButtons && isOwner && (
        <button
          type="button"
          onClick={() => {
            // Переключаем режим просмотра (можно добавить функционал позже)
            console.log("Просмотр как пользователь");
          }}
          style={{
            position: "absolute",
            top: isWeb ? "10px" : "8px",
            right: "10px",
            zIndex: 10001,
            width: isWeb ? "28px" : "26px",
            height: isWeb ? "28px" : "26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "6px",
            cursor: "pointer",
            padding: 0,
            transition: "all 0.2s ease",
          }}
          aria-label="Просмотр как пользователь"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
          }}
        >
          <svg
            width={isWeb ? "14" : "12"}
            height={isWeb ? "14" : "12"}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block" }}
          >
            <path
              d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="12"
              r="3"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
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
          {isEditing && isOwner && editMode ? (
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div className="ah-artist-name-wrapper" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    color: NAME_COLORS[nameColorIndex],
                    position: "relative",
                    zIndex: 1000,
                    fontWeight: 900,
                    fontSize: "inherit",
                    display: "inline-block",
                  }}
                >
                  {artist?.display_name || artist?.name || "ARTIST"}
                </span>
                {isOwner && editMode && (
                  <button
                    type="button"
                    onClick={toggleNameColor}
                    className="ah-icon-button ah-tooltip"
                    style={{
                      background: "rgba(0, 0, 0, 0.6)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      padding: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: 4,
                      width: "28px",
                      height: "28px",
                      transition: "all 0.2s ease",
                    }}
                    aria-label="Изменить цвет имени"
                    data-tooltip="Изменить цвет имени"
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(0, 0, 0, 0.8)";
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.5)";
                      e.target.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(0, 0, 0, 0.6)";
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ display: "block" }}
                    >
                      <path
                        d="M8 1L9.5 6L14 6.5L10.5 10L11.5 14.5L8 12L4.5 14.5L5.5 10L2 6.5L6.5 6L8 1Z"
                        fill={nameColorIndex === 0 ? "none" : NAME_COLORS[nameColorIndex]}
                        stroke={nameColorIndex === 0 ? "rgba(255,255,255,0.9)" : NAME_COLORS[nameColorIndex]}
                        strokeWidth={nameColorIndex === 0 ? "1.5" : "0.5"}
                      />
                    </svg>
                  </button>
                )}
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
              {isOwner && editMode && !saved && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setSaved(false);
                  }}
                  className="ah-icon-button ah-tooltip"
                  style={{
                    background: "rgba(0, 0, 0, 0.6)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    padding: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "28px",
                    height: "28px",
                    transition: "all 0.2s ease",
                  }}
                  aria-label="Редактировать имя"
                  data-tooltip="Редактировать имя"
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(0, 0, 0, 0.8)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.5)";
                    e.target.style.transform = "scale(1.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "rgba(0, 0, 0, 0.6)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ display: "block" }}
                  >
                    <path
                      d="M11.333 2.00001C11.5084 1.82445 11.7163 1.68506 11.9447 1.58933C12.1731 1.4936 12.4173 1.44336 12.664 1.44336C12.9107 1.44336 13.1549 1.4936 13.3833 1.58933C13.6117 1.68506 13.8196 1.82445 13.995 2.00001C14.1706 2.17545 14.31 2.38331 14.4057 2.61172C14.5014 2.84013 14.5517 3.08431 14.5517 3.33101C14.5517 3.57771 14.5014 3.82189 14.4057 4.0503C14.31 4.27871 14.1706 4.48657 13.995 4.66201L5.162 13.495L2 14.333L2.838 11.171L11.671 2.33801L11.333 2.00001Z"
                      stroke="rgba(255, 255, 255, 0.9)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </button>
              )}
              </div>
              <div
                className="ah-verified-text"
                style={{
                  fontSize: "clamp(8px, 1.5vw, 10px)",
                  fontWeight: 300,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.6)",
                  opacity: 0.8,
                }}
              >
                ПРОВЕРЕННЫЙ АРТИСТ
              </div>
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
