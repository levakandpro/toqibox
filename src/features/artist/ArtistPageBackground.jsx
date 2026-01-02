import React, { useState, useEffect } from "react";
import { supabase } from "../../features/auth/supabaseClient.js";

// Список фонов с uiverse.io
const BACKGROUND_OPTIONS = [
  {
    id: "foolish-badger-92",
    name: "Neon Circuit",
    url: "https://uiverse.io/chase2k25/foolish-badger-92",
    component: "neon-circuit",
  },
  {
    id: "smart-lionfish-44",
    name: "Matrix",
    url: "https://uiverse.io/bianca-git/smart-lionfish-44",
    component: "matrix-container",
  },
  {
    id: "clever-puma-91",
    name: "Rain",
    url: "https://uiverse.io/marsella_3472/clever-puma-91",
    component: "rain-container",
  },
  {
    id: "quiet-snail-9",
    name: "Rain Blue",
    url: "https://uiverse.io/SelfMadeSystem/quiet-snail-9",
    component: "rain-blue-container",
  },
  {
    id: "afraid-sheep-52",
    name: "Grid",
    url: "https://uiverse.io/jeremyssocial/afraid-sheep-52",
    component: "grid-container",
  },
  {
    id: "rude-sheep-6",
    name: "Dots",
    url: "https://uiverse.io/escannord/rude-sheep-6",
    component: "dots-container",
  },
  {
    id: "grumpy-owl-55",
    name: "Pattern",
    url: "https://uiverse.io/vikas7754/grumpy-owl-55",
    component: "pattern-container",
  },
  {
    id: "good-pig-85",
    name: "Square Pattern",
    url: "https://uiverse.io/denverdelamasa/good-pig-85",
    component: "square-pattern",
  },
  {
    id: "chilly-robin-0",
    name: "Scan Lines",
    url: "https://uiverse.io/SelfMadeSystem/chilly-robin-0",
    component: "scanlines-container",
  },
  {
    id: "bad-snake-37",
    name: "Gradient",
    url: "https://uiverse.io/mihocsaszilard/bad-snake-37",
    component: "gradient-container",
  },
  {
    id: "sweet-dolphin-36",
    name: "Rain Blur",
    url: "https://uiverse.io/SelfMadeSystem/sweet-dolphin-36",
    component: "rain-blur-container",
  },
  {
    id: "old-badger-37",
    name: "Rain Hue",
    url: "https://uiverse.io/SelfMadeSystem/old-badger-37",
    component: "rain-hue-container",
  },
  {
    id: "warm-lion-64",
    name: "Rain Blur 2",
    url: "https://uiverse.io/SelfMadeSystem/warm-lion-64",
    component: "rain-blur2-container",
  },
  {
    id: "great-fish-97",
    name: "Flashlight",
    url: "https://uiverse.io/Cobp/great-fish-97",
    component: "flashlight-container",
  },
];

export default function ArtistPageBackground({ artist, isOwner = false, editMode = false, onUpdate }) {
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewBackground, setPreviewBackground] = useState(null);

  // Загружаем сохраненный фон
  useEffect(() => {
    if (artist?.id) {
      // Сначала проверяем localStorage
      const saved = localStorage.getItem(`toqibox:pageBackground:${artist.id}`);
      if (saved) {
        const found = BACKGROUND_OPTIONS.find(bg => bg.id === saved);
        if (found) {
          setSelectedBackground(found.id);
          setPreviewBackground(found.id);
        }
      } else if (artist?.page_background_id) {
        // Если в localStorage нет, проверяем БД
        const found = BACKGROUND_OPTIONS.find(bg => bg.id === artist.page_background_id);
        if (found) {
          setSelectedBackground(found.id);
          setPreviewBackground(found.id);
        }
      }
    }
  }, [artist?.id, artist?.page_background_id]);

  // Применяем фон только к шапке артиста
  useEffect(() => {
    const headerCover = document.querySelector('.ah-cover');
    if (!headerCover) return;

    // Создаем или находим внутренний элемент для фона
    let bgElement = headerCover.querySelector('.ah-cover-background');
    if (!bgElement) {
      bgElement = document.createElement('div');
      bgElement.className = 'ah-cover-background';
      bgElement.style.position = 'absolute';
      bgElement.style.inset = '0';
      bgElement.style.width = '100%';
      bgElement.style.height = '100%';
      bgElement.style.zIndex = '0';
      headerCover.appendChild(bgElement);
    }

    // Функция для очистки всех структур фонов
    const cleanupBackgroundStructures = () => {
      // Удаляем все классы фонов
      BACKGROUND_OPTIONS.forEach(option => {
        bgElement.classList.remove(option.component);
      });
      
      // Удаляем все структуры фонов
      const glowOverlay = bgElement.querySelector('.glow-overlay');
      if (glowOverlay) {
        glowOverlay.remove();
      }
      
      const matrixPatterns = bgElement.querySelectorAll('.matrix-pattern');
      matrixPatterns.forEach(p => p.remove());
    };

    if (previewBackground) {
      const bg = BACKGROUND_OPTIONS.find(b => b.id === previewBackground);
      if (bg) {
        // Очищаем все предыдущие фоны
        cleanupBackgroundStructures();
        
        // Добавляем класс выбранного фона к внутреннему элементу
        bgElement.classList.add(bg.component);
        // Убираем backgroundImage у основного элемента
        headerCover.style.backgroundImage = 'none';
        
        // Для neon-circuit добавляем SVG фильтр и структуру
        if (bg.component === 'neon-circuit') {
          // Добавляем SVG фильтр
          let svgFilter = document.getElementById('circuit-texture-filter');
          if (!svgFilter) {
            svgFilter = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgFilter.id = 'circuit-texture-filter';
            svgFilter.setAttribute('class', 'texture-filter');
            svgFilter.style.position = 'absolute';
            svgFilter.style.width = '0';
            svgFilter.style.height = '0';
            
            const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
            filter.id = 'circuit-texture';
            
            const feTurbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
            feTurbulence.setAttribute('type', 'turbulence');
            feTurbulence.setAttribute('baseFrequency', '0.05');
            feTurbulence.setAttribute('numOctaves', '2');
            feTurbulence.setAttribute('result', 'noise');
            
            const feDisplacementMap = document.createElementNS('http://www.w3.org/2000/svg', 'feDisplacementMap');
            feDisplacementMap.setAttribute('in', 'SourceGraphic');
            feDisplacementMap.setAttribute('in2', 'noise');
            feDisplacementMap.setAttribute('scale', '10');
            feDisplacementMap.setAttribute('xChannelSelector', 'R');
            feDisplacementMap.setAttribute('yChannelSelector', 'G');
            feDisplacementMap.setAttribute('result', 'displace');
            
            const feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
            feColorMatrix.setAttribute('type', 'matrix');
            feColorMatrix.setAttribute('values', '0 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0');
            feColorMatrix.setAttribute('result', 'color');
            
            const feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
            feComposite.setAttribute('in', 'color');
            feComposite.setAttribute('in2', 'SourceGraphic');
            feComposite.setAttribute('operator', 'over');
            feComposite.setAttribute('result', 'final');
            
            filter.appendChild(feTurbulence);
            filter.appendChild(feDisplacementMap);
            filter.appendChild(feColorMatrix);
            filter.appendChild(feComposite);
            svgFilter.appendChild(filter);
            document.body.appendChild(svgFilter);
          }
          
          // Добавляем структуру для neon-circuit
          let glowOverlay = bgElement.querySelector('.glow-overlay');
          if (!glowOverlay) {
            glowOverlay = document.createElement('span');
            glowOverlay.className = 'glow-overlay';
            bgElement.appendChild(glowOverlay);
          }
        }
        
        // Для matrix-container добавляем структуру
        if (bg.component === 'matrix-container') {
          // Создаем несколько паттернов с колонками
          for (let p = 0; p < 5; p++) {
            const pattern = document.createElement('div');
            pattern.className = 'matrix-pattern';
            for (let i = 0; i < 40; i++) {
              const column = document.createElement('div');
              column.className = 'matrix-column';
              column.style.left = `${i * 25}px`;
              column.style.animationDelay = `${-Math.random() * 4}s`;
              column.style.animationDuration = `${2.5 + Math.random() * 2}s`;
              pattern.appendChild(column);
            }
            bgElement.appendChild(pattern);
          }
        }
      }
    } else {
      // Удаляем фон если не выбран - возвращаем обычную обложку
      cleanupBackgroundStructures();
      // Восстанавливаем backgroundImage
      headerCover.style.backgroundImage = '';
    }

    return () => {
      // Очистка при размонтировании компонента
      cleanupBackgroundStructures();
      if (headerCover) {
        headerCover.style.backgroundImage = '';
      }
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
      localStorage.setItem(`toqibox:pageBackground:${artist.id}`, previewBackground);

      // Пытаемся сохранить в БД (если поле существует)
      try {
        const { error } = await supabase
          .from("artists")
          .update({ page_background_id: previewBackground })
          .eq("id", artist.id);

        if (error) {
          // Игнорируем ошибку, если поле не существует в БД или есть проблемы с правами
          // Сохранение в localStorage уже работает
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
            // Поле не существует или нет прав - это нормально, используем только localStorage
            console.log("ℹ️ page_background_id field not in DB or no permissions, using localStorage only");
          } else if (errorCode === 'PGRST116' || errorCode === '23505') {
            // Ошибка RLS или конфликт - тоже нормально для dev режима
            console.log("ℹ️ RLS policy blocked update or conflict, using localStorage only");
          } else {
            // Другая ошибка - логируем детально для диагностики
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
        // Игнорируем ошибки БД - localStorage уже сохранил значение
        console.log("ℹ️ Using localStorage only for page background:", e.message);
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
    <div className="apb-root">
      <div className="apb-title">ФОНЫ</div>
      <div className="apb-grid">
        {BACKGROUND_OPTIONS.map((bg) => {
          const isSelected = previewBackground === bg.id;
          const isActive = selectedBackground === bg.id;
          
          return (
            <button
              key={bg.id}
              type="button"
              className={`apb-item ${isSelected ? 'apb-item-selected' : ''} ${isActive ? 'apb-item-active' : ''}`}
              onClick={() => handleSelectBackground(bg.id)}
              title={bg.name}
            >
              <div className={`apb-preview ${bg.component}`}></div>
              {isActive && (
                <div className="apb-checkmark">✓</div>
              )}
            </button>
          );
        })}
      </div>
      
      {isChanged && (
        <div className="apb-actions">
          <button
            type="button"
            className="apb-btn apb-btn-cancel"
            onClick={handleCancel}
          >
            Отмена
          </button>
          <button
            type="button"
            className="apb-btn apb-btn-save"
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

