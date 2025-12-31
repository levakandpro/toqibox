import React, { useEffect, useRef, useState } from "react";
import { getBackgroundById, getShaderToyEmbedUrl } from "../../utils/shadertoyBackgrounds.js";

export default function ShaderToyBackground({ backgroundId }) {
  const containerRef = useRef(null);
  const [useFallback, setUseFallback] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const background = getBackgroundById(backgroundId);

  // Проверяем поддержку WebGL
  useEffect(() => {
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (!gl) {
          setIsSupported(false);
          setUseFallback(true);
          return;
        }
      } catch (e) {
        setIsSupported(false);
        setUseFallback(true);
      }
    };

    checkWebGLSupport();
  }, []);

  // Определяем, нужно ли использовать fallback (слабые устройства)
  useEffect(() => {
    const checkDevice = () => {
      // Проверяем производительность устройства
      const isLowEnd = navigator.hardwareConcurrency <= 2 || 
                       (navigator.deviceMemory && navigator.deviceMemory <= 2);
      
      // На мобильных всегда используем fallback для экономии батареи
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isLowEnd || isMobile) {
        setUseFallback(true);
      }
    };

    checkDevice();
  }, []);

  if (!background) return null;

  // Fallback: статичное превью (можно использовать скриншот или градиент)
  if (useFallback || !isSupported) {
    return (
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
          background: "linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0a0e1a 100%)",
          opacity: 0.6,
        }}
        aria-hidden="true"
      />
    );
  }

  // ShaderToy iframe
  return (
    <iframe
      ref={containerRef}
      src={getShaderToyEmbedUrl(background.shaderId)}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        border: "none",
        opacity: 0.6,
      }}
      title="ShaderToy Background"
      aria-hidden="true"
    />
  );
}

