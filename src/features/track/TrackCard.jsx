import React, { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import coverDefault from "../../assets/cover.png";
import copyIcon from "../../assets/copy-white.svg";
import CopyNotification from "../../ui/CopyNotification.jsx";
import PremiumLoader from "../../ui/PremiumLoader.jsx";
import { uploadCover, getR2Url } from "../../utils/r2Upload.js";
import { PLAY_ICONS, DEFAULT_PLAY_ICON, getPlayIconObject } from "../../utils/playIcons.js";

export default function TrackCard({ track, isOwner = false, onEdit, onDelete }) {
  const [showNotification, setShowNotification] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editTitle, setEditTitle] = useState(track.title);
  const [editLink, setEditLink] = useState(track.link || "");
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState(null);
  const [editPlayIcon, setEditPlayIcon] = useState(track.play_icon || DEFAULT_PLAY_ICON);
  const [editPreviewStartSeconds, setEditPreviewStartSeconds] = useState(track.preview_start_seconds || 0);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverLoadError, setCoverLoadError] = useState(false);
  const fileInputRef = useRef(null);

  // Получаем обложку: сначала превью, потом кастомная из R2, потом cover.png по умолчанию
  const coverUrl = useMemo(() => {
    // Если есть превью (только что выбранный файл), показываем его
    if (editCoverPreview) {
      return editCoverPreview;
    }
    
    // Если была ошибка загрузки R2 изображения, используем дефолт
    if (coverLoadError) {
      return coverDefault;
    }
    
    // Если есть кастомная обложка из R2
    if (track.cover_key) {
      const r2Url = getR2Url(track.cover_key);
      return r2Url;
    }
    
    // Если есть coverUrl (для обратной совместимости)
    if (track.coverUrl) {
      return track.coverUrl;
    }
    
    // По умолчанию всегда используем cover.png
    return coverDefault;
  }, [track.cover_key, track.coverUrl, editCoverPreview, coverLoadError]);
  
  // Сбрасываем ошибку загрузки при изменении cover_key или превью
  useEffect(() => {
    setCoverLoadError(false);
  }, [track.cover_key, editCoverPreview]);

  const trackUrl = useMemo(() => {
    return `${window.location.origin}/t/${track.slug}`;
  }, [track.slug]);

  const handleCopyLink = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(trackUrl);
        setShowNotification(true);
      } else {
        // Fallback для старых браузеров
        const input = document.createElement("input");
        input.value = trackUrl;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        input.setSelectionRange(0, 99999);
        try {
          document.execCommand("copy");
          setShowNotification(true);
        } catch (err) {
          console.error("Failed to copy:", err);
        }
        document.body.removeChild(input);
      }
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEditForm(true);
    setEditTitle(track.title);
    setEditLink(track.link || "");
    setEditPlayIcon(track.play_icon || DEFAULT_PLAY_ICON);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onEdit) return;
    
    setSaving(true);
    setUploadingCover(true);
    
    try {
      let coverKey = track.cover_key || null;

      // Если выбрана новая обложка, загружаем её в R2
      if (editCoverFile) {
        try {
          // Загружаем новую обложку через presigned URL
          // Файл автоматически перезапишет старый, так как key фиксированный
          const uploadResult = await uploadCover({
            type: 'track_cover',
            id: track.id,
            file: editCoverFile,
          });
          coverKey = uploadResult.key;
        } catch (uploadError) {
          console.error("Error uploading cover:", uploadError);
          alert("Ошибка при загрузке обложки. Трек будет сохранен без новой обложки.");
          // Продолжаем сохранение без новой обложки
        }
      }

      await onEdit(track.id, {
        title: editTitle.trim(),
        link: editLink.trim(),
        cover_key: coverKey,
        play_icon: editPlayIcon,
        preview_start_seconds: Number(editPreviewStartSeconds) || 0,
      });
      
      setShowEditForm(false);
      setEditCoverFile(null);
      // В dev режиме оставляем превью, чтобы обложка была видна (файл не загружен в R2)
      // В продакшене очищаем превью, так как файл загружен в R2 и будет отображаться оттуда
      if (!import.meta.env.DEV) {
        setEditCoverPreview(null);
      }
    } catch (error) {
      console.error("❌ Ошибка при сохранении трека:", error);
      const errorMessage = error?.message || "Неизвестная ошибка";
      alert(`Ошибка при сохранении трека: ${errorMessage}\n\nПроверьте консоль для деталей.`);
    } finally {
      setSaving(false);
      setUploadingCover(false);
    }
  };

  const handleCancelEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEditForm(false);
    setEditTitle(track.title);
    setEditLink(track.link || "");
    setEditCoverFile(null);
    setEditCoverPreview(null);
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверяем размер (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    setEditCoverFile(file);

    // Создаем превью
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onDelete) return;
    
    if (!confirm(`Удалить трек "${track.title}"?`)) {
      return;
    }
    
    try {
      await onDelete(track.id);
    } catch (error) {
      console.error("Error deleting track:", error);
      alert("Ошибка при удалении трека");
    }
  };

  const buttonStyle = {
    width: "28px",
    height: "28px",
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 10,
    transition: "all 0.2s",
    fontSize: "14px",
    color: "#fff",
  };

  // Получаем URL текущей обложки для превью
  const currentCoverUrl = useMemo(() => {
    if (editCoverPreview) return editCoverPreview;
    if (track.cover_key) return getR2Url(track.cover_key);
    return coverUrl;
  }, [editCoverPreview, track.cover_key, coverUrl]);

  // Автоматическая загрузка обложки при выборе файла
  const handleCoverFileChangeWithUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверяем размер (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB');
      return;
    }

    setEditCoverFile(file);

    // Создаем превью
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Автоматически загружаем обложку
    setUploadingCover(true);
    try {
      console.log("📤 Начинаем загрузку обложки...", { trackId: track.id, fileName: file.name, fileType: file.type });
      
      const uploadResult = await uploadCover({
        type: 'track_cover',
        id: track.id,
        file: file,
      });
      
      console.log("✅ Обложка загружена:", uploadResult);
      
      // Обновляем cover_key сразу
      if (onEdit) {
        await onEdit(track.id, {
          title: editTitle.trim(),
          link: editLink.trim(),
          cover_key: uploadResult.key,
          play_icon: editPlayIcon,
          preview_start_seconds: Number(editPreviewStartSeconds) || 0,
        });
        console.log("✅ cover_key обновлен в БД");
      }
    } catch (uploadError) {
      console.error("❌ Ошибка при загрузке обложки:", uploadError);
      
      // В локальной разработке просто сохраняем без загрузки в R2
      // Файл будет виден только локально через превью
      if (import.meta.env.DEV) {
        console.warn("⚠️ Локальная разработка: сохраняем без загрузки в R2 (CORS ограничение)");
        // Генерируем key для локальной разработки
        const tempKey = `tracks/${track.id}/cover.${file.type === 'image/jpeg' ? 'jpg' : 'png'}`;
        if (onEdit) {
          try {
            await onEdit(track.id, {
              title: editTitle.trim(),
              link: editLink.trim(),
              cover_key: tempKey,
              play_icon: editPlayIcon,
              preview_start_seconds: Number(editPreviewStartSeconds) || 0,
            });
            console.log("✅ cover_key сохранен в БД (локальная разработка)");
            // Превью остается видимым, так как файл не загружен в R2
          } catch (editError) {
            console.error("❌ Ошибка при сохранении cover_key (локальная разработка):", editError);
            // Не прерываем процесс
          }
        }
      } else {
        // В продакшене показываем ошибку
        const errorMessage = uploadError?.message || "Неизвестная ошибка";
        alert(`Ошибка при загрузке обложки: ${errorMessage}\n\nПроверьте консоль для деталей.`);
      }
    } finally {
      setUploadingCover(false);
    }
  };

  if (showEditForm && isOwner) {
    return (
      <div style={{ position: "relative", width: "100%", padding: "8px" }}>
        <div className="tc-card" style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "12px",
          padding: "16px",
          background: "linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(20, 20, 30, 0.5) 100%)",
          backdropFilter: "blur(20px)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}>
          {/* Превью обложки - компактное */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
            <label style={{ 
              fontSize: "11px", 
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Обложка
            </label>
            <div style={{ 
              width: "100%", 
              height: "120px", 
              borderRadius: "12px",
              overflow: "hidden",
              backgroundImage: `url(${currentCoverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              position: "relative",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)",
            }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleCoverFileChangeWithUpload}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingCover}
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "8px",
                  padding: "6px 14px",
                  background: uploadingCover 
                    ? "rgba(139, 92, 246, 0.7)" 
                    : "linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(124, 58, 237, 0.9) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  borderRadius: "8px",
                  color: "#fff",
                  cursor: uploadingCover ? "not-allowed" : "pointer",
                  fontSize: "11px",
                  fontWeight: 600,
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 2px 8px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!uploadingCover) {
                    e.target.style.background = "linear-gradient(135deg, rgba(139, 92, 246, 1) 0%, rgba(124, 58, 237, 1) 100%)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.5)";
                    e.target.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)";
                    e.target.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!uploadingCover) {
                    e.target.style.background = "linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(124, 58, 237, 0.9) 100%)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                    e.target.style.boxShadow = "0 2px 8px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                {uploadingCover ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <PremiumLoader size="small" message="uploading" />
                  </div>
                ) : editCoverFile ? "Изменить" : "Выбрать"}
              </button>
            </div>
            {editCoverFile && !uploadingCover && (
              <div style={{
                fontSize: "9px",
                color: "rgba(255, 255, 255, 0.4)",
                padding: "2px 4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {editCoverFile.name}
              </div>
            )}
          </div>

          {/* Поля ввода - компактные */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ 
                fontSize: "11px", 
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.85)",
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
                  padding: "10px 14px",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.background = "rgba(0, 0, 0, 0.5)";
                  e.target.style.borderColor = "rgba(139, 92, 246, 0.6)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.background = "rgba(0, 0, 0, 0.3)";
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
                  e.target.style.boxShadow = "none";
                }}
                autoFocus
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ 
                fontSize: "11px", 
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.85)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                Ссылка
              </label>
              <input
                type="url"
                value={editLink}
                onChange={(e) => setEditLink(e.target.value)}
                placeholder="https://www.youtube.com/..."
                style={{
                  padding: "10px 14px",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.background = "rgba(0, 0, 0, 0.5)";
                  e.target.style.borderColor = "rgba(139, 92, 246, 0.6)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.background = "rgba(0, 0, 0, 0.3)";
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <label style={{ 
                fontSize: "11px", 
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.85)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                Начало превью (сек)
              </label>
              <input
                type="number"
                value={editPreviewStartSeconds}
                onChange={(e) => setEditPreviewStartSeconds(Math.max(0, Number(e.target.value) || 0))}
                placeholder="0"
                min="0"
                style={{
                  padding: "10px 14px",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.target.style.background = "rgba(0, 0, 0, 0.5)";
                  e.target.style.borderColor = "rgba(139, 92, 246, 0.6)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.background = "rgba(0, 0, 0, 0.3)";
                  e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <div style={{ 
                fontSize: "10px", 
                color: "rgba(255, 255, 255, 0.5)",
                marginTop: "-2px",
              }}>
                Превью будет воспроизводиться 30 сек с этой секунды
              </div>
            </div>
          </div>

          {/* Выбор иконки плеера */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ 
              fontSize: "11px", 
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "4px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}>
              Иконка плеера
            </label>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "6px",
              padding: "10px",
              background: "rgba(0, 0, 0, 0.3)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.2)",
            }}>
              {PLAY_ICONS.map((icon) => {
                const isSelected = editPlayIcon === icon.id;
                return (
                  <button
                    key={icon.id}
                    type="button"
                    onClick={() => setEditPlayIcon(icon.id)}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      padding: "4px",
                      background: isSelected 
                        ? "linear-gradient(135deg, rgba(139, 92, 246, 0.4) 0%, rgba(124, 58, 237, 0.4) 100%)" 
                        : "rgba(255, 255, 255, 0.05)",
                      border: isSelected
                        ? "2px solid rgba(139, 92, 246, 0.9)"
                        : "1px solid rgba(255, 255, 255, 0.15)",
                      borderRadius: "8px",
                      boxShadow: isSelected 
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
                      if (!isSelected) {
                        e.target.style.background = "rgba(255, 255, 255, 0.1)";
                        e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                        e.target.style.transform = "scale(1.05)";
                        e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.target.style.background = "rgba(255, 255, 255, 0.05)";
                        e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
                        e.target.style.transform = "scale(1)";
                        e.target.style.boxShadow = "none";
                      }
                    }}
                    title={icon.name}
                  >
                    <img 
                      src={icon.icon} 
                      alt={icon.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        filter: isSelected ? "none" : "opacity(0.7)",
                      }}
                    />
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
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Кнопки - компактные */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{
                padding: "10px 20px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "10px",
                color: "rgba(255, 255, 255, 0.9)",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 600,
                transition: "all 0.2s ease",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.15)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.08)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={saving || !editTitle.trim()}
              style={{
                padding: "10px 24px",
                background: saving || !editTitle.trim()
                  ? "rgba(139, 92, 246, 0.4)" 
                  : "linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(124, 58, 237, 0.9) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "10px",
                color: "#fff",
                cursor: saving || !editTitle.trim() ? "not-allowed" : "pointer",
                fontSize: "12px",
                fontWeight: 600,
                opacity: saving || !editTitle.trim() ? 0.6 : 1,
                transition: "all 0.2s ease",
                backdropFilter: "blur(10px)",
                boxShadow: saving || !editTitle.trim() 
                  ? "none" 
                  : "0 2px 8px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
              }}
              onMouseEnter={(e) => {
                if (!saving && editTitle.trim()) {
                  e.target.style.background = "linear-gradient(135deg, rgba(139, 92, 246, 1) 0%, rgba(124, 58, 237, 1) 100%)";
                  e.target.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.3)";
                  e.target.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!saving && editTitle.trim()) {
                  e.target.style.background = "linear-gradient(135deg, rgba(139, 92, 246, 0.9) 0%, rgba(124, 58, 237, 0.9) 100%)";
                  e.target.style.boxShadow = "0 2px 8px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
                  e.target.style.transform = "translateY(0)";
                }
              }}
            >
              {saving ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <PremiumLoader size="small" message="saving" />
                </div>
              ) : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Проверяем, что slug существует
  if (!track?.slug) {
    console.warn("⚠️ TrackCard: track.slug отсутствует", track);
    return null;
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <Link 
        to={`/t/${track.slug}`}
        className="tc-card"
        style={{ 
          cursor: "pointer",
          textDecoration: "none",
          display: "flex",
          backgroundImage: `url(${coverUrl})`,
          position: "relative",
          zIndex: 1,
        }}
        onClick={(e) => {
          // Разрешаем переход по ссылке, если клик не на кнопку
          if (e.target.closest('button')) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {/* Бейдж источника в левом верхнем углу */}
        {track.source && (
          <div 
            className="tc-chip"
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              zIndex: 5,
            }}
          >
            {String(track.source || "").toUpperCase()}
          </div>
        )}

        {/* Круглая обложка сверху */}
        <div
          className="tc-cover"
          style={{ 
            backgroundImage: `url(${coverUrl})`,
          }}
          aria-hidden="true"
        >
          {/* Скрытое изображение для проверки загрузки R2 URL */}
          {track.cover_key && !editCoverPreview && (
            <img
              src={getR2Url(track.cover_key)}
              alt=""
              style={{ display: "none" }}
              onError={() => {
                console.warn("⚠️ Ошибка загрузки обложки из R2, используем дефолт:", getR2Url(track.cover_key));
                setCoverLoadError(true);
              }}
              onLoad={() => {
                setCoverLoadError(false);
              }}
            />
          )}
        </div>

        <div className="tc-right">
          {/* Название артиста под аватаркой */}
          <div className="tc-artist">{track.artistName}</div>
          
          {/* Название трека ниже */}
          <div className="tc-title">{track.title}</div>
        </div>
      </Link>

      {/* Кнопки действий (только для владельца) */}
      {isOwner && (
        <div style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          display: "flex",
          gap: "6px",
          zIndex: 10,
        }}>
          <button
            type="button"
            onClick={handleEdit}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(139, 92, 246, 0.8)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(0, 0, 0, 0.6)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={handleDelete}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(239, 68, 68, 0.8)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(0, 0, 0, 0.6)";
              e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      )}

      {/* Кнопка для копирования ссылки (видна всем) */}
      {!isOwner && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCopyLink(e);
          }}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            ...buttonStyle,
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(0, 0, 0, 0.8)";
            e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(0, 0, 0, 0.6)";
            e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
          }}
        >
          <img 
            src={copyIcon} 
            alt="Копировать ссылку"
            className="copy-icon"
          />
        </button>
      )}

      {/* Анимированное уведомление */}
      <CopyNotification 
        show={showNotification} 
        onClose={() => setShowNotification(false)} 
      />
    </div>
  );
}
