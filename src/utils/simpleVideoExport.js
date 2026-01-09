/**
 * Простой экспорт через MediaRecorder API (встроенный в браузер)
 * Не требует загрузки FFmpeg.wasm
 * Работает быстрее, но качество зависит от браузера
 */

/**
 * Создает временный canvas из элемента DOM
 */
async function createCanvasFromElement(element) {
  const rect = element.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  canvas.width = rect.width;
  canvas.height = rect.height;
  
  const ctx = canvas.getContext('2d');
  
  // Копируем стили и содержимое
  const computedStyle = window.getComputedStyle(element);
  ctx.fillStyle = computedStyle.backgroundColor || '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  return canvas;
}

export const SIMPLE_EXPORT_LIMITS = {
  FREE: {
    maxDuration: 240, // 4 минуты
    videoBitsPerSecond: 2500000, // 2.5 Mbps
  },
  PREMIUM: {
    maxDuration: 240, // 4 минуты
    videoBitsPerSecond: 5000000, // 5 Mbps
  },
};

/**
 * Простой экспорт через MediaRecorder
 * Захватывает canvas + audio в реальном времени
 */
export async function simpleExportVideo({
  canvas,
  audioUrl,
  duration,
  isPremium = false,
  onProgress,
}) {
  const limits = isPremium ? SIMPLE_EXPORT_LIMITS.PREMIUM : SIMPLE_EXPORT_LIMITS.FREE;

  // Проверяем лимиты
  if (duration > limits.maxDuration) {
    throw new Error(
      `Максимальная длительность: ${limits.maxDuration / 60} минут`
    );
  }

  console.log('[SimpleExport] Starting export...');
  
  if (onProgress) onProgress(5, 'Подготовка...');

  try {
    // Создаем временный audio элемент для захвата
    const audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous';
    
    // Ждем загрузки метаданных
    await new Promise((resolve, reject) => {
      audio.addEventListener('loadedmetadata', resolve, { once: true });
      audio.addEventListener('error', reject, { once: true });
      audio.load();
    });

    console.log('[SimpleExport] Audio loaded, duration:', audio.duration);
    
    if (onProgress) onProgress(10, 'Настройка рекордера...');

    // Проверяем поддержку captureStream
    if (!canvas || typeof canvas.captureStream !== 'function') {
      console.log('[SimpleExport] canvas.captureStream not supported, creating fallback canvas');
      
      // Создаем fallback canvas
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 1280;
      fallbackCanvas.height = 720;
      const ctx = fallbackCanvas.getContext('2d');
      
      // Заполняем черным фоном с текстом
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TOQIBOX Studio', fallbackCanvas.width / 2, fallbackCanvas.height / 2);
      
      canvas = fallbackCanvas;
    }

    // Создаем MediaStream из canvas
    const canvasStream = canvas.captureStream(30); // 30 fps
    
    // Создаем AudioContext для захвата аудио
    const audioContext = new AudioContext();
    const audioSource = audioContext.createMediaElementSource(audio);
    const audioDestination = audioContext.createMediaStreamDestination();
    audioSource.connect(audioDestination);
    audioSource.connect(audioContext.destination); // Чтобы слышать во время записи
    
    // Объединяем видео и аудио потоки
    const videoTrack = canvasStream.getVideoTracks()[0];
    const audioTrack = audioDestination.stream.getAudioTracks()[0];
    
    const combinedStream = new MediaStream([videoTrack, audioTrack]);
    
    // Определяем MIME type (проверяем поддержку браузером)
    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8,opus';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
    
    console.log('[SimpleExport] Using MIME type:', mimeType);

    // Создаем MediaRecorder
    const recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: limits.videoBitsPerSecond,
    });

    const chunks = [];
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    // Промис для завершения записи
    const recordingPromise = new Promise((resolve, reject) => {
      recorder.onstop = () => {
        console.log('[SimpleExport] Recording stopped, creating blob...');
        const blob = new Blob(chunks, { type: mimeType });
        resolve(blob);
      };
      
      recorder.onerror = (e) => {
        console.error('[SimpleExport] Recorder error:', e);
        reject(e.error || new Error('Recording failed'));
      };
    });

    if (onProgress) onProgress(20, 'Запись видео...');

    // Начинаем запись
    recorder.start(100); // Сохраняем чанки каждые 100мс
    
    // Запускаем аудио
    await audio.play();
    
    console.log('[SimpleExport] Recording started');

    // Обновляем прогресс во время записи
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min((elapsed / duration) * 80 + 20, 95);
      
      if (onProgress) {
        const remaining = Math.max(0, Math.ceil(duration - elapsed));
        onProgress(progress, `Запись: ${remaining}s...`);
      }
      
      if (elapsed >= duration) {
        clearInterval(progressInterval);
      }
    }, 500);

    // Ждем окончания аудио
    await new Promise((resolve) => {
      audio.addEventListener('ended', resolve, { once: true });
      
      // На всякий случай таймаут (duration + 1 секунда)
      setTimeout(resolve, (duration + 1) * 1000);
    });

    clearInterval(progressInterval);
    
    if (onProgress) onProgress(95, 'Финализация...');

    // Останавливаем запись
    recorder.stop();
    
    // Останавливаем все треки
    combinedStream.getTracks().forEach(track => track.stop());
    canvasStream.getTracks().forEach(track => track.stop());
    
    // Очищаем audio context
    await audioContext.close();
    
    // Ждем завершения записи
    const blob = await recordingPromise;
    
    if (onProgress) onProgress(100, 'Готово!');
    
    console.log('[SimpleExport] Export complete, size:', blob.size, 'bytes');
    
    return blob;

  } catch (error) {
    console.error('[SimpleExport] Error:', error);
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
