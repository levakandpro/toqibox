import React, { useState, useRef, useEffect, useMemo } from "react";
import { uploadCover } from "../../utils/r2Upload.js";
import { PLAY_ICONS, DEFAULT_PLAY_ICON } from "../../utils/playIcons.js";
import { SHADERTOY_BACKGROUNDS } from "../../utils/shadertoyBackgrounds.js";
import BackgroundSelector from "./BackgroundSelector.jsx";
import PremiumBackgroundSelector from "./PremiumBackgroundSelector.jsx";
import PremiumLoader from "../../ui/PremiumLoader.jsx";
import { supabase } from "../../features/auth/supabaseClient.js";
import ArtistPlayButtonSelector from "../artist/ArtistPlayButtonSelector.jsx";
import PreviewRangeSelector from "./PreviewRangeSelector.jsx";
import crownIcon from "../../assets/crown.png";

export default function TrackEditForm({ track, artist, onSave, onCancel }) {
  // Проверяем премиум статус артиста
  const isPremium = useMemo(() => {
    if (!artist) return false;
    return !!(
      artist.premium_type && 
      artist.premium_until && 
      new Date(artist.premium_until) > new Date()
    );
  }, [artist]);
  // Состояния для сворачивания/разворачивания секций (по умолчанию закрыты)
  const [isPlayIconExpanded, setIsPlayIconExpanded] = useState(false);
  const [isBackgroundExpanded, setIsBackgroundExpanded] = useState(false);
  const [isPremiumExpanded, setIsPremiumExpanded] = useState(false);
  const [isPlayButtonExpanded, setIsPlayButtonExpanded] = useState(false);
  // Функции для извлечения ID из ссылок
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

  const extractTikTokId = (url) => {
    if (!url) return null;
    // TikTok URL форматы:
    // https://www.tiktok.com/@user/video/1234567890
    // https://tiktok.com/@user/video/1234567890
    // https://vm.tiktok.com/xxxxx
    // https://m.tiktok.com/v/1234567890
    const patterns = [
      /tiktok\.com\/@[^\/]+\/video\/(\d+)/i,
      /vm\.tiktok\.com\/([A-Za-z0-9]+)/i,
      /m\.tiktok\.com\/v\/(\d+)/i,
      /tiktok\.com\/t\/([A-Za-z0-9]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    
    return null;
  };

  const extractInstagramShortcode = (url) => {
    if (!url) return null;
    // Instagram Reels URL форматы:
    // https://www.instagram.com/reel/ABC123/
    // https://instagram.com/reel/ABC123/
    // https://www.instagram.com/p/ABC123/
    // https://instagram.com/p/ABC123/
    // https://www.instagram.com/reels/ABC123/
    const patterns = [
      /instagram\.com\/reel\/([A-Za-z0-9_-]+)/i,
      /instagram\.com\/reels\/([A-Za-z0-9_-]+)/i,
      /instagram\.com\/p\/([A-Za-z0-9_-]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    
    return null;
  };

  const [editTitle, setEditTitle] = useState(track.title);
  const [editLink, setEditLink] = useState(track.link || ""); // YouTube ссылка для центрального плеера
  
  // Определяем выбранный тип вертикального видео
  const getInitialVerticalType = () => {
    const source = String(track.vertical_video_source || "").toLowerCase();
    if (source === "shorts" && track.shorts_link) return "shorts";
    if (source === "tiktok" && track.tiktok_link) return "tiktok";
    if (source === "reels" && track.reels_link) return "reels";
    return null;
  };
  
  const [verticalVideoType, setVerticalVideoType] = useState(getInitialVerticalType());
  const [verticalVideoLink, setVerticalVideoLink] = useState(
    verticalVideoType === "shorts" ? (track.shorts_link || "") :
    verticalVideoType === "tiktok" ? (track.tiktok_link || "") :
    verticalVideoType === "reels" ? (track.reels_link || "") : ""
  );
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState(null);
  // Используем дефолтную иконку если нет
  const [editPlayIcon, setEditPlayIcon] = useState(track.play_icon || DEFAULT_PLAY_ICON);
  const [editPreviewStartSeconds, setEditPreviewStartSeconds] = useState(track.preview_start_seconds || 0);
  const [editPreviewEndSeconds, setEditPreviewEndSeconds] = useState(
    track.preview_start_seconds !== undefined && track.preview_start_seconds !== null
      ? track.preview_start_seconds + 30
      : 30
  );
  const [videoDuration, setVideoDuration] = useState(null); // Длительность видео в секундах
  const [loadingDuration, setLoadingDuration] = useState(false);
  const previewPlayerKey = useRef(0); // Ключ для принудительного обновления iframe
  const tempDivRef = useRef(null); // Ссылка на временный div для YouTube API

  // Получаем длительность видео через YouTube iframe API
  useEffect(() => {
    const youtubeId = extractYoutubeId(track?.link);
    if (!youtubeId) {
      setVideoDuration(null);
      return;
    }

    // Загружаем YouTube iframe API если еще не загружен
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Ждем загрузки API и получаем длительность
    const checkYTAndGetDuration = () => {
      if (window.YT && window.YT.Player) {
        // Очищаем предыдущий элемент если есть
        if (tempDivRef.current && tempDivRef.current.parentNode === document.body) {
          try {
            document.body.removeChild(tempDivRef.current);
          } catch (e) {
            // Игнорируем ошибки
          }
        }
        
        // Создаем временный плеер для получения длительности
        tempDivRef.current = document.createElement('div');
        tempDivRef.current.style.display = 'none';
        document.body.appendChild(tempDivRef.current);
        
        const player = new window.YT.Player(tempDivRef.current, {
          videoId: youtubeId,
          events: {
            onReady: (event) => {
              try {
                const duration = event.target.getDuration();
                if (duration && duration > 0) {
                  const durationSeconds = Math.floor(duration);
                  setVideoDuration(durationSeconds);
                  // Ограничиваем конец превью длительностью видео
                  const maxStart = Math.max(0, durationSeconds - 30);
                  if (editPreviewStartSeconds > maxStart) {
                    setEditPreviewStartSeconds(maxStart);
                    setEditPreviewEndSeconds(durationSeconds);
                  } else if (editPreviewStartSeconds + 30 > durationSeconds) {
                    setEditPreviewEndSeconds(durationSeconds);
                  }
                }
              } catch (error) {
                console.error("Error getting video duration:", error);
              } finally {
                // Безопасное удаление элемента
                if (tempDivRef.current && tempDivRef.current.parentNode === document.body) {
                  try {
                    document.body.removeChild(tempDivRef.current);
                  } catch (e) {
                    // Игнорируем ошибки при удалении
                  }
                }
                tempDivRef.current = null;
              }
            },
            onError: () => {
              console.error("Error loading video for duration");
              // Безопасное удаление элемента
              if (tempDivRef.current && tempDivRef.current.parentNode === document.body) {
                try {
                  document.body.removeChild(tempDivRef.current);
                } catch (e) {
                  // Игнорируем ошибки при удалении
                }
              }
              tempDivRef.current = null;
            }
          }
        });
      } else {
        setTimeout(checkYTAndGetDuration, 100);
      }
    };

    if (window.YT && window.YT.Player) {
      checkYTAndGetDuration();
    } else {
      window.onYouTubeIframeAPIReady = checkYTAndGetDuration;
      if (window.YT && window.YT.Player) {
        checkYTAndGetDuration();
      }
    }

    // Очистка при размонтировании
    return () => {
      if (tempDivRef.current && tempDivRef.current.parentNode === document.body) {
        try {
          document.body.removeChild(tempDivRef.current);
        } catch (e) {
          // Игнорируем ошибки при очистке
        }
      }
      tempDivRef.current = null;
    };
  }, [track?.link]);
  // Получаем дефолтный фон (первый из списка)
  const defaultBackgroundId = SHADERTOY_BACKGROUNDS[0]?.id || null;
  const [editBackground, setEditBackground] = useState(track.shadertoy_background_id || defaultBackgroundId);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef(null);

  // Получаем текущую обложку
  const currentCoverUrl = editCoverPreview || (track.cover_key 
    ? `https://pub-1234567890abcdef.r2.dev/track-covers/${track.id}.jpg`
    : null);

  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditCoverFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditCoverPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!track?.id) return;
    
    setSaving(true);
    setUploadingCover(true);
    
    try {
      let coverKey = track.cover_key || null;

      // Если выбрана новая обложка, загружаем её в R2
      if (editCoverFile) {
        try {
          const uploadResult = await uploadCover({
            type: 'track_cover',
            id: track.id,
            file: editCoverFile,
          });
          coverKey = uploadResult.key;
        } catch (uploadError) {
          console.error("Error uploading cover:", uploadError);
          alert("Ошибка при загрузке обложки. Трек будет сохранен без новой обложки.");
        }
      }

      // Валидация YouTube ссылки (для центрального плеера)
      if (editLink.trim()) {
        const youtubeId = extractYoutubeId(editLink.trim());
        if (!youtubeId) {
          alert("Пожалуйста, введите корректную ссылку на YouTube видео");
          setSaving(false);
          setUploadingCover(false);
          return;
        }
      }

      // Валидация вертикального видео (если выбран тип)
      let verticalSource = null;
      let shortsLink = null;
      let tiktokLink = null;
      let reelsLink = null;
      
      if (verticalVideoType && verticalVideoLink.trim()) {
        if (verticalVideoType === "shorts") {
          const youtubeId = extractYoutubeId(verticalVideoLink.trim());
          if (!youtubeId) {
            alert("Пожалуйста, введите корректную ссылку на YouTube Shorts");
            setSaving(false);
            setUploadingCover(false);
            return;
          }
          verticalSource = "shorts";
          shortsLink = verticalVideoLink.trim();
        } else if (verticalVideoType === "tiktok") {
          const tiktokId = extractTikTokId(verticalVideoLink.trim());
          if (!tiktokId) {
            alert("Пожалуйста, введите корректную ссылку на TikTok");
            setSaving(false);
            setUploadingCover(false);
            return;
          }
          verticalSource = "tiktok";
          tiktokLink = verticalVideoLink.trim();
        } else if (verticalVideoType === "reels") {
          const instagramShortcode = extractInstagramShortcode(verticalVideoLink.trim());
          if (!instagramShortcode) {
            alert("Пожалуйста, введите корректную ссылку на Instagram Reels");
            setSaving(false);
            setUploadingCover(false);
            return;
          }
          verticalSource = "reels";
          reelsLink = verticalVideoLink.trim();
        }
      }

      // Обновляем трек в БД
      const updateData = {
        title: editTitle.trim(),
        link: editLink.trim() || null, // YouTube ссылка для центрального плеера
        shorts_link: shortsLink,
        tiktok_link: tiktokLink,
        reels_link: reelsLink,
        vertical_video_source: verticalSource, // "shorts", "tiktok", "reels" или null
        updated_at: new Date().toISOString(),
      };

      if (coverKey !== undefined) {
        updateData.cover_key = coverKey;
      }

      if (editPlayIcon !== undefined) {
        updateData.play_icon = editPlayIcon;
      }

      if (editPreviewStartSeconds !== undefined) {
        updateData.preview_start_seconds = Number(editPreviewStartSeconds) || 0;
      }

      if (editBackground !== undefined) {
        updateData.shadertoy_background_id = editBackground || null;
      }

      console.log("💾 Сохранение трека с данными:", updateData);
      
      const { error } = await supabase
        .from("tracks")
        .update(updateData)
        .eq("id", track.id);
      
      if (error) {
        console.error("❌ Ошибка при сохранении:", error);
        throw error;
      }
      
      console.log("✅ Трек успешно сохранен");
      
      if (onSave) {
        onSave({
          ...track,
          ...updateData,
        });
      }
    } catch (error) {
      console.error("❌ Ошибка при сохранении трека:", error);
      alert(`Ошибка при сохранении трека: ${error.message || "Неизвестная ошибка"}`);
    } finally {
      setSaving(false);
      setUploadingCover(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 2000,
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)",
      backdropFilter: "blur(20px)",
      overflowY: "auto",
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget && onCancel) {
        onCancel();
      }
    }}
    >
      <div style={{
        width: "100%",
        minHeight: "100vh",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
      onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
          paddingBottom: "20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}>
          <h2 style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.5px",
          }}>
            Редактировать трек
          </h2>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "transparent",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "20px",
              fontWeight: 300,
              cursor: "pointer",
              transition: "all 0.2s",
              padding: 0,
            }}
            onMouseEnter={(e => {
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            })}
            onMouseLeave={(e => {
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
              e.currentTarget.style.background = "transparent";
            })}
            title="Закрыть"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Название */}
          <div>
            <label style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "8px",
              display: "block",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Название
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Введите название трека"
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.background = "rgba(0, 0, 0, 0.5)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.background = "rgba(0, 0, 0, 0.4)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }}
              required
            />
          </div>

          {/* YouTube ссылка для центрального плеера */}
          <div>
            <label style={{
              fontSize: "9px",
              fontWeight: 500,
              color: "rgba(200, 220, 255, 0.9)",
              marginBottom: "8px",
              display: "block",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              YouTube ссылка (для центрального плеера)
            </label>
            <input
              type="url"
              value={editLink}
              onChange={(e) => setEditLink(e.target.value)}
              placeholder="https://www.youtube.com/..."
              style={{
                width: "100%",
                padding: "12px 16px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.background = "rgba(0, 0, 0, 0.5)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.background = "rgba(0, 0, 0, 0.4)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }}
            />
          </div>

          {/* Вертикальные видео (для кнопки в шапке) */}
          <div>
            <label style={{
              fontSize: "9px",
              fontWeight: 500,
              color: "rgba(200, 220, 255, 0.9)",
              marginBottom: "10px",
              marginTop: "16px",
              display: "block",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Вертикальное видео
            </label>
            
            {/* Кнопки выбора типа */}
            <div style={{
              display: "flex",
              gap: "8px",
              marginBottom: "12px",
            }}>
              <button
                type="button"
                onClick={() => setVerticalVideoType("shorts")}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: verticalVideoType === "shorts" 
                    ? "rgba(255, 0, 0, 0.2)" 
                    : "rgba(0, 0, 0, 0.4)",
                  border: `1px solid ${verticalVideoType === "shorts" 
                    ? "rgba(255, 0, 0, 0.4)" 
                    : "rgba(255, 255, 255, 0.1)"}`,
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                Shorts
              </button>
              <button
                type="button"
                onClick={() => setVerticalVideoType("tiktok")}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: verticalVideoType === "tiktok" 
                    ? "rgba(255, 0, 0, 0.3)" 
                    : "rgba(0, 0, 0, 0.3)",
                  border: `1px solid ${verticalVideoType === "tiktok" 
                    ? "rgba(255, 0, 0, 0.5)" 
                    : "rgba(255, 255, 255, 0.15)"}`,
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                TikTok
              </button>
              <button
                type="button"
                onClick={() => setVerticalVideoType("reels")}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  background: verticalVideoType === "reels" 
                    ? "rgba(255, 0, 0, 0.3)" 
                    : "rgba(0, 0, 0, 0.3)",
                  border: `1px solid ${verticalVideoType === "reels" 
                    ? "rgba(255, 0, 0, 0.5)" 
                    : "rgba(255, 255, 255, 0.15)"}`,
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                Reels
              </button>
            </div>

            {/* Поле для ссылки (показывается только если выбран тип) */}
            {verticalVideoType && (
              <div>
                <input
                  type="url"
                  value={verticalVideoLink}
                  onChange={(e) => setVerticalVideoLink(e.target.value)}
                  placeholder={
                    verticalVideoType === "shorts" ? "https://www.youtube.com/shorts/..." :
                    verticalVideoType === "tiktok" ? "https://www.tiktok.com/@user/video/..." :
                    "https://www.instagram.com/reel/..."
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                    outline: "none",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.background = "rgba(0, 0, 0, 0.5)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.background = "rgba(0, 0, 0, 0.4)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  }}
                />
              </div>
            )}
          </div>

          {/* Выбор фрагмента превью (30 секунд) */}
          <div>
            <label style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "8px",
              display: "block",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Превью фрагмент (30 сек)
            </label>
            
            {/* Визуальный селектор фрагмента */}
            {videoDuration && videoDuration > 0 ? (
              <PreviewRangeSelector
                duration={videoDuration}
                startSeconds={editPreviewStartSeconds}
                endSeconds={editPreviewEndSeconds}
                previewDuration={30}
                onStartChange={(start) => {
                  setEditPreviewStartSeconds(start);
                  setEditPreviewEndSeconds(start + 30);
                  previewPlayerKey.current += 1;
                }}
                onEndChange={(end) => {
                  const start = Math.max(0, end - 30);
                  setEditPreviewStartSeconds(start);
                  setEditPreviewEndSeconds(end);
                  previewPlayerKey.current += 1;
                }}
              />
            ) : (
              <div style={{
                padding: "20px",
                textAlign: "center",
                background: "rgba(0, 0, 0, 0.2)",
                borderRadius: "8px",
                color: "rgba(255, 255, 255, 0.5)",
                fontSize: "12px",
              }}>
                {loadingDuration ? "Загрузка длительности видео..." : "Добавьте ссылку на YouTube видео для выбора фрагмента"}
              </div>
            )}
            
            {/* Превью-плеер для просмотра видео */}
            {extractYoutubeId(track?.link) && videoDuration && (
              <div style={{
                marginTop: "12px",
                borderRadius: "12px",
                overflow: "hidden",
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}>
                <div style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16/9",
                  background: "#000",
                }}>
                  <iframe
                    key={previewPlayerKey.current}
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${extractYoutubeId(track?.link)}?start=${editPreviewStartSeconds}&controls=1&modestbranding=1&rel=0`}
                    title="Preview player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      border: "none",
                    }}
                  />
                </div>
                <div style={{
                  padding: "12px",
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "rgba(0, 0, 0, 0.4)",
                }}>
                  <div style={{
                    fontSize: "11px",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}>
                    Выбранный фрагмент: {editPreviewStartSeconds}с - {editPreviewEndSeconds}с
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      previewPlayerKey.current += 1;
                    }}
                    style={{
                      padding: "6px 12px",
                      background: "rgba(139, 92, 246, 0.8)",
                      border: "none",
                      borderRadius: "6px",
                      color: "#fff",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontWeight: 500,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(139, 92, 246, 1)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(139, 92, 246, 0.8)";
                    }}
                  >
                    Перейти к началу
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Иконка плеера */}
          <div>
            <button
              type="button"
              className="section-toggle-button"
              data-text="Иконка плеера"
              onClick={() => setIsPlayIconExpanded(!isPlayIconExpanded)}
            >
              <span className="actual-text">&nbsp;Иконка плеера&nbsp;</span>
              <span aria-hidden="true" className="hover-text">&nbsp;Иконка плеера&nbsp;</span>
            </button>
            <div className={`section-content ${isPlayIconExpanded ? 'expanded' : 'collapsed'}`}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
                gap: "8px",
                maxHeight: "200px",
                overflowY: "auto",
              }}>
                {PLAY_ICONS.map((icon) => {
                  const isLocked = icon.premium && !isPremium;
                  return (
                    <button
                      key={icon.id}
                      type="button"
                      onClick={() => {
                        if (isLocked) {
                          alert('Эта иконка доступна только для премиум пользователей. Обратитесь к администратору для получения доступа.');
                          return;
                        }
                        setEditPlayIcon(icon.id);
                      }}
                      style={{
                        aspectRatio: "1",
                        borderRadius: "8px",
                        border: editPlayIcon === icon.id
                          ? "2px solid #10b981"
                          : "1px solid rgba(255, 255, 255, 0.1)",
                        background: editPlayIcon === icon.id
                          ? "rgba(16, 185, 129, 0.2)"
                          : "rgba(0, 0, 0, 0.4)",
                        cursor: isLocked ? "not-allowed" : "pointer",
                        padding: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        opacity: isLocked ? 0.5 : 1,
                      }}
                      disabled={isLocked}
                    >
                      <img
                        src={icon.icon}
                        alt={icon.name}
                        style={{
                          width: "32px",
                          height: "32px",
                          objectFit: "contain",
                        }}
                      />
                      {icon.premium && (
                        <img 
                          src={crownIcon} 
                          alt="Premium" 
                          style={{
                            position: "absolute",
                            top: "2px",
                            right: "2px",
                            width: "12px",
                            height: "12px",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Фон */}
          <div>
            <button
              type="button"
              className="section-toggle-button"
              data-text="Фон страницы трека"
              onClick={() => setIsBackgroundExpanded(!isBackgroundExpanded)}
            >
              <span className="actual-text">&nbsp;Фон страницы трека&nbsp;</span>
              <span aria-hidden="true" className="hover-text">&nbsp;Фон страницы трека&nbsp;</span>
            </button>
            <div className={`section-content ${isBackgroundExpanded ? 'expanded' : 'collapsed'}`}>
              <BackgroundSelector
                track={track}
                isOwner={true}
                selectedBackgroundId={editBackground}
                onSelect={(backgroundId) => setEditBackground(backgroundId)}
              />
            </div>
          </div>

          {/* ПРЕМИУМ ФОНЫ */}
          <div style={{ marginTop: "24px" }}>
            <button
              type="button"
              className="section-toggle-button"
              data-text="ПРЕМИУМ ФОНЫ"
              onClick={() => setIsPremiumExpanded(!isPremiumExpanded)}
            >
              <span className="actual-text">&nbsp;ПРЕМИУМ ФОНЫ&nbsp;</span>
              <span aria-hidden="true" className="hover-text">&nbsp;ПРЕМИУМ ФОНЫ&nbsp;</span>
            </button>
            <div className={`section-content ${isPremiumExpanded ? 'expanded' : 'collapsed'}`}>
              <PremiumBackgroundSelector
                track={track}
                isOwner={true}
                selectedBackgroundId={editBackground}
                onSelect={(backgroundId) => setEditBackground(backgroundId)}
              />
            </div>
          </div>

          {/* Фон кнопок */}
          {artist && (
            <div style={{ marginTop: "24px" }}>
              <button
                type="button"
                className="section-toggle-button"
                data-text="Фон кнопок"
                onClick={() => setIsPlayButtonExpanded(!isPlayButtonExpanded)}
              >
                <span className="actual-text">&nbsp;Фон кнопок&nbsp;</span>
                <span aria-hidden="true" className="hover-text">&nbsp;Фон кнопок&nbsp;</span>
              </button>
              <div className={`section-content ${isPlayButtonExpanded ? 'expanded' : 'collapsed'}`}>
                <ArtistPlayButtonSelector
                  artist={artist}
                  isOwner={true}
                  editMode={true}
                  onUpdate={() => {
                    // Обновляем данные при изменении кнопки
                    if (onSave) {
                      onSave(track);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div style={{
            display: "flex",
            gap: "12px",
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              style={{
                flex: 1,
                padding: "14px 24px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.4)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                flex: 1,
                padding: "14px 24px",
                background: saving
                  ? "rgba(139, 92, 246, 0.6)"
                  : "rgba(139, 92, 246, 0.8)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "14px",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.background = "rgba(139, 92, 246, 0.9)";
                  e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = saving
                  ? "rgba(139, 92, 246, 0.6)"
                  : "rgba(139, 92, 246, 0.8)";
                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
              }}
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

