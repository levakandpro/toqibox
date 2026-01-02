import React, { useState, useEffect } from "react";
import { supabase } from "../../features/auth/supabaseClient.js";
import "../../styles/backgrounds.css";

// Список фонов из backgrounds.css
const BACKGROUND_OPTIONS = Array.from({ length: 37 }, (_, i) => ({
  id: `bg-${i + 1}`,
  name: `Фон ${i + 1}`,
  className: `bg-${i + 1}`,
}));

export default function ArtistPageBackgroundLeft({ artist, isOwner = false, editMode = false, onUpdate }) {
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewBackground, setPreviewBackground] = useState(null);

  // Загружаем сохраненный фон
  useEffect(() => {
    if (artist?.id) {
      // Сначала проверяем localStorage
      const saved = localStorage.getItem(`toqibox:pageBackgroundLeft:${artist.id}`);
      if (saved) {
        const found = BACKGROUND_OPTIONS.find(bg => bg.id === saved);
        if (found) {
          setSelectedBackground(found.id);
          setPreviewBackground(found.id);
        }
      } else if (artist?.page_background_left_id) {
        // Если в localStorage нет, проверяем БД
        const found = BACKGROUND_OPTIONS.find(bg => bg.id === artist.page_background_left_id);
        if (found) {
          setSelectedBackground(found.id);
          setPreviewBackground(found.id);
        }
      }
    }
  }, [artist?.id, artist?.page_background_left_id]);

  // Применяем фон к фону страницы
  useEffect(() => {
    const pageElement = document.querySelector('.a-page');
    if (!pageElement) return;

    // Функция для очистки всех классов фонов
    const cleanupBackgroundStructures = () => {
      // Удаляем все классы фонов со страницы
      BACKGROUND_OPTIONS.forEach(option => {
        pageElement.classList.remove(option.className);
      });
    };

    if (previewBackground) {
      const bg = BACKGROUND_OPTIONS.find(b => b.id === previewBackground);
      if (bg) {
        // Очищаем все предыдущие фоны
        cleanupBackgroundStructures();
        
        // Добавляем класс выбранного фона к странице
        pageElement.classList.add(bg.className);
      }
    } else {
      // Удаляем фон если не выбран
      cleanupBackgroundStructures();
    }

    return () => {
      // Очистка при размонтировании компонента
      cleanupBackgroundStructures();
    };
  }, [previewBackground]);

  const handleSelectBackground = (bgId) => {
    setPreviewBackground(bgId);
  };

  const handleSave = async () => {
    if (!artist?.id || !isOwner || saving || !previewBackground) return;

    setSaving(true);
    try {
      // Сохраняем в localStorage
      localStorage.setItem(`toqibox:pageBackgroundLeft:${artist.id}`, previewBackground);

      // Пытаемся сохранить в БД (если поле существует)
      try {
        const { error } = await supabase
          .from("artists")
          .update({ page_background_left_id: previewBackground })
          .eq("id", artist.id);

        if (error) {
          // Игнорируем ошибку, если поле не существует в БД или есть проблемы с правами
          const errorMsg = error.message?.toLowerCase() || '';
          const errorCode = error.code || '';
          
          if (
            errorCode === '42703' || 
            errorCode === '42P01' ||
            errorMsg.includes('column') || 
            errorMsg.includes('does not exist') ||
            errorMsg.includes('permission denied') ||
            errorCode === '42501'
          ) {
            console.log("ℹ️ page_background_left_id field not in DB or no permissions, using localStorage only");
          } else if (errorCode === 'PGRST116' || errorCode === '23505') {
            console.log("ℹ️ RLS policy blocked update or conflict, using localStorage only");
          } else {
            console.warn("⚠️ Could not save to DB:", {
              message: error.message,
              code: errorCode,
              details: error.details,
              hint: error.hint,
              artistId: artist.id
            });
          }
        }
      } catch (e) {
        console.log("ℹ️ Using localStorage only for page background left:", e.message);
      }

      setSelectedBackground(previewBackground);

      // Обновляем данные
      if (onUpdate) {
        onUpdate();
      }
    } catch (e) {
      console.error("Error saving background:", e);
      alert("Ошибка при сохранении фона: " + (e.message || "Неизвестная ошибка"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPreviewBackground(selectedBackground);
  };

  const isChanged = previewBackground !== selectedBackground;

  // Показываем только в режиме редактирования для владельца
  if (!isOwner || !editMode) {
    return null;
  }

  return (
    <div className="apb-left-root">
      <div className="apb-left-title">ФОНЫ</div>
      <div className="apb-left-grid">
        {BACKGROUND_OPTIONS.map((bg) => {
          const isSelected = previewBackground === bg.id;
          const isActive = selectedBackground === bg.id;
          
          return (
            <button
              key={bg.id}
              type="button"
              className={`apb-left-item ${isSelected ? 'apb-left-item-selected' : ''} ${isActive ? 'apb-left-item-active' : ''}`}
              onClick={() => handleSelectBackground(bg.id)}
              title={bg.name}
            >
              <div className={`apb-left-preview ${bg.className}`}></div>
              {isActive && (
                <div className="apb-left-checkmark">✓</div>
              )}
            </button>
          );
        })}
      </div>
      
      {isChanged && (
        <div className="apb-left-actions">
          <button
            type="button"
            className="apb-left-btn apb-left-btn-cancel"
            onClick={handleCancel}
          >
            Отмена
          </button>
          <button
            type="button"
            className="apb-left-btn apb-left-btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      )}
    </div>
  );
}

