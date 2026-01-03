import React, { useEffect, useRef, useState } from "react";
import { getShaderCode, compileShaderProgram } from "../../utils/webglShaders.js";
import { getBackgroundById } from "../../utils/shadertoyBackgrounds.js";
import { getPremiumBackgroundById } from "../../utils/premiumBackgrounds.js";
import { getArtistHeaderBackgroundById } from "../../utils/artistHeaderBackgrounds.js";

// Глобальная очередь для последовательного рендеринга всех превью
let renderQueue = [];
let isRendering = false;

const processRenderQueue = () => {
  if (isRendering || renderQueue.length === 0) return;
  
  isRendering = true;
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
    
    // Рендерим несколько кадров для анимации
    let frameCount = 0;
    const maxFrames = 30;
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
        // Сохраняем результат как изображение
        setTimeout(() => {
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
          setTimeout(processRenderQueue, 100); // Задержка перед следующим
        }, 100);
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
export default function ShaderToyPreview({ backgroundId, style = {} }) {
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const hasRenderedRef = useRef(false);

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

  useEffect(() => {
    if (!shaderId || hasRenderedRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) {
      // Ждем, пока canvas появится
      const checkCanvas = setInterval(() => {
        if (canvasRef.current) {
          clearInterval(checkCanvas);
          // Добавляем в очередь после небольшой задержки
          setTimeout(() => {
            if (!hasRenderedRef.current && canvasRef.current) {
              renderQueue.push({
                canvas: canvasRef.current,
                shaderId,
                callback: (dataURL) => {
                  if (dataURL) {
                    setImageSrc(dataURL);
                  }
                  hasRenderedRef.current = true;
                }
              });
              processRenderQueue();
            }
          }, 100);
        }
      }, 50);
      
      return () => clearInterval(checkCanvas);
    }
    
    // Canvas готов - добавляем в очередь
    renderQueue.push({
      canvas,
      shaderId,
      callback: (dataURL) => {
        if (dataURL) {
          setImageSrc(dataURL);
        }
        hasRenderedRef.current = true;
      }
    });
    
    processRenderQueue();
  }, [shaderId, backgroundId]);

  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "100%",
      minWidth: "85px",
      minHeight: "70px",
      ...style
    }}>
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
      )}
    </div>
  );
}
