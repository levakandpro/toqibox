import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../../features/auth/supabaseClient.js";
import "../../styles/backgrounds.css";
import crownIcon from "../../assets/crown.png";

// Список фонов из backgrounds.css
// Первые 5 - бесплатные, остальные - премиум
const BACKGROUND_OPTIONS = Array.from({ length: 37 }, (_, i) => ({
  id: `bg-${i + 1}`,
  name: `Фон ${i + 1}`,
  className: `bg-${i + 1}`,
  premium: i >= 5, // Первые 5 (0-4) бесплатные, остальные премиум
}));

export default function ArtistPageBackgroundLeft({ artist, isOwner = false, editMode = false, onUpdate }) {
  // Устанавливаем дефолтное значение сразу (3-й вариант - индекс 2) для фото фонов
  const defaultBgId = BACKGROUND_OPTIONS[2]?.id; // bg-3 - третий вариант
  const [selectedBackground, setSelectedBackground] = useState(defaultBgId);
  const [saving, setSaving] = useState(false);
  const [previewBackground, setPreviewBackground] = useState(defaultBgId);

  // Проверяем премиум статус артиста
  const isPremium = useMemo(() => {
    if (!artist) return false;
    return !!(
      artist.premium_type && 
      artist.premium_until && 
      new Date(artist.premium_until) > new Date()
    );
  }, [artist]);

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
          return;
        }
      } else if (artist?.page_background_left_id) {
        // Если в localStorage нет, проверяем БД
        const found = BACKGROUND_OPTIONS.find(bg => bg.id === artist.page_background_left_id);
        if (found) {
          setSelectedBackground(found.id);
          setPreviewBackground(found.id);
          return;
        }
      }
      // Если ничего не найдено, используем дефолт (уже установлен в useState - 3-й вариант, индекс 2)
    }
  }, [artist?.id, artist?.page_background_left_id]);

  // Применяем фон строго только к контенту страницы (НЕ к шапке!)
  useEffect(() => {
    // Применяем фон к .a-content, а НЕ к .a-page, чтобы шапка не получала фон
    const contentElement = document.querySelector('.a-content');
    const pageElement = document.querySelector('.a-page');
    if (!contentElement || !pageElement) return;

    // Также проверяем, что классы не применяются к шапке и её элементам
    const headerRoot = document.querySelector('.ah-root');
    const headerCover = document.querySelector('.ah-cover');
    
    // Функция для очистки всех классов фонов
    const cleanupBackgroundStructures = () => {
      // Удаляем все классы фонов с контента И со страницы
      BACKGROUND_OPTIONS.forEach(option => {
        contentElement.classList.remove(option.className);
        pageElement.classList.remove(option.className);
        // Также удаляем из шапки и её корня, если они там есть
        if (headerRoot) {
          headerRoot.classList.remove(option.className);
        }
        if (headerCover) {
          headerCover.classList.remove(option.className);
        }
      });
    };

    if (previewBackground) {
      const bg = BACKGROUND_OPTIONS.find(b => b.id === previewBackground);
      if (bg) {
        // Очищаем все предыдущие фоны
        cleanupBackgroundStructures();
        
        // Добавляем класс выбранного фона ТОЛЬКО к контенту (НЕ к странице и НЕ к шапке!)
        contentElement.classList.add(bg.className);
        
        // Убеждаемся, что класс НЕ применяется к шапке и её элементам
        if (headerRoot && headerRoot.classList.contains(bg.className)) {
          headerRoot.classList.remove(bg.className);
        }
        if (headerCover && headerCover.classList.contains(bg.className)) {
          headerCover.classList.remove(bg.className);
        }
        if (pageElement && pageElement.classList.contains(bg.className)) {
          pageElement.classList.remove(bg.className);
        }
      }
    } else {
      // Удаляем фон если не выбран
      cleanupBackgroundStructures();
    }

    // СТРОГО запрещаем применение классов к шапке и странице - проверяем постоянно
    const checkInterval = setInterval(() => {
      if (headerRoot || headerCover || pageElement) {
        BACKGROUND_OPTIONS.forEach(option => {
          // Удаляем из корня шапки
          if (headerRoot && headerRoot.classList.contains(option.className)) {
            headerRoot.classList.remove(option.className);
          }
          // Удаляем из обложки шапки
          if (headerCover && headerCover.classList.contains(option.className)) {
            headerCover.classList.remove(option.className);
          }
          // Удаляем из страницы (фоны должны быть только в контенте)
          if (pageElement && pageElement.classList.contains(option.className)) {
            pageElement.classList.remove(option.className);
          }
          // Удаляем из ВСЕХ дочерних элементов шапки
          if (headerRoot) {
            const childrenWithBg = headerRoot.querySelectorAll(`.${option.className}`);
            childrenWithBg.forEach(el => el.classList.remove(option.className));
          }
          if (headerCover) {
            const childrenWithBg = headerCover.querySelectorAll(`.${option.className}`);
            childrenWithBg.forEach(el => el.classList.remove(option.className));
          }
        });
      }
    }, 50); // Проверяем каждые 50ms для максимальной защиты

    return () => {
      clearInterval(checkInterval);
      // Очистка при размонтировании компонента
      cleanupBackgroundStructures();
    };
  }, [previewBackground]);

  const handleSelectBackground = (bgId) => {
    const bg = BACKGROUND_OPTIONS.find(b => b.id === bgId);
    // Блокируем выбор премиум фонов для бесплатных пользователей
    if (bg?.premium && !isPremium) {
      alert('Этот фон доступен только для премиум пользователей. Обратитесь к администратору для получения доступа.');
      return;
    }
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
    <div className="apb-left-root" data-visible="true">
      <div className="apb-left-title">ФОНЫ</div>
      <div className="apb-left-grid">
        {BACKGROUND_OPTIONS.map((bg) => {
          const isSelected = previewBackground === bg.id;
          const isActive = selectedBackground === bg.id;
          const isPremiumBg = bg.premium === true;
          const isLocked = isPremiumBg && !isPremium;
          
          return (
            <button
              key={bg.id}
              type="button"
              className={`apb-left-item ${isSelected ? 'apb-left-item-selected' : ''} ${isActive ? 'apb-left-item-active' : ''} ${isLocked ? 'apb-left-item-locked' : ''}`}
              onClick={() => handleSelectBackground(bg.id)}
              disabled={isLocked}
            >
              <div className={`apb-left-preview ${bg.className}`}></div>
              {isActive && (
                <div className="apb-left-checkmark">✓</div>
              )}
              {isLocked && (
                <>
                  <div className="apb-premium-badge">
                    <img src={crownIcon} alt="Premium" />
                  </div>
                  <div className="apb-premium-overlay">
                    <div className="apb-premium-text">
                      <div>подключите</div>
                      <div>тариф ПРЕМИУМ</div>
                    </div>
                  </div>
                </>
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

