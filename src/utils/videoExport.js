/**
 * Утилита для экспорта видео через FFmpeg.wasm
 * Захватывает Canvas + Audio и рендерит в MP4
 */

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

// Ограничения экспорта
export const EXPORT_LIMITS = {
  FREE: {
    maxDuration: 240, // 4 минуты
    resolution: { width: 1280, height: 720 }, // 720p
    fps: 30,
    bitrate: '2M',
  },
  PREMIUM: {
    maxDuration: 240, // 4 минуты
    resolution: { width: 1920, height: 1080 }, // 1080p
    fps: 60,
    bitrate: '5M',
  },
};

// Singleton FFmpeg instance
let ffmpegInstance = null;
let isFFmpegLoaded = false;

/**
 * Инициализация FFmpeg (загружается один раз)
 */
export async function initFFmpeg(onProgress) {
  if (isFFmpegLoaded && ffmpegInstance) {
    return ffmpegInstance;
  }

  if (!ffmpegInstance) {
    ffmpegInstance = new FFmpeg();
    
    // Progress callback
    ffmpegInstance.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });
    
    ffmpegInstance.on('progress', ({ progress, time }) => {
      if (onProgress) {
        onProgress(progress * 100, time);
      }
    });
  }

  if (!isFFmpegLoaded) {
    console.log('[FFmpeg] Loading from CDN...');
    
    try {
      // Используем jsdelivr CDN (более надежный чем unpkg)
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd';
      
      console.log('[FFmpeg] Downloading ffmpeg-core.js...');
      const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript');
      
      console.log('[FFmpeg] Downloading ffmpeg-core.wasm...');
      const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm');
      
      console.log('[FFmpeg] Initializing...');
      await ffmpegInstance.load({
        coreURL,
        wasmURL,
      });
      
      isFFmpegLoaded = true;
      console.log('[FFmpeg] ✅ Loaded successfully');
    } catch (err) {
      console.error('[FFmpeg] ❌ Failed to load:', err);
      throw new Error(`Не удалось загрузить FFmpeg: ${err.message}`);
    }
  }

  return ffmpegInstance;
}

/**
 * Захват кадров из Canvas
 */
async function captureFrames(canvas, duration, fps, onFrameProgress) {
  const frames = [];
  const totalFrames = Math.floor(duration * fps);
  const frameInterval = 1000 / fps; // мс между кадрами
  
  console.log(`[Capture] Capturing ${totalFrames} frames at ${fps} FPS`);
  
  for (let i = 0; i < totalFrames; i++) {
    // Захватываем текущий кадр canvas
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', 0.95);
    });
    
    const arrayBuffer = await blob.arrayBuffer();
    frames.push(new Uint8Array(arrayBuffer));
    
    // Progress callback
    if (onFrameProgress) {
      onFrameProgress((i / totalFrames) * 100);
    }
    
    // Даем браузеру передышку каждые 30 кадров
    if (i % 30 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  console.log(`[Capture] Captured ${frames.length} frames`);
  return frames;
}

/**
 * Экспорт видео
 * @param {Object} params
 * @param {HTMLCanvasElement} params.canvas - Canvas для захвата
 * @param {string} params.audioUrl - URL аудио файла (blob или http)
 * @param {number} params.duration - Длительность в секундах
 * @param {boolean} params.isPremium - Premium пользователь?
 * @param {Function} params.onProgress - Callback прогресса (процент)
 * @returns {Promise<Blob>} - Blob MP4 файла
 */
export async function exportVideo({ 
  canvas, 
  audioUrl, 
  duration, 
  isPremium = false,
  onProgress 
}) {
  // Получаем параметры в зависимости от premium
  const limits = isPremium ? EXPORT_LIMITS.PREMIUM : EXPORT_LIMITS.FREE;
  
  // Проверяем лимиты
  if (duration > limits.maxDuration) {
    throw new Error(`Максимальная длительность для ${isPremium ? 'Premium' : 'Free'}: ${limits.maxDuration / 60} минут`);
  }
  
  const { resolution, fps, bitrate } = limits;
  
  console.log(`[Export] Starting export: ${resolution.width}x${resolution.height} @ ${fps}fps, ${duration}s`);
  
  try {
    // Инициализируем FFmpeg
    if (onProgress) onProgress(0, 'Загрузка FFmpeg...');
    const ffmpeg = await initFFmpeg((progress) => {
      if (onProgress) onProgress(progress, 'Рендеринг...');
    });
    
    // Захватываем кадры из canvas
    if (onProgress) onProgress(5, 'Захват кадров...');
    
    // Временно: простой экспорт без захвата всех кадров
    // Захватим первый кадр как обложку
    const firstFrameBlob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/jpeg', 0.95);
    });
    const firstFrame = await fetchFile(firstFrameBlob);
    
    // Сохраняем первый кадр
    await ffmpeg.writeFile('frame.jpg', firstFrame);
    
    // Загружаем аудио
    if (onProgress) onProgress(10, 'Загрузка аудио...');
    const audioData = await fetchFile(audioUrl);
    await ffmpeg.writeFile('audio.mp3', audioData);
    
    // Создаем видео из одного кадра + аудио
    // (TODO: захват всех кадров для полной анимации)
    if (onProgress) onProgress(20, 'Рендеринг видео...');
    
    await ffmpeg.exec([
      '-loop', '1',
      '-i', 'frame.jpg',
      '-i', 'audio.mp3',
      '-c:v', 'libx264',
      '-t', duration.toString(),
      '-pix_fmt', 'yuv420p',
      '-vf', `scale=${resolution.width}:${resolution.height}`,
      '-r', fps.toString(),
      '-b:v', bitrate,
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      'output.mp4'
    ]);
    
    if (onProgress) onProgress(90, 'Финализация...');
    
    // Читаем результат
    const data = await ffmpeg.readFile('output.mp4');
    const blob = new Blob([data.buffer], { type: 'video/mp4' });
    
    // Очищаем временные файлы
    await ffmpeg.deleteFile('frame.jpg');
    await ffmpeg.deleteFile('audio.mp3');
    await ffmpeg.deleteFile('output.mp4');
    
    if (onProgress) onProgress(100, 'Готово!');
    
    console.log('[Export] Video exported successfully:', blob.size, 'bytes');
    return blob;
    
  } catch (error) {
    console.error('[Export] Error:', error);
    throw error;
  }
}

/**
 * Скачать blob как файл
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
