import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Универсальный компонент для превью Vanta.js фонов
 * @param {string} effectType - Тип эффекта
 * @param {number} color - Цвет в hex формате (например, 0xe30a0a)
 * @param {number} color1 - Первый цвет для эффектов с двумя цветами (например, cells)
 * @param {number} color2 - Второй цвет для эффектов с двумя цветами (например, cells)
 * @param {object} style - Стили для контейнера
 */
export default function VantaPreview({ effectType = "topology", color = 0xe30a0a, color1 = null, color2 = null, style = {} }) {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    if (!vantaRef.current) return;

    let mounted = true;

    // Ждем, пока THREE будет доступен
    const initVanta = () => {
      if (!window.THREE) {
        console.warn("THREE not ready for preview, retrying...");
        setTimeout(initVanta, 100);
        return;
      }

      // Некоторые эффекты требуют p5.js
      // rings НЕ требует p5.js
      const needsP5 = ['topology', 'birds', 'cells', 'dots', 'halo', 'net', 'ripple', 'trunk', 'waves'].includes(effectType);
      
      // Функция для проверки готовности p5.js
      const isP5Ready = () => {
        // Проверяем только window.p5 (p5.js загружается в window)
        const p5 = window.p5;
        return p5 && 
               typeof p5 === 'function' && 
               typeof p5.Vector === 'function' &&
               typeof p5.prototype === 'object';
      };
      
      if (needsP5) {
        // Проверяем, загружен ли p5.js
        const p5Script = document.querySelector('script[src*="p5.min.js"]');
        
        if (!isP5Ready() && !p5Script) {
          // Загружаем p5.js из CDN (версия 1.4.0 для лучшей совместимости с Vanta.js)
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js';
          script.onload = () => {
            // Ждем, пока p5.js полностью инициализируется
            let attempts = 0;
            const checkP5 = () => {
              attempts++;
              if (isP5Ready()) {
                // Дополнительная задержка для полной инициализации p5.js
                // Для эффекта birds требуется больше времени
                const delay = effectType === 'birds' ? 500 : 300;
                setTimeout(() => {
                  if (mounted && vantaRef.current && isP5Ready()) {
                    loadVanta();
                  }
                }, delay);
              } else if (attempts < 30) {
                setTimeout(checkP5, 100);
              } else {
                console.warn(`p5.js failed to initialize for ${effectType} preview after 3 seconds`);
              }
            };
            checkP5();
          };
          script.onerror = () => {
            console.error(`Failed to load p5.js for ${effectType} preview`);
          };
          document.head.appendChild(script);
          return;
        } else if (!isP5Ready() && p5Script) {
          // Скрипт загружается, ждем
          let attempts = 0;
          const checkP5 = () => {
            attempts++;
            if (isP5Ready()) {
              // Дополнительная задержка для полной инициализации p5.js
              // Для эффекта birds требуется больше времени
              const delay = effectType === 'birds' ? 500 : 300;
              setTimeout(() => {
                if (mounted && vantaRef.current && isP5Ready()) {
                  loadVanta();
                }
              }, delay);
            } else if (attempts < 30) {
              setTimeout(checkP5, 100);
            } else {
              console.warn(`p5.js failed to initialize for ${effectType} preview after 3 seconds`);
            }
          };
          checkP5();
          return;
        } else if (!isP5Ready()) {
          // p5.js должен быть готов, но не готов - ждем еще
          let attempts = 0;
          const checkP5 = () => {
            attempts++;
            if (isP5Ready()) {
              // Для эффекта birds требуется больше времени
              const delay = effectType === 'birds' ? 500 : 300;
              setTimeout(() => {
                if (mounted && vantaRef.current && isP5Ready()) {
                  loadVanta();
                }
              }, delay);
            } else if (attempts < 30) {
              setTimeout(checkP5, 100);
            } else {
              console.warn(`p5.js not ready for ${effectType} preview after 3 seconds`);
            }
          };
          checkP5();
          return;
        }
      }

      loadVanta();
    };

    const loadVanta = () => {
      // Статические импорты для доступных эффектов (Vite требует статические пути)
      let importPromise = null;
      
      if (effectType === 'topology') {
        importPromise = import("vanta/dist/vanta.topology.min.js");
      } else if (effectType === 'rings') {
        importPromise = import("vanta/dist/vanta.rings.min.js");
      } else if (effectType === 'dots') {
        importPromise = import("vanta/dist/vanta.dots.min.js");
      } else if (effectType === 'birds') {
        importPromise = import("vanta/dist/vanta.birds.min.js");
      } else if (effectType === 'cells') {
        importPromise = import("vanta/dist/vanta.cells.min.js");
      } else if (effectType === 'fog') {
        importPromise = import("vanta/dist/vanta.fog.min.js");
      } else if (effectType === 'net') {
        importPromise = import("vanta/dist/vanta.net.min.js");
      } else if (effectType === 'waves') {
        importPromise = import("vanta/dist/vanta.waves.min.js");
      } else if (effectType === 'trunk') {
        importPromise = import("vanta/dist/vanta.trunk.min.js");
      } else {
        console.error(`Unsupported effect type: ${effectType}`);
        return;
      }

      // Динамический импорт Vanta.js эффекта
      importPromise.then((module) => {
        if (!mounted || !vantaRef.current) return;
        
        // Vanta.js может экспортировать по-разному, пробуем разные варианты
        const effectName = effectType.toUpperCase().charAt(0) + effectType.slice(1); // "topology" -> "Topology", "rings" -> "Rings"
        let Effect = null;
        
        // Вариант 1: window.VANTA.EFFECT (после загрузки модуля)
        if (window.VANTA && window.VANTA[effectName] && typeof window.VANTA[effectName] === 'function') {
          Effect = window.VANTA[effectName];
        }
        // Вариант 2: module.default.EFFECT
        else if (module.default && module.default[effectName] && typeof module.default[effectName] === 'function') {
          Effect = module.default[effectName];
        }
        // Вариант 3: module.EFFECT
        else if (module[effectName] && typeof module[effectName] === 'function') {
          Effect = module[effectName];
        }
        // Вариант 4: module.default как функция
        else if (typeof module.default === 'function') {
          Effect = module.default;
        }
        // Вариант 5: module как функция
        else if (typeof module === 'function') {
          Effect = module;
        }
        // Вариант 6: module.default.default (вложенный default)
        else if (module.default && module.default.default && typeof module.default.default === 'function') {
          Effect = module.default.default;
        }
        // Вариант 7: Проверяем все ключи модуля
        else {
          const moduleKeys = Object.keys(module);
          for (const key of moduleKeys) {
            if (key.toUpperCase() === effectName.toUpperCase() && typeof module[key] === 'function') {
              Effect = module[key];
              break;
            }
          }
        }
        
        // Для birds: проверяем, что Effect действительно является функцией
        if (effectType === 'birds' && (!Effect || typeof Effect !== 'function')) {
          console.error(`Vanta.js ${effectName} preview: Effect is not a valid function. Module:`, module);
          return;
        }
        
        if (Effect && typeof Effect === 'function') {
          try {
            // Валидация размеров элемента
            const rect = vantaRef.current.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0 || !isFinite(rect.width) || !isFinite(rect.height)) {
              console.warn(`Vanta.js ${effectName} preview: Invalid element dimensions`, rect);
              return;
            }

            // Дополнительная валидация THREE.js
            if (!window.THREE || typeof window.THREE.BufferGeometry === 'undefined') {
              console.error(`Vanta.js ${effectName} preview: THREE.js is not properly loaded`);
              return;
            }

            const config = {
              el: vantaRef.current,
              THREE: window.THREE,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: Math.max(200, Math.floor(rect.height) || 200),
              minWidth: Math.max(200, Math.floor(rect.width) || 200),
            };

            // Специфичные настройки для разных эффектов
            if (effectType === 'topology') {
              config.scale = 1.00;
              config.scaleMobile = 1.00;
              config.color = color;
              config.backgroundColor = 0x0;
            } else if (effectType === 'trunk') {
              config.scale = 1.00;
              config.scaleMobile = 1.00;
              config.color = color;
            } else if (effectType === 'cells') {
              config.scale = 1.00;
              config.scaleMobile = 1.00;
              if (color1 !== null && isFinite(color1)) config.color1 = color1;
              if (color2 !== null && isFinite(color2)) config.color2 = color2;
            } else if (effectType === 'rings' || effectType === 'dots' || effectType === 'birds' || effectType === 'fog' || effectType === 'waves' || effectType === 'net') {
              config.scale = 1.00;
              config.scaleMobile = 1.00;
            }

            // Валидация всех числовых значений в config
            const validateConfig = (cfg) => {
              for (const key in cfg) {
                const value = cfg[key];
                if (typeof value === 'number' && (!isFinite(value) || isNaN(value))) {
                  console.warn(`Vanta.js ${effectName} preview: Invalid config value for ${key}:`, value);
                  return false;
                }
              }
              return true;
            };

            if (!validateConfig(config)) {
              console.error(`Vanta.js ${effectName} preview: Config validation failed`);
              return;
            }

            // Для эффектов, требующих p5.js, проверяем готовность и передаем p5
            const needsP5ForEffect = ['topology', 'birds', 'cells', 'dots', 'halo', 'net', 'ripple', 'trunk', 'waves'].includes(effectType);
            if (needsP5ForEffect) {
              // Получаем p5 из window (p5.js загружается в window)
              const p5 = window.p5;
              if (!p5 || typeof p5 !== 'function' || typeof p5.Vector !== 'function') {
                console.error(`Vanta.js ${effectName} preview: p5.js is not ready`);
                return;
              }
              
              // Для birds требуется особая обработка - эффект может быть не готов сразу
              if (effectType === 'birds') {
                // Проверяем, что Effect действительно является функцией
                if (!Effect || typeof Effect !== 'function') {
                  console.error(`Vanta.js ${effectName} preview: Effect is not a function`);
                  return;
                }
                
                // Дополнительная проверка: убеждаемся, что p5 полностью инициализирован
                if (typeof p5.prototype === 'undefined') {
                  console.error(`Vanta.js ${effectName} preview: p5.js prototype not available`);
                  return;
                }
                
                // Для birds требуется дополнительное время для полной инициализации p5.js
                // Используем более длинную задержку и дополнительные проверки
                let attempts = 0;
                const initBirds = () => {
                  attempts++;
                  if (!mounted || !vantaRef.current) return;
                  
                  // Проверяем, что p5 все еще доступен и готов
                  const currentP5 = window.p5;
                  if (!currentP5 || typeof currentP5 !== 'function' || typeof currentP5.Vector !== 'function') {
                    if (attempts < 15) {
                      setTimeout(initBirds, 300);
                    } else {
                      console.error(`Vanta.js ${effectName} preview: p5.js not ready after ${attempts} attempts`);
                    }
                    return;
                  }
                  
                  // Дополнительная проверка: убеждаемся, что p5 полностью инициализирован
                  if (typeof currentP5.prototype === 'undefined') {
                    if (attempts < 15) {
                      setTimeout(initBirds, 300);
                    } else {
                      console.error(`Vanta.js ${effectName} preview: p5.js prototype not available after ${attempts} attempts`);
                    }
                    return;
                  }
                  
                  // Проверяем, что Effect все еще доступен
                  if (!Effect || typeof Effect !== 'function') {
                    console.error(`Vanta.js ${effectName} preview: Effect is not available`);
                    return;
                  }
                  
                  try {
                    // Проверяем, что p5 действительно является конструктором
                    if (typeof currentP5 !== 'function' || !currentP5.prototype) {
                      console.error(`Vanta.js ${effectName} preview: p5 is not a valid constructor`);
                      return;
                    }

                    // Создаем новый config для birds с p5
                    const birdsConfig = {
                      ...config,
                      p5: currentP5,
                    };
                    
                    // Проверяем, что Effect действительно является функцией
                    if (!Effect || typeof Effect !== 'function') {
                      console.error(`Vanta.js ${effectName} preview: Effect is not a function`);
                      return;
                    }
                    
                    // Вызываем Effect как функцию
                    const effect = Effect(birdsConfig);
                    
                    // Проверяем результат
                    if (!effect) {
                      console.error(`Vanta.js ${effectName} preview: Effect returned null/undefined`);
                      return;
                    }
                    
                    if (effect && effect.renderer && effect.renderer.domElement) {
                      vantaEffect.current = effect;
                    } else {
                      console.warn(`Vanta.js ${effectName} preview initialized but renderer is invalid`);
                    }
                  } catch (initError) {
                    console.error(`Vanta.js ${effectName} preview initialization error:`, initError);
                    if (vantaRef.current) {
                      vantaRef.current.innerHTML = '';
                    }
                  }
                };
                
                // Начинаем инициализацию с задержкой (увеличена для birds)
                setTimeout(initBirds, 1000);
                return;
              }
              
              // Для остальных эффектов просто передаем p5
              config.p5 = p5;
            }

            try {
              const effect = Effect(config);
              
              // Проверяем, что эффект инициализирован корректно
              if (effect && effect.renderer && effect.renderer.domElement) {
                vantaEffect.current = effect;
              } else {
                console.warn(`Vanta.js ${effectName} preview initialized but renderer is invalid`);
              }
            } catch (initError) {
              console.error(`Vanta.js ${effectName} preview initialization error:`, initError);
              // Пытаемся очистить некорректную инициализацию
              if (vantaRef.current) {
                vantaRef.current.innerHTML = '';
              }
            }
          } catch (error) {
            console.error(`Error initializing Vanta.js ${effectName} preview:`, error);
            // Пытаемся очистить некорректную инициализацию
            if (vantaRef.current) {
              vantaRef.current.innerHTML = '';
            }
            // Не пробуем использовать window.VANTA, если основная инициализация провалилась
            return;
          }
        } else {
          console.error(`Vanta.js ${effectName} preview is not a function. Module structure:`, module);
          console.error(`Module keys:`, Object.keys(module));
          console.error(`window.VANTA:`, window.VANTA);
          // Пробуем использовать window.VANTA напрямую, если он доступен
          if (window.VANTA && window.VANTA[effectName] && typeof window.VANTA[effectName] === 'function') {
            try {
              const config = {
                el: vantaRef.current,
                THREE: window.THREE,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
              };

              if (effectType === 'topology') {
                config.scale = 1.00;
                config.scaleMobile = 1.00;
                config.color = color;
                config.backgroundColor = 0x0;
              } else if (effectType === 'trunk') {
                config.scale = 1.00;
                config.scaleMobile = 1.00;
                config.color = color;
              } else if (effectType === 'cells') {
                config.scale = 1.00;
                config.scaleMobile = 1.00;
                if (color1 !== null) config.color1 = color1;
                if (color2 !== null) config.color2 = color2;
              } else if (effectType === 'rings' || effectType === 'dots' || effectType === 'birds' || effectType === 'fog' || effectType === 'waves' || effectType === 'net') {
                config.scale = 1.00;
                config.scaleMobile = 1.00;
              }

              vantaEffect.current = window.VANTA[effectName](config);
            } catch (error) {
              console.error(`Error initializing Vanta.js ${effectName} preview via window.VANTA:`, error);
            }
          }
        }
      }).catch((err) => {
        console.error(`Failed to load Vanta.js ${effectType} preview:`, err);
      });
    };

    initVanta();

    return () => {
      mounted = false;
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
        } catch (e) {
          console.error(`Error destroying Vanta.js ${effectType} preview:`, e);
        }
        vantaEffect.current = null;
      }
    };
  }, [effectType, color, color1, color2]);

  return (
    <div
      ref={vantaRef}
      style={{
        width: "100%",
        height: "100%",
        ...style,
      }}
      aria-hidden="true"
    />
  );
}


