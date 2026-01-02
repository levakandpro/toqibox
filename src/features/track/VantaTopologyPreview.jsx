import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Компонент для превью Vanta.js TOPOLOGY (мини-версия)
 */
export default function VantaTopologyPreview({ style = {} }) {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    if (!vantaRef.current) return;

    let mounted = true;

    // Ждем, пока THREE и p5 будут доступны
    const initVanta = () => {
      if (!window.THREE) {
        console.warn("THREE not ready for preview, retrying...");
        setTimeout(initVanta, 100);
        return;
      }

      // Vanta.js TOPOLOGY требует p5.js
      if (!window.p5 && !document.querySelector('script[src*="p5.min.js"]')) {
        // Загружаем p5.js из CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/p5.min.js';
        script.onload = () => {
          // Ждем немного, чтобы p5.js полностью инициализировался
          setTimeout(() => {
            if (mounted && vantaRef.current) {
              loadVanta();
            }
          }, 100);
        };
        script.onerror = () => {
          console.error("Failed to load p5.js for preview");
        };
        document.head.appendChild(script);
        return;
      } else if (!window.p5) {
        // p5.js уже загружается, ждем
        setTimeout(initVanta, 200);
        return;
      }

      loadVanta();
    };

    const loadVanta = () => {
      // Динамический импорт Vanta.js TOPOLOGY
      import("vanta/dist/vanta.topology.min.js").then((module) => {
        if (!mounted || !vantaRef.current) return;
        
        // Vanta.js может экспортировать по-разному, пробуем разные варианты
        let TOPOLOGY = null;
        
        // Вариант 1: window.VANTA.TOPOLOGY (после загрузки модуля)
        if (window.VANTA && window.VANTA.TOPOLOGY) {
          TOPOLOGY = window.VANTA.TOPOLOGY;
        }
        // Вариант 2: module.default.TOPOLOGY
        else if (module.default && module.default.TOPOLOGY) {
          TOPOLOGY = module.default.TOPOLOGY;
        }
        // Вариант 3: module.TOPOLOGY
        else if (module.TOPOLOGY) {
          TOPOLOGY = module.TOPOLOGY;
        }
        // Вариант 4: module.default как функция
        else if (typeof module.default === 'function') {
          TOPOLOGY = module.default;
        }
        // Вариант 5: module как функция
        else if (typeof module === 'function') {
          TOPOLOGY = module;
        }
        
        if (TOPOLOGY && typeof TOPOLOGY === 'function') {
          try {
            vantaEffect.current = TOPOLOGY({
              el: vantaRef.current,
              THREE: window.THREE,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              scale: 1.00,
              scaleMobile: 1.00,
              color: 0xe30a0a,
              backgroundColor: 0x0
            });
          } catch (error) {
            console.error("Error initializing Vanta.js TOPOLOGY preview:", error);
          }
        } else {
          console.error("Vanta.js TOPOLOGY is not a function. Module structure:", module);
        }
      }).catch((err) => {
        console.error("Failed to load Vanta.js TOPOLOGY preview:", err);
      });
    };

    initVanta();

    return () => {
      mounted = false;
      if (vantaEffect.current) {
        try {
          vantaEffect.current.destroy();
        } catch (e) {
          console.error("Error destroying Vanta.js preview:", e);
        }
        vantaEffect.current = null;
      }
    };
  }, []);

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

