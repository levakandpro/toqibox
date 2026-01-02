import React, { useState, useEffect } from 'react';
import { supabase } from '../auth/supabaseClient.js';
import { PLAY_BUTTON_OPTIONS } from './playButtonOptions.js';

function ArtistPlayButtonSelector({ artist, isOwner, editMode, onUpdate }) {
  const [selectedButton, setSelectedButton] = useState(null);
  const [previewButton, setPreviewButton] = useState(null);
  const [saving, setSaving] = useState(false);

  // Загружаем выбранную кнопку
  useEffect(() => {
    if (artist?.id) {
      const stored = localStorage.getItem(`toqibox:playButton:${artist.id}`);
      if (stored) {
        const found = PLAY_BUTTON_OPTIONS.find(b => b.id === stored);
        if (found) {
          setSelectedButton(found.id);
          setPreviewButton(found.id);
          return;
        }
      }
      if (artist.play_button_id) {
        const found = PLAY_BUTTON_OPTIONS.find(b => b.id === artist.play_button_id);
        if (found) {
          setSelectedButton(found.id);
          setPreviewButton(found.id);
        } else {
          // Если не найден, используем базовый
          setSelectedButton('default');
          setPreviewButton('default');
        }
      } else {
        // Если ничего не выбрано, используем базовый
        setSelectedButton('default');
        setPreviewButton('default');
      }
    } else {
      // Если нет артиста, используем базовый
      setSelectedButton('default');
      setPreviewButton('default');
    }
  }, [artist?.id, artist?.play_button_id]);

  const handleSelectButton = (buttonId) => {
    setPreviewButton(buttonId);
  };

  const handleSave = async () => {
    if (!artist?.id || !isOwner || saving) return;

    setSaving(true);
    try {
      // Сохраняем в localStorage (всегда работает, даже если БД не доступна)
      localStorage.setItem(`toqibox:playButton:${artist.id}`, previewButton);
      console.log("✅ play_button_id saved to localStorage:", previewButton);

      // Пытаемся сохранить в БД (молча, без ошибок в консоли)
      // Если не получится - не страшно, localStorage уже сохранил
      try {
        await supabase
          .from("artists")
          .update({ play_button_id: previewButton })
          .eq("id", artist.id);
        // Молча игнорируем все ошибки - localStorage уже работает
      } catch (e) {
        // Молча игнорируем - localStorage уже сохранил
      }

      setSelectedButton(previewButton);

      // Отправляем событие для обновления TrackPlayer
      window.dispatchEvent(new Event('playButtonUpdated'));

      // Обновляем данные
      if (onUpdate) {
        onUpdate();
      }
    } catch (e) {
      // Даже при ошибке localStorage уже сохранил значение
      console.error("Error in handleSave (but localStorage saved):", e);
      setSelectedButton(previewButton); // Все равно обновляем состояние
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPreviewButton(selectedButton);
  };

  // Показываем только в режиме редактирования для владельца
  if (!isOwner || !editMode) {
    return null;
  }

  return (
    <div className="apbs-root">
      <div className="apbs-grid">
        {PLAY_BUTTON_OPTIONS.map((btn) => {
          const isSelected = previewButton === btn.id;
          const isActive = selectedButton === btn.id;
          
          return (
            <button
              key={btn.id}
              type="button"
              className={`apbs-item ${isSelected ? 'apbs-item-selected' : ''} ${isActive ? 'apbs-item-active' : ''}`}
              onClick={() => handleSelectButton(btn.id)}
              title={btn.name}
            >
              <div 
                className={`apbs-preview ${btn.component}`}
                dangerouslySetInnerHTML={{ __html: btn.html }}
              ></div>
              {isActive && (
                <div className="apbs-checkmark">✓</div>
              )}
            </button>
          );
        })}
      </div>
      
      {previewButton !== selectedButton && (
        <div className="apbs-actions">
          <button
            type="button"
            className="apbs-cancel"
            onClick={handleCancel}
            disabled={saving}
          >
            Отмена
          </button>
          <button
            type="button"
            className="apbs-save"
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

export default ArtistPlayButtonSelector;
