import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "../../features/auth/supabaseClient.js";
import { ARTIST_HEADER_BACKGROUNDS } from "../../utils/artistHeaderBackgrounds.js";
import VantaPreview from "../track/VantaPreview.jsx";
import VantaHeaderBackground from "./VantaHeaderBackground.jsx";
import ShaderToyPreview from "../track/ShaderToyPreview.jsx";
import ShaderToyBackground from "../track/ShaderToyBackground.jsx";
import crownIcon from "../../assets/crown.png";

// Список CSS-эффектов с uiverse.io
const CSS_BACKGROUND_OPTIONS = [
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

// Фоны для шапки страницы автора - ОТДЕЛЬНЫЙ список, НЕ из треков!
const BACKGROUND_OPTIONS = ARTIST_HEADER_BACKGROUNDS;


export default function ArtistPageBackground({ artist, isOwner = false, editMode = false, onUpdate }) {
  // Устанавливаем дефолтное значение сразу (1-й вариант - индекс 0) для видео фонов
  const defaultBgId = BACKGROUND_OPTIONS[0]?.id; // Первый доступный фон
  const [selectedBackground, setSelectedBackground] = useState(defaultBgId);
  const [saving, setSaving] = useState(false);
  const [previewBackground, setPreviewBackground] = useState(defaultBgId);
  const vantaRootRef = useRef(null);
  const vantaContainerRef = useRef(null);
  const videoElementsRef = useRef(new Set()); // Храним ссылки на все видео элементы
  const isInitializedRef = useRef(false); // Флаг инициализации
  const lastBackgroundRef = useRef(null); // Последний примененный фон
  const appliedBackgroundRef = useRef(null); // Фон, который реально применен

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
      // Находим первый бесплатный фон
      const firstFreeBg = BACKGROUND_OPTIONS.find(bg => !bg.premium) || BACKGROUND_OPTIONS[0];
      const defaultBgId = firstFreeBg?.id;
      
      let bgToSet = defaultBgId; // По умолчанию используем первый бесплатный
      
      // Сначала проверяем localStorage
      const saved = localStorage.getItem(`toqibox:pageBackground:${artist.id}`);
      if (saved) {
        const found = BACKGROUND_OPTIONS.find(bg => bg.id === saved);
        if (found) {
          // Проверяем, доступен ли сохраненный фон пользователю
          if (!found.premium || isPremium) {
            // Если фон бесплатный ИЛИ у пользователя есть премиум статус, используем сохраненный
            bgToSet = found.id;
          }
        }
      } else if (artist?.page_background_id) {
        // Если в localStorage нет, проверяем БД
        const found = BACKGROUND_OPTIONS.find(bg => bg.id === artist.page_background_id);
        if (found) {
          // Проверяем, доступен ли сохраненный фон пользователю
          if (!found.premium || isPremium) {
            // Если фон бесплатный ИЛИ у пользователя есть премиум статус, используем из БД
            bgToSet = found.id;
          }
        }
      }
      
      // Всегда устанавливаем фон (либо сохраненный, либо дефолтный)
      setSelectedBackground(bgToSet);
      setPreviewBackground(bgToSet);
    } else {
      // Если artist еще не загружен, устанавливаем дефолтный фон
      const firstFreeBg = BACKGROUND_OPTIONS.find(bg => !bg.premium) || BACKGROUND_OPTIONS[0];
      const defaultBgId = firstFreeBg?.id;
      if (defaultBgId) {
        setSelectedBackground(defaultBgId);
        setPreviewBackground(defaultBgId);
      }
    }
  }, [artist?.id, artist?.page_background_id, isPremium]);

  // Применяем фон только к шапке артиста
  useEffect(() => {
    // Ждем, пока .ah-cover появится в DOM (может быть создан позже)
    const findHeaderCover = () => {
      return document.querySelector('.ah-cover');
    };
    
    let headerCover = findHeaderCover();
    if (!headerCover) {
      // Пробуем найти через интервал (на случай, если компонент еще монтируется)
      let attempts = 0;
      const maxAttempts = 50; // 5 секунд максимум
      const checkInterval = setInterval(() => {
        attempts++;
        headerCover = findHeaderCover();
        if (headerCover) {
          clearInterval(checkInterval);
          // Применяем фон после того, как нашли элемент
          applyBackground(headerCover);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.warn('ArtistPageBackground: .ah-cover not found after', maxAttempts, 'attempts');
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
    
    // Если элемент уже есть, применяем фон сразу
    applyBackground(headerCover);
    
    function applyBackground(headerCover) {
      if (!headerCover) {
        console.warn('ArtistPageBackground: applyBackground called with null headerCover');
        return () => {};
      }
      
      console.log('ArtistPageBackground: applyBackground called', {
        previewBackground,
        selectedBackground,
        defaultBg: BACKGROUND_OPTIONS[0]?.id
      });
      
      // Определяем фон для применения (previewBackground и selectedBackground уже должны быть проверены на доступность)
      const backgroundToApply = previewBackground || selectedBackground || BACKGROUND_OPTIONS[0]?.id;
    
    // Создаем или находим внутренний элемент для фона
    let bgElement = headerCover.querySelector('.ah-cover-background');
    
    console.log('ArtistPageBackground: Applying background', backgroundToApply);
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

    // Сохраняем текущий фон для проверки изменений
    const currentBgId = bgElement.getAttribute('data-current-bg');
    
    // Функция для очистки всех структур фонов (НО НЕ ВИДЕО!)
    const cleanupBackgroundStructures = () => {
      // Удаляем все классы CSS-эффектов
      CSS_BACKGROUND_OPTIONS.forEach(option => {
        bgElement.classList.remove(option.component);
      });
      
      // Удаляем все структуры фонов
      const glowOverlay = bgElement.querySelector('.glow-overlay');
      if (glowOverlay) {
        glowOverlay.remove();
      }
      
      const matrixPatterns = bgElement.querySelectorAll('.matrix-pattern');
      matrixPatterns.forEach(p => p.remove());
      
      // Удаляем iframe, но НЕ удаляем video элементы - они должны оставаться!
      const iframes = bgElement.querySelectorAll('iframe');
      iframes.forEach(iframe => iframe.remove());
      
      // НЕ удаляем видео - они должны зацикливаться бесконечно!
      // const videos = bgElement.querySelectorAll('video');
      // videos.forEach(video => video.remove());
      
      // НИКОГДА не удаляем Vanta/ShaderToy компоненты - они должны оставаться всегда!
      // Удаление компонентов приводит к исчезновению фонов
      // if (vantaRootRef.current) {
      //   ... удалено - не удаляем компоненты
      // }
      // if (vantaContainerRef.current) {
      //   ... удалено - не удаляем контейнеры
      // }
    };

    // Используем backgroundToApply, который уже определен выше
    const bg = BACKGROUND_OPTIONS.find(b => b.id === backgroundToApply);
    if (bg) {
      // Проверяем, существует ли контейнер в DOM
      const containerExists = vantaContainerRef.current && 
                              vantaContainerRef.current.parentNode && 
                              document.contains(vantaContainerRef.current);
      
      // Если фон изменился ИЛИ еще не установлен (currentBgId === null) ИЛИ контейнер не существует, создаем/обновляем контейнеры
      const shouldCreateNew = currentBgId !== backgroundToApply || !containerExists;
      if (shouldCreateNew) {
        // Если был предыдущий фон, очищаем его ОТЛОЖЕННО (чтобы избежать ошибки синхронного unmount)
        if (currentBgId !== null) {
          console.log('Background changed, removing old containers and creating new ones');
          // Очищаем CSS классы
          CSS_BACKGROUND_OPTIONS.forEach(option => {
            bgElement.classList.remove(option.component);
          });
          const glowOverlay = bgElement.querySelector('.glow-overlay');
          if (glowOverlay) {
            glowOverlay.remove();
          }
          const matrixPatterns = bgElement.querySelectorAll('.matrix-pattern');
          matrixPatterns.forEach(p => p.remove());
          const iframes = bgElement.querySelectorAll('iframe');
          iframes.forEach(iframe => iframe.remove());
          
          // УДАЛЯЕМ старые контейнеры ShaderToy/Vanta при смене фона ОТЛОЖЕННО
          const oldContainer = vantaContainerRef.current;
          const oldRoot = vantaRootRef.current;
          vantaContainerRef.current = null;
          vantaRootRef.current = null;
          
          // Откладываем удаление до следующего тика, чтобы избежать ошибки синхронного unmount
          setTimeout(() => {
            if (oldRoot) {
              try {
                oldRoot.unmount();
              } catch (e) {
                console.warn('Error unmounting React root:', e);
              }
            }
            if (oldContainer && oldContainer.parentNode) {
              oldContainer.remove();
            }
          }, 0);
        } else {
          console.log('First time applying background, creating containers');
        }
        
        // Сбрасываем флаги инициализации
        isInitializedRef.current = false;
        appliedBackgroundRef.current = null;
      }
      
      // Сохраняем текущий фон
      bgElement.setAttribute('data-current-bg', backgroundToApply);
      lastBackgroundRef.current = backgroundToApply;
      appliedBackgroundRef.current = backgroundToApply; // Сохраняем примененный фон
      isInitializedRef.current = true;
      
      // Убираем backgroundImage у основного элемента СТРОГО
      headerCover.style.backgroundImage = 'none';
      headerCover.style.setProperty('background-image', 'none', 'important');
      // Также убираем через classList если есть
      headerCover.classList.remove('ah-cover-with-bg');
      
      // ShaderToy WebGL фоны (не iframe, а WebGL рендеринг)
      if (bg.type === 'shadertoy' && bg.shaderId) {
          console.log('ArtistPageBackground: Applying ShaderToy background', { bgId: bg.id, shaderId: bg.shaderId, backgroundToApply, shouldCreateNew });
          // Если нужно создать новый, всегда создаем контейнер
          if (shouldCreateNew || !containerExists) {
            console.log('ArtistPageBackground: Creating new ShaderToy container');
            const shaderContainer = document.createElement('div');
            shaderContainer.style.position = 'absolute';
            shaderContainer.style.top = '0';
            shaderContainer.style.left = '0';
            shaderContainer.style.width = '100%';
            shaderContainer.style.height = '100%';
            shaderContainer.style.zIndex = '0';
            shaderContainer.style.pointerEvents = 'none';
            bgElement.appendChild(shaderContainer);
            console.log('ArtistPageBackground: Shader container appended to bgElement', { bgElement: !!bgElement, shaderContainer: !!shaderContainer });
            
            // Создаем React root и рендерим ShaderToy компонент ТОЛЬКО ОДИН РАЗ
            if (!vantaRootRef.current) {
              console.log('ArtistPageBackground: Creating React root for ShaderToy', { bgId: bg.id });
              const shaderRoot = createRoot(shaderContainer);
              shaderRoot.render(
                <ShaderToyBackground backgroundId={bg.id} />
              );
              
              // Сохраняем root для cleanup
              vantaRootRef.current = shaderRoot;
              console.log('ShaderToy container created and initialized', { bgId: bg.id, shaderId: bg.shaderId });
            } else {
              console.log('ShaderToy root already exists, NOT re-rendering to prevent destruction');
            }
            
            // Сохраняем контейнер
            vantaContainerRef.current = shaderContainer;
          } else {
            // Если контейнер уже есть, НЕ ДЕЛАЕМ НИЧЕГО - оставляем как есть!
            console.log('ShaderToy container already exists in DOM, keeping it untouched');
          }
        }
        // Vanta WebGL фоны
        else if (bg.type === 'vanta' && bg.effectType) {
          // Если нужно создать новый, всегда создаем контейнер
          if (shouldCreateNew || !containerExists) {
            console.log('Creating Vanta background:', bg.effectType);
            // Создаем контейнер для Vanta компонента
            vantaContainerRef.current = document.createElement('div');
            vantaContainerRef.current.style.position = 'absolute';
            vantaContainerRef.current.style.top = '0';
            vantaContainerRef.current.style.left = '0';
            vantaContainerRef.current.style.width = '100%';
            vantaContainerRef.current.style.height = '100%';
            vantaContainerRef.current.style.zIndex = '0';
            bgElement.appendChild(vantaContainerRef.current);
            console.log('Vanta container created and appended to bgElement');
            
            // Создаем React root и рендерим Vanta компонент ТОЛЬКО ОДИН РАЗ
            if (!vantaRootRef.current) {
              vantaRootRef.current = createRoot(vantaContainerRef.current);
              vantaRootRef.current.render(
                <VantaHeaderBackground
                  effectType={bg.effectType}
                  color={bg.color || 0xe30a0a}
                  color1={bg.color1 || null}
                  color2={bg.color2 || null}
                  shininess={bg.shininess || null}
                  waveSpeed={bg.waveSpeed || null}
                  zoom={bg.zoom || null}
                  points={bg.points || null}
                  maxDistance={bg.maxDistance || null}
                  spacing={bg.spacing || null}
                />
              );
              console.log('Vanta component rendered');
            } else {
              console.log('Vanta root already exists, NOT re-rendering to prevent destruction');
            }
          } else {
            // Если контейнер уже есть, НЕ ДЕЛАЕМ НИЧЕГО - оставляем как есть!
            console.log('Vanta container already exists in DOM, keeping it untouched');
          }
      } else {
        console.warn('Unknown background type or missing data:', bg);
      }
    } else {
      console.warn('Background not found:', backgroundToApply);
    }

    // Убеждаемся, что все видео в шапке зациклены навсегда
    const videoHandlers = new WeakMap(); // Храним обработчики для каждого видео
    
    const ensureVideosLoop = () => {
      // Собираем видео из DOM и из ref
      const allVideosFromDOM = document.querySelectorAll('.ah-cover video, .ah-cover-background video, #artist-page-background video');
      const allVideos = new Set();
      
      // Добавляем видео из DOM
      allVideosFromDOM.forEach(v => {
        allVideos.add(v);
        videoElementsRef.current.add(v); // Сохраняем в ref
      });
      
      // Добавляем видео из ref (на случай если они были удалены из DOM, но еще в памяти)
      videoElementsRef.current.forEach(v => {
        if (v && v.parentNode && document.contains(v)) {
          allVideos.add(v);
        } else {
          // Удаляем из ref если элемент больше не в DOM
          videoElementsRef.current.delete(v);
        }
      });
      
      allVideos.forEach(video => {
        if (video) {
          // Устанавливаем все необходимые атрибуты
          video.loop = true;
          video.setAttribute('loop', 'true');
          video.autoplay = true;
          video.setAttribute('autoplay', 'true');
          video.muted = true;
          video.setAttribute('muted', 'true');
          video.playsInline = true;
          video.setAttribute('playsinline', 'true');
          video.preload = 'auto';
          video.setAttribute('preload', 'auto');
          
          // Создаем обработчики только один раз для каждого видео
          if (!videoHandlers.has(video)) {
            // Обработчик для перезапуска при окончании
            const handleEnded = () => {
              video.currentTime = 0;
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise.catch(() => {
                  // Если не удалось запустить, пробуем еще раз
                  setTimeout(() => {
                    video.currentTime = 0;
                    video.play().catch(() => {});
                  }, 100);
                });
              }
            };
            
            // Обработчик для автоматического возобновления при паузе
            const handlePause = () => {
              // Если видео не на конце, продолжаем воспроизведение
              if (video.currentTime < video.duration - 0.1) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                  playPromise.catch(() => {});
                }
              }
            };
            
            // Обработчик для возобновления после приостановки
            const handleSuspend = () => {
              setTimeout(() => {
                if (video.paused && video.readyState >= 2) {
                  video.play().catch(() => {});
                }
              }, 100);
            };
            
            // Обработчик для проверки готовности
            const handleLoadedData = () => {
              video.loop = true;
              if (video.paused) {
                video.play().catch(() => {});
              }
            };
            
            // Добавляем все обработчики
            video.addEventListener('ended', handleEnded);
            video.addEventListener('pause', handlePause);
            video.addEventListener('suspend', handleSuspend);
            video.addEventListener('loadeddata', handleLoadedData);
            
            // Сохраняем обработчики
            videoHandlers.set(video, { handleEnded, handlePause, handleSuspend, handleLoadedData });
          }
          
          // Убеждаемся, что видео играет
          if (video.paused && video.readyState >= 2) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                // Если не удалось запустить сразу, пробуем еще раз
                setTimeout(() => {
                  video.play().catch(() => {});
                }, 200);
              });
            }
          }
          
          // Если видео закончилось, перезапускаем
          if (video.ended) {
            video.currentTime = 0;
            video.play().catch(() => {});
          }
        }
      });
    };
    
      // Проверяем видео сразу и периодически (чаще, чтобы не пропустить остановку)
      ensureVideosLoop();
      const videoCheckInterval = setInterval(ensureVideosLoop, 500); // Проверяем каждые 500ms
      
      // СТРОГО: Постоянно убираем backgroundImage, чтобы ArtistHeader не перезаписывал его
      const removeBackgroundImageInterval = setInterval(() => {
        const cover = document.querySelector('.ah-cover');
        if (cover) {
          // Убираем backgroundImage несколькими способами
          if (cover.style.backgroundImage && cover.style.backgroundImage !== 'none') {
            cover.style.backgroundImage = 'none';
            cover.style.setProperty('background-image', 'none', 'important');
          }
          // Также убираем через классы
          cover.classList.remove('ah-cover-with-bg');
        }
      }, 50); // Проверяем каждые 50ms (чаще для надежности)

      // Возвращаем cleanup функцию для этой итерации
      return () => {
        clearInterval(videoCheckInterval);
        clearInterval(removeBackgroundImageInterval);
        // НЕ очищаем структуры при размонтировании - видео должны оставаться!
        // cleanupBackgroundStructures();
        // if (headerCover) {
        //   headerCover.style.backgroundImage = '';
        // }
      };
    } // конец функции applyBackground
    
    // Если элемент уже есть, применяем фон сразу
    if (headerCover) {
      const cleanup = applyBackground(headerCover);
      return cleanup;
    }
  }, [previewBackground, selectedBackground, isPremium]);

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

  // Панель выбора показываем только в режиме редактирования для владельца
  // Но сам эффект применяется всегда через useEffect выше
  if (!isOwner || !editMode) {
    return null; // Возвращаем null только для панели, useEffect все равно работает
  }

  return (
    <div className="apb-root" data-visible="true">
      <div className="apb-title">ФОНЫ</div>
      <div className="apb-grid">
        {BACKGROUND_OPTIONS.map((bg) => {
          console.log("ArtistPageBackground: mapping bg", { 
            id: bg.id, 
            name: bg.name, 
            type: bg.type, 
            shaderId: bg.shaderId,
            effectType: bg.effectType,
            hasShaderId: !!bg.shaderId,
            hasEffectType: !!bg.effectType
          });
          
          const isSelected = previewBackground === bg.id;
          const isActive = selectedBackground === bg.id;
          const isPremiumBg = bg.premium === true;
          const isLocked = isPremiumBg && !isPremium; // Блокируем премиум фоны для бесплатных пользователей
          
          // Проверяем, что фон имеет все необходимые данные
          if (bg.type === 'shadertoy' && !bg.shaderId) {
            console.warn("ArtistPageBackground: skipping shadertoy bg without shaderId", bg);
            return null;
          }
          if (bg.type === 'vanta' && !bg.effectType) {
            console.warn("ArtistPageBackground: skipping vanta bg without effectType", bg);
            return null;
          }
          
          console.log("ArtistPageBackground: rendering bg button", { 
            id: bg.id, 
            type: bg.type,
            willRenderShaderToy: bg.type === 'shadertoy' && bg.shaderId,
            willRenderVanta: bg.type === 'vanta' && bg.effectType
          });
          
          return (
            <button
              key={bg.id}
              type="button"
              className={`apb-item ${isSelected ? 'apb-item-selected' : ''} ${isActive ? 'apb-item-active' : ''} ${isLocked ? 'apb-item-locked' : ''}`}
              onClick={() => handleSelectBackground(bg.id)}
              disabled={isLocked}
            >
              {bg.type === 'shadertoy' && bg.shaderId ? (
                (() => {
                  console.log("ArtistPageBackground: Rendering ShaderToyPreview", { 
                    bgId: bg.id, 
                    bgName: bg.name, 
                    shaderId: bg.shaderId,
                    bgType: bg.type
                  });
                  return (
                    <ShaderToyPreview
                      backgroundId={bg.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  );
                })()
              ) : bg.type === 'vanta' && bg.effectType ? (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  background: 'rgba(0, 0, 0, 0.3)',
                }}>
                  <VantaPreview
                    effectType={bg.effectType}
                    color={bg.color || 0xe30a0a}
                    color1={bg.color1 || null}
                    color2={bg.color2 || null}
                    shininess={bg.shininess || null}
                    waveSpeed={bg.waveSpeed || null}
                    zoom={bg.zoom || null}
                    points={bg.points || null}
                    maxDistance={bg.maxDistance || null}
                    spacing={bg.spacing || null}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>
              ) : null}
              {isActive && (
                <div className="apb-checkmark">✓</div>
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

