import React, { useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import coverDefault from "../../assets/cover.png";
import copyIcon from "../../assets/copy-white.svg";
import CopyNotification from "../../ui/CopyNotification.jsx";
import { uploadCover, getR2Url } from "../../utils/r2Upload.js";

export default function TrackCard({ track, isOwner = false, onEdit, onDelete }) {
  const [showNotification, setShowNotification] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editTitle, setEditTitle] = useState(track.title);
  const [editLink, setEditLink] = useState(track.link || "");
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef(null);

  // Получаем обложку: сначала превью, потом кастомная из R2, потом cover.png по умолчанию
  const coverUrl = useMemo(() => {
    // Если есть превью (только что выбранный файл), показываем его
    if (editCoverPreview) {
      return editCoverPreview;
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
  }, [track.cover_key, track.coverUrl, editCoverPreview]);

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
      });
      
      setShowEditForm(false);
      setEditCoverFile(null);
      // В dev режиме оставляем превью, чтобы обложка была видна (файл не загружен в R2)
      // В продакшене очищаем превью, так как файл загружен в R2 и будет отображаться оттуда
      if (!import.meta.env.DEV) {
        setEditCoverPreview(null);
      }
    } catch (error) {
      console.error("Error updating track:", error);
      alert("Ошибка при сохранении трека");
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
          await onEdit(track.id, {
            title: editTitle.trim(),
            link: editLink.trim(),
            cover_key: tempKey,
          });
          console.log("✅ cover_key сохранен в БД (локальная разработка)");
          // Превью остается видимым, так как файл не загружен в R2
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
          gap: "8px",
          padding: "12px",
          background: "rgba(0, 0, 0, 0.4)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}>
          {/* Превью обложки - компактное */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
            <label style={{ 
              fontSize: "10px", 
              color: "rgba(255, 255, 255, 0.6)",
              marginBottom: "2px",
            }}>
              Обложка
            </label>
            <div style={{ 
              width: "100%", 
              height: "100px", 
              borderRadius: "8px",
              overflow: "hidden",
              backgroundImage: `url(${currentCoverUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              position: "relative",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
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
                  bottom: "6px",
                  right: "6px",
                  padding: "4px 10px",
                  background: uploadingCover ? "rgba(139, 92, 246, 0.6)" : "rgba(0, 0, 0, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  borderRadius: "6px",
                  color: "#fff",
                  cursor: uploadingCover ? "not-allowed" : "pointer",
                  fontSize: "10px",
                  fontWeight: 500,
                  backdropFilter: "blur(10px)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!uploadingCover) {
                    e.target.style.background = "rgba(139, 92, 246, 0.8)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.6)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!uploadingCover) {
                    e.target.style.background = "rgba(0, 0, 0, 0.8)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.4)";
                  }
                }}
              >
                {uploadingCover ? "Загрузка..." : editCoverFile ? "Изменить" : "Выбрать"}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Название трека"
              style={{
                padding: "6px 10px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "12px",
                outline: "none",
              }}
              autoFocus
            />
            <input
              type="url"
              value={editLink}
              onChange={(e) => setEditLink(e.target.value)}
              placeholder="Ссылка на YouTube"
              style={{
                padding: "6px 10px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>
          
          {/* Кнопки - компактные */}
          <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", marginTop: "4px" }}>
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{
                padding: "5px 10px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
                color: "#fff",
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={saving || !editTitle.trim()}
              style={{
                padding: "5px 10px",
                background: saving ? "rgba(255, 255, 255, 0.2)" : "rgba(139, 92, 246, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
                color: "#fff",
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: "11px",
                opacity: saving || !editTitle.trim() ? 0.5 : 1,
              }}
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </div>
      </div>
    );
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
        />

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
          onClick={handleCopyLink}
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
