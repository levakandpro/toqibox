import React, { useEffect, useRef, useState } from "react";
import { getBackgroundById } from "../../utils/shadertoyBackgrounds.js";
import { getPremiumBackgroundById } from "../../utils/premiumBackgrounds.js";
import { getShaderCode, compileShaderProgram } from "../../utils/webglShaders.js";

export default function ShaderToyBackground({ backgroundId }) {
  const canvasRef = useRef(null);
  const glRef = useRef(null);
  const programRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const [error, setError] = useState(null);

  // Проверяем сначала обычные фоны, потом премиум
  let background = getBackgroundById(backgroundId);
  let shaderId = backgroundId;
  
  if (!background) {
    const premiumBg = getPremiumBackgroundById(backgroundId);
    if (premiumBg && premiumBg.type === "shadertoy") {
      // Создаем объект фона для премиум ShaderToy
      background = {
        id: premiumBg.shaderId,
        name: premiumBg.name,
        shaderId: premiumBg.shaderId,
      };
      shaderId = premiumBg.shaderId;
    }
  } else {
    shaderId = background.id;
  }

  useEffect(() => {
    if (!shaderId || !canvasRef.current) {
      return () => {};
    }

    setError(null);
    const canvas = canvasRef.current;
    // Создаем WebGL контекст без альфа-канала для лучшей производительности и четкости
    const gl = canvas.getContext("webgl", { 
      alpha: false, 
      antialias: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false
    }) || canvas.getContext("experimental-webgl", { 
      alpha: false 
    });
    
        if (!gl) {
      setError("WebGL не поддерживается");
      return () => {};
    }

    // Включаем расширение для fwidth (если нужно)
    const ext = gl.getExtension('OES_standard_derivatives');
    if (!ext) {
      console.warn('OES_standard_derivatives extension not available');
    }

    glRef.current = gl;

    // Устанавливаем размер canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Получаем код шейдера по shaderId
    const shaderCode = getShaderCode(shaderId);
    if (!shaderCode) {
      console.error(`ShaderToyBackground: Шейдер для ${shaderId} не найден`);
      setError(`Шейдер для ${shaderId} не найден`);
      window.removeEventListener("resize", resizeCanvas);
      return () => {};
    }

    let program = null;
    let positionBuffer = null;

    // Компилируем шейдер программу
    try {
      program = compileShaderProgram(gl, shaderCode);
      if (!program) {
        setError("Ошибка компиляции шейдера");
        window.removeEventListener("resize", resizeCanvas);
        return () => {};
      }
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
        gl.uniform2f(mouseLocation, 0, 0); // Можно добавить поддержку мыши позже

        // Очищаем и рисуем
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1); // Непрозрачный черный фон
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        animationFrameRef.current = requestAnimationFrame(render);
      };

      startTimeRef.current = performance.now();
      animationFrameRef.current = requestAnimationFrame(render);

      // Cleanup
      return () => {
        window.removeEventListener("resize", resizeCanvas);
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
    };
    } catch (err) {
      console.error("WebGL error:", err);
      setError(err.message);
      window.removeEventListener("resize", resizeCanvas);
      return () => {};
    }
  }, [background, shaderId]);

  if (!shaderId) return null;

  if (error) {
    console.warn("ShaderToyBackground error:", error);
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1, // Отрицательный z-index, чтобы быть за всеми элементами
          pointerEvents: "none",
          background: "linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 50%, #0a0e1a 100%)",
          opacity: 0.6,
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1, // Отрицательный z-index, чтобы быть за всеми элементами
        pointerEvents: "none",
        opacity: 1, // Полная непрозрачность для четкости
      }}
      aria-hidden="true"
    />
  );
}
