import React, { useEffect, useRef, useState } from "react";
import { getShaderCode, compileShaderProgram } from "../../utils/webglShaders.js";
import { getBackgroundById } from "../../utils/shadertoyBackgrounds.js";
import { getPremiumBackgroundById } from "../../utils/premiumBackgrounds.js";
import { getArtistHeaderBackgroundById } from "../../utils/artistHeaderBackgrounds.js";

// Глобальный кэш для превью (в памяти)
const previewCache = new Map();

// Глобальная очередь для последовательного рендеринга всех превью
let renderQueue = [];
let isRendering = false;
let visibleCount = 0; // Счетчик видимых элементов для приоритета

const processRenderQueue = () => {
  if (isRendering || renderQueue.length === 0) return;
  
  isRendering = true;
  // Берем первый элемент из очереди
  const { canvas, shaderId, callback } = renderQueue.shift();
  
  if (!canvas || !canvas.isConnected) {
    isRendering = false;
    setTimeout(processRenderQueue, 50);
    return;
  }
  
  // Устанавливаем размеры
  canvas.width = 85;
  canvas.height = 70;
  
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    preserveDrawingBuffer: true,
    failIfMajorPerformanceCaveat: false,
  }) || canvas.getContext("experimental-webgl", {
    alpha: true,
    preserveDrawingBuffer: true,
  });
  
  if (!gl) {
    callback(null);
    isRendering = false;
    setTimeout(processRenderQueue, 50);
    return;
  }
  
  gl.getExtension('OES_standard_derivatives');
  gl.viewport(0, 0, 85, 70);
  
  const shaderCode = getShaderCode(shaderId);
  if (!shaderCode) {
    callback(null);
    isRendering = false;
    setTimeout(processRenderQueue, 50);
    return;
  }
  
  try {
    const program = compileShaderProgram(gl, shaderCode);
    if (!program) {
      callback(null);
      isRendering = false;
      setTimeout(processRenderQueue, 50);
      return;
    }
    
    gl.useProgram(program);
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const mouseLocation = gl.getUniformLocation(program, "u_mouse");
    
    // Рендерим несколько кадров для анимации (уменьшено для скорости)
    let frameCount = 0;
    const maxFrames = 3; // Было 30, теперь 3 - достаточно для превью
    const startTime = performance.now();
    
    const render = () => {
      const elapsed = (performance.now() - startTime) / 1000.0;
      
      gl.uniform2f(resolutionLocation, 85, 70);
      gl.uniform1f(timeLocation, elapsed);
      gl.uniform2f(mouseLocation, 0, 0);
      
      gl.viewport(0, 0, 85, 70);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      
      frameCount++;
      
      if (frameCount >= maxFrames) {
        // Сохраняем результат как изображение (без задержки для скорости)
        try {
          const dataURL = canvas.toDataURL('image/png');
          callback(dataURL && dataURL !== 'data:,' ? dataURL : null);
        } catch (e) {
          callback(null);
        }
        
        // Cleanup
        try {
          gl.deleteBuffer(positionBuffer);
          gl.deleteProgram(program);
        } catch (e) {
          // Ignore
        }
        
        isRendering = false;
        // Используем requestAnimationFrame для следующего элемента (быстрее чем setTimeout)
        requestAnimationFrame(() => {
          setTimeout(processRenderQueue, 5); // Минимальная задержка
        });
        return;
      }
      
      requestAnimationFrame(render);
    };
    
    render();
    
  } catch (err) {
    callback(null);
    isRendering = false;
    setTimeout(processRenderQueue, 50);
  }
};

/**
 * Компонент для превью ShaderToy фона (мини-версия)
 * Рендерит один раз при загрузке и показывает статичное изображение
 */
export default function ShaderToyPreview({ backgroundId, style = {}, priority = false }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const hasRenderedRef = useRef(false);
  const observerRef = useRef(null);
  const isPriorityRef = useRef(priority || visibleCount < 12); // Первые 12 - приоритетные

  // Проверяем фоны в следующем порядке: артист, обычные, премиум
  let background = getArtistHeaderBackgroundById(backgroundId);
  if (!background) {
    background = getBackgroundById(backgroundId);
  }
  if (!background) {
    const premiumBg = getPremiumBackgroundById(backgroundId);
    if (premiumBg && premiumBg.type === "shadertoy") {
      background = {
        id: premiumBg.shaderId,
        name: premiumBg.name,
        shaderId: premiumBg.shaderId,
      };
    }
  }

  const shaderId = background?.shaderId || background?.id || backgroundId;

  // Проверяем кэш перед рендерингом
  useEffect(() => {
    if (!shaderId) return;
    
    // Проверяем кэш
    const cached = previewCache.get(shaderId);
    if (cached) {
      setImageSrc(cached);
      hasRenderedRef.current = true;
      return;
    }
  }, [shaderId]);

  // Ленивая загрузка через Intersection Observer или немедленная для приоритетных
  useEffect(() => {
    if (!shaderId || hasRenderedRef.current || imageSrc) return;
    
    const container = containerRef.current;
    if (!container) return;

    // Для приоритетных элементов рендерим сразу
    if (isPriorityRef.current) {
      visibleCount++;
      const canvas = canvasRef.current;
      
      const startRender = () => {
        if (!canvas || hasRenderedRef.current) return;
        
        // Проверяем кэш еще раз
        const cached = previewCache.get(shaderId);
        if (cached) {
          setImageSrc(cached);
          hasRenderedRef.current = true;
          return;
        }
        
        // Добавляем в начало очереди (приоритет)
        renderQueue.unshift({
          canvas,
          shaderId,
          callback: (dataURL) => {
            if (dataURL) {
              previewCache.set(shaderId, dataURL);
              setImageSrc(dataURL);
            }
            hasRenderedRef.current = true;
          }
        });
        
        processRenderQueue();
      };
      
      if (canvas) {
        startRender();
      } else {
        // Ждем canvas
        const checkCanvas = setInterval(() => {
          if (canvasRef.current) {
            clearInterval(checkCanvas);
            startRender();
          }
        }, 50);
        setTimeout(() => clearInterval(checkCanvas), 2000);
      }
      
      return;
    }

    // Для остальных - используем Intersection Observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasRenderedRef.current) {
            // Элемент виден - начинаем рендеринг
            const canvas = canvasRef.current;
            if (!canvas) {
              // Ждем, пока canvas появится
              const checkCanvas = setInterval(() => {
                if (canvasRef.current && !hasRenderedRef.current) {
                  clearInterval(checkCanvas);
                  // Проверяем кэш еще раз
                  const cached = previewCache.get(shaderId);
                  if (cached) {
                    setImageSrc(cached);
                    hasRenderedRef.current = true;
                    return;
                  }
                  
                  // Добавляем в очередь
                  renderQueue.push({
                    canvas: canvasRef.current,
                    shaderId,
                    callback: (dataURL) => {
                      if (dataURL) {
                        // Сохраняем в кэш
                        previewCache.set(shaderId, dataURL);
                        setImageSrc(dataURL);
                      }
                      hasRenderedRef.current = true;
                    }
                  });
                  processRenderQueue();
                }
              }, 50);
              
              setTimeout(() => clearInterval(checkCanvas), 5000); // Таймаут
              return;
            }
            
            // Проверяем кэш еще раз
            const cached = previewCache.get(shaderId);
            if (cached) {
              setImageSrc(cached);
              hasRenderedRef.current = true;
              return;
            }
            
            // Canvas готов - добавляем в очередь
            renderQueue.push({
              canvas,
              shaderId,
              callback: (dataURL) => {
                if (dataURL) {
                  // Сохраняем в кэш
                  previewCache.set(shaderId, dataURL);
                  setImageSrc(dataURL);
                }
                hasRenderedRef.current = true;
              }
            });
            
            processRenderQueue();
            
            // Отключаем observer после начала рендеринга
            if (observerRef.current) {
              observerRef.current.unobserve(container);
            }
          }
        });
      },
      {
        rootMargin: '100px', // Начинаем загрузку за 100px до появления в viewport
        threshold: 0.01
      }
    );

    observerRef.current.observe(container);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [shaderId, backgroundId, imageSrc]);

  return (
    <div 
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: "85px",
        minHeight: "70px",
        ...style
      }}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      ) : (
        <div style={{
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
        }}>
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              position: "absolute",
              top: 0,
              left: 0,
              minWidth: "85px",
              minHeight: "70px",
              backgroundColor: "transparent",
              zIndex: 1,
              pointerEvents: "none",
            }}
            width={85}
            height={70}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
