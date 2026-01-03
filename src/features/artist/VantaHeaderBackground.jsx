import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Компонент Vanta.js фона для шапки артиста
 * @param {string} effectType - Тип эффекта: 'net', 'fog', 'dots', 'waves', 'rings', 'birds', 'cells', 'trunk'
 * @param {number} color - Цвет в hex формате (например, 0xe30a0a)
 * @param {number} color1 - Первый цвет для эффектов с двумя цветами (например, cells)
 * @param {number} color2 - Второй цвет для эффектов с двумя цветами (например, cells)
 * @param {number} shininess - Блеск для waves (например, 52.00)
 * @param {number} waveSpeed - Скорость волн для waves (например, 0.80)
 * @param {number} zoom - Зум для waves (например, 1.22)
 * @param {number} points - Количество точек для net (например, 11.00)
 * @param {number} maxDistance - Максимальное расстояние для net (например, 21.00)
 * @param {number} spacing - Расстояние между точками для net (например, 17.00)
 */
export default function VantaHeaderBackground({ 
  effectType = "net", 
  color = 0xe30a0a, 
  color1 = null, 
  color2 = null,
  shininess = null,
  waveSpeed = null,
  zoom = null,
  points = null,
  maxDistance = null,
  spacing = null
}) {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    if (!vantaRef.current) {
      console.warn('VantaHeaderBackground: vantaRef.current is null');
      return;
    }
    console.log('VantaHeaderBackground: Initializing', effectType);

    let mounted = true;

    // Некоторые эффекты требуют p5.js (topology, birds, cells, dots, halo, net, ripple, trunk, waves)
    // rings НЕ требует p5.js
    const needsP5 = ['topology', 'birds', 'cells', 'dots', 'halo', 'net', 'ripple', 'trunk', 'waves'].includes(effectType);
    
    // Функция для проверки готовности p5.js
    const isP5Ready = () => {
      const p5 = window.p5;
      return p5 && 
             typeof p5 === 'function' && 
             typeof p5.Vector === 'function' &&
             typeof p5.prototype === 'object';
    };

    // Ждем, пока THREE будет доступен
    const initVanta = () => {
      if (!window.THREE) {
        console.warn("VantaHeaderBackground: THREE not ready, retrying...");
        setTimeout(initVanta, 100);
        return;
      }
      console.log('VantaHeaderBackground: THREE is ready');
      
      if (needsP5) {
        // Проверяем, загружен ли p5.js
        const p5Script = document.querySelector('script[src*="p5.min.js"]');
        
        if (!isP5Ready() && !p5Script) {
          // Загружаем p5.js из CDN
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.min.js';
          script.onload = () => {
            // Ждем, пока p5.js полностью инициализируется
            let attempts = 0;
            const checkP5 = setInterval(() => {
              attempts++;
              if (isP5Ready()) {
                clearInterval(checkP5);
                if (mounted && vantaRef.current) {
                  loadVanta();
                }
              } else if (attempts > 30) {
                clearInterval(checkP5);
                console.error("p5.js failed to initialize");
              }
            }, 100);
          };
          document.head.appendChild(script);
        } else if (isP5Ready()) {
          loadVanta();
        } else if (p5Script) {
          // p5.js загружается, ждем
          let attempts = 0;
          const checkP5 = setInterval(() => {
            attempts++;
            if (isP5Ready()) {
              clearInterval(checkP5);
              if (mounted && vantaRef.current) {
                loadVanta();
              }
            } else if (attempts > 30) {
              clearInterval(checkP5);
              console.error("p5.js failed to initialize");
            }
          }, 100);
        }
      } else {
        loadVanta();
      }
    };

    const loadVanta = () => {
      // Статические импорты для доступных эффектов
      let importPromise = null;
      
      if (effectType === 'rings') {
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
        
        // Уничтожаем предыдущий эффект перед созданием нового
        if (vantaEffect.current) {
          try {
            vantaEffect.current.destroy();
          } catch (e) {
            console.error(`Error destroying previous Vanta.js effect:`, e);
          }
          vantaEffect.current = null;
        }
        
        // Даем время модулю зарегистрироваться в window.VANTA
        setTimeout(() => {
          if (!mounted || !vantaRef.current) return;
          
          const effectName = effectType.toUpperCase().charAt(0) + effectType.slice(1);
          let Effect = null;
          
          console.log('VantaHeaderBackground: Looking for', effectName, 'in window.VANTA:', window.VANTA);
          
          // Вариант 1: window.VANTA.EFFECT (после загрузки модуля)
          if (window.VANTA && window.VANTA[effectName]) {
            Effect = window.VANTA[effectName];
            console.log(`VantaHeaderBackground: Found ${effectName} in window.VANTA, type:`, typeof Effect);
          }
        // Вариант 2: module.default.EFFECT
        else if (module.default && module.default[effectName]) {
          Effect = module.default[effectName];
        }
        // Вариант 3: module.EFFECT
        else if (module[effectName]) {
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
          console.log('VantaHeaderBackground: Module keys:', moduleKeys);
          for (const key of moduleKeys) {
            if (key.toUpperCase() === effectName.toUpperCase() && typeof module[key] === 'function') {
              Effect = module[key];
              break;
            }
          }
        }
        
        if (Effect && typeof Effect === 'function') {
          try {
            // Проверяем, что THREE.js доступен
            if (!window.THREE || typeof window.THREE.BufferGeometry === 'undefined') {
              console.error(`Vanta.js ${effectName}: THREE.js is not properly loaded`);
              return;
            }

            const config = {
              el: vantaRef.current,
              THREE: window.THREE,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
            };

            if (effectType === 'trunk') {
              config.scale = 1.00;
              config.scaleMobile = 1.00;
              config.color = color;
            } else if (effectType === 'cells') {
              config.scale = 1.00;
              config.scaleMobile = 1.00;
              if (color1 !== null) config.color1 = color1;
              if (color2 !== null) config.color2 = color2;
            } else if (effectType === 'waves') {
              config.scale = 1.00;
              config.scaleMobile = 1.00;
              if (color !== null) config.color = color;
              if (shininess !== null) config.shininess = shininess;
              if (waveSpeed !== null) config.waveSpeed = waveSpeed;
              if (zoom !== null) config.zoom = zoom;
            } else if (effectType === 'net') {
              config.scale = 1.00;
              config.scaleMobile = 1.00;
              if (color !== null) config.color = color;
              if (points !== null) config.points = points;
              if (maxDistance !== null) config.maxDistance = maxDistance;
              if (spacing !== null) config.spacing = spacing;
            } else if (effectType === 'rings' || effectType === 'dots' || effectType === 'birds' || effectType === 'fog') {
              config.scale = 1.00;
              config.scaleMobile = 1.00;
            }

            // Для эффектов, требующих p5.js
            if (needsP5) {
              if (!isP5Ready()) {
                console.error(`Vanta.js ${effectName}: p5.js is not ready`);
                return;
              }
              config.p5 = window.p5;
            }

            vantaEffect.current = Effect(config);
            console.log(`VantaHeaderBackground: ${effectName} initialized successfully`, vantaEffect.current);
          } catch (error) {
            console.error(`Error initializing Vanta.js ${effectName}:`, error);
          }
        } else {
          console.error(`Vanta.js ${effectName} is not a function. Module structure:`, module);
          console.error('Module keys:', Object.keys(module));
          console.error('window.VANTA:', window.VANTA);
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

              if (effectType === 'trunk') {
                config.scale = 1.00;
                config.scaleMobile = 1.00;
                config.color = color;
              } else if (effectType === 'cells') {
                config.scale = 1.00;
                config.scaleMobile = 1.00;
                if (color1 !== null) config.color1 = color1;
                if (color2 !== null) config.color2 = color2;
              } else if (effectType === 'waves') {
                config.scale = 1.00;
                config.scaleMobile = 1.00;
                if (color !== null) config.color = color;
                if (shininess !== null) config.shininess = shininess;
                if (waveSpeed !== null) config.waveSpeed = waveSpeed;
                if (zoom !== null) config.zoom = zoom;
              } else if (effectType === 'net') {
                config.scale = 1.00;
                config.scaleMobile = 1.00;
                if (color !== null) config.color = color;
                if (points !== null) config.points = points;
                if (maxDistance !== null) config.maxDistance = maxDistance;
                if (spacing !== null) config.spacing = spacing;
              } else if (effectType === 'rings' || effectType === 'dots' || effectType === 'birds' || effectType === 'fog') {
                config.scale = 1.00;
                config.scaleMobile = 1.00;
              }

              // Для эффектов, требующих p5.js
              if (needsP5) {
                if (!isP5Ready()) {
                  console.error(`Vanta.js ${effectName}: p5.js is not ready`);
                  return;
                }
                config.p5 = window.p5;
              }

              vantaEffect.current = window.VANTA[effectName](config);
              console.log(`VantaHeaderBackground: ${effectName} initialized via window.VANTA`, vantaEffect.current);
            } catch (error) {
              console.error(`Error initializing Vanta.js ${effectName} via window.VANTA:`, error);
            }
          }
        }
        }, 100); // Даем время модулю зарегистрироваться
      }).catch((err) => {
        console.error(`Failed to load Vanta.js ${effectType}:`, err);
      });
    };

    initVanta();

    return () => {
      mounted = false;
      // ОБЯЗАТЕЛЬНО уничтожаем эффект при размонтировании или смене
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
        } catch (e) {
          console.error(`Error destroying Vanta.js ${effectType}:`, e);
        }
        vantaEffect.current = null;
      }
    };
  }, [effectType, color, color1, color2, shininess, waveSpeed, zoom, points, maxDistance, spacing]);

  return (
    <div
      ref={vantaRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}

