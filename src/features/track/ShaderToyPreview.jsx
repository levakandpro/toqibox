import React, { useEffect, useRef, useState } from "react";
import { getShaderCode, compileShaderProgram } from "../../utils/webglShaders.js";
import { getBackgroundById } from "../../utils/shadertoyBackgrounds.js";
import { getPremiumBackgroundById } from "../../utils/premiumBackgrounds.js";

/**
 * Компонент для превью ShaderToy фона (мини-версия)
 * На мобильных устройствах или при отсутствии WebGL показывает статичное превью
 */
export default function ShaderToyPreview({ backgroundId, style = {} }) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(performance.now());
  const [useFallback, setUseFallback] = useState(false);
  
  // Проверяем сначала обычные фоны, потом премиум
  let background = getBackgroundById(backgroundId);
  if (!background) {
    const premiumBg = getPremiumBackgroundById(backgroundId);
    if (premiumBg && premiumBg.type === "shadertoy") {
      // Создаем объект фона для премиум ShaderToy
      background = {
        id: premiumBg.shaderId,
        name: premiumBg.name,
        shaderId: premiumBg.shaderId,
      };
    }
  }
  
  // Используем shaderId для получения кода шейдера
  const shaderId = background?.shaderId || background?.id || backgroundId;
  
  // Логирование для отладки
  if (!background && backgroundId) {
    console.warn("ShaderToyPreview: background not found", { backgroundId });
  }

  useEffect(() => {
    if (!shaderId || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    
    // Устанавливаем начальные размеры canvas сразу
    if (canvas.width === 0 || canvas.height === 0) {
      canvas.width = 100;
      canvas.height = 100;
    }
    
    // Устанавливаем размер canvas ПЕРЕД созданием WebGL контекста
    const resizeCanvas = () => {
      // Используем несколько методов для определения размера
      const rect = canvas.getBoundingClientRect();
      let width = 100;
      let height = 100;
      
      // Пробуем разные способы определения размера
      if (canvas.offsetWidth > 0) {
        width = canvas.offsetWidth;
      } else if (rect.width > 0) {
        width = rect.width;
      } else {
        const style = window.getComputedStyle(canvas);
        const styleWidth = parseInt(style.width);
        if (styleWidth > 0) width = styleWidth;
      }
      
      if (canvas.offsetHeight > 0) {
        height = canvas.offsetHeight;
      } else if (rect.height > 0) {
        height = rect.height;
      } else {
        const style = window.getComputedStyle(canvas);
        const styleHeight = parseInt(style.height);
        if (styleHeight > 0) height = styleHeight;
      }
      
      // Устанавливаем минимальные размеры
      width = Math.max(width, 100);
      height = Math.max(height, 100);
      
      // Обновляем размеры только если они изменились
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    // Инициализируем размеры canvas сразу
    resizeCanvas();
    
    // Дополнительная проверка через небольшую задержку для случаев, когда размер еще не установлен
    const initTimeout = setTimeout(() => {
      resizeCanvas();
    }, 50);
    
    const gl = canvas.getContext("webgl", { 
      alpha: false, 
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false
    }) || canvas.getContext("experimental-webgl", { 
      alpha: false 
    });
    
    // Используем fallback только если WebGL не поддерживается
    if (!gl) {
      clearTimeout(initTimeout);
      setUseFallback(true);
      return () => {};
    }
    
    setUseFallback(false);
    clearTimeout(initTimeout);

    glRef.current = gl;
    
    // Устанавливаем viewport после создания контекста
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    // Используем ResizeObserver для отслеживания изменений размера
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    });
    resizeObserver.observe(canvas);
    
    // Дополнительная проверка через небольшую задержку для случаев, когда размер еще не установлен
    const timeoutId = setTimeout(() => {
      resizeCanvas();
      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    }, 100);

    // Получаем код шейдера
    const shaderCode = getShaderCode(shaderId);
    if (!shaderCode) {
      console.error("ShaderToyPreview: shader code not found for", shaderId);
      setUseFallback(true);
      return () => {};
    }

    let program = null;
    let positionBuffer = null;

    try {
      program = compileShaderProgram(gl, shaderCode);
      if (!program) return;
      
      programRef.current = program;
      gl.useProgram(program);

      // Создаем полноэкранный квад
      positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

      const positionLocation = gl.getAttribLocation(program, "a_position");
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      // Получаем uniform локации
      const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
      const timeLocation = gl.getUniformLocation(program, "u_time");
      const mouseLocation = gl.getUniformLocation(program, "u_mouse");

      // Функция рендеринга
      const render = (timestamp) => {
        if (!gl || !programRef.current) return;

        const elapsed = (timestamp - startTimeRef.current) / 1000.0;

        // Устанавливаем uniform значения
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform1f(timeLocation, elapsed);
        gl.uniform2f(mouseLocation, 0, 0);

        // Очищаем и рисуем
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        animationFrameRef.current = requestAnimationFrame(render);
      };

      startTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(render);

      // Cleanup
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (resizeObserver) resizeObserver.disconnect();
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (positionBuffer && gl) {
          gl.deleteBuffer(positionBuffer);
        }
        if (program && gl) {
          gl.deleteProgram(program);
          programRef.current = null;
        }
        glRef.current = null;
      };
    } catch (err) {
      console.error("ShaderToyPreview WebGL error:", err);
      setUseFallback(true);
      return () => {};
    }
  }, [shaderId]);

  // Fallback для мобильных устройств или при отсутствии WebGL
  if (useFallback || !background) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(20, 20, 30, 0.8) 100%)",
          color: "rgba(255, 255, 255, 0.6)",
          fontSize: "10px",
          ...style,
        }}
        aria-hidden="true"
      >
        {background?.name || "Фон"}
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        minWidth: "100px",
        minHeight: "100px",
        ...style,
      }}
      width={100}
      height={100}
      aria-hidden="true"
    />
  );
}

