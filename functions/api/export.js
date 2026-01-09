// ВАЖНО: Cloudflare Pages Functions НЕ поддерживают Node.js модули!
// child_process, fs, os - недоступны в Cloudflare Workers runtime

// Временно закомментировано для Cloudflare Pages
// import { spawn } from 'child_process';
// import { mkdir, writeFile, unlink, rmdir, readdir } from 'fs/promises';
// import { createWriteStream } from 'fs';
// import { join } from 'path';
// import { randomUUID } from 'crypto';
// import { tmpdir } from 'os';

// ========================================
// КОНФИГУРАЦИЯ
// ========================================

const EXPORT_LIMITS = {
  MAX_DURATION_SEC: 240, // 4 минуты
  MAX_PARALLEL_EXPORTS: 2, // Максимум 2 одновременно
  EXPORT_TIMEOUT_MS: 600000, // 10 минут
};

const RESOLUTIONS = {
  free: { width: 1280, height: 720 },
  premium: { width: 1920, height: 1080 },
};

// Очередь экспортов (in-memory для V1)
const exportQueue = [];
let activeExports = 0;

// ========================================
// CLOUDFLARE PAGES FUNCTION HANDLER
// ========================================

export async function onRequestPost(context) {
  // ========================================
  // CLOUDFLARE PAGES НЕ ПОДДЕРЖИВАЕТ FFMPEG!
  // ========================================
  
  console.error('[Export API] ❌ FFmpeg недоступен на Cloudflare Pages');
  
  return new Response(
    JSON.stringify({
      error: 'FFmpeg экспорт недоступен на Cloudflare Pages',
      details: 'Cloudflare Workers не поддерживают Node.js модули (child_process, fs, os)',
      solutions: [
        {
          name: 'Браузерный экспорт (WebM)',
          description: 'Используйте MediaRecorder API для экспорта WebM прямо в браузере',
          available: true,
        },
        {
          name: 'Отдельный API сервер',
          description: 'Разверните Node.js сервер с FFmpeg на Railway, Render, или VPS',
          available: false,
        },
        {
          name: 'Netlify Functions',
          description: 'Netlify поддерживает FFmpeg в Functions',
          available: false,
        },
      ],
      recommendation: 'Используйте браузерный экспорт (уже работает в коде)',
    }),
    {
      status: 501, // Not Implemented
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

// ========================================
// ОБРАБОТКА ОЧЕРЕДИ
// ========================================

async function processQueue() {
  if (activeExports >= EXPORT_LIMITS.MAX_PARALLEL_EXPORTS) {
    console.log('[Export Queue] Достигнут лимит параллельных экспортов:', activeExports);
    return;
  }

  const job = exportQueue.find((j) => j.status === 'queued');
  if (!job) return;

  job.status = 'processing';
  activeExports++;

  console.log(`[Export Queue] Начинаем экспорт ${job.jobId} (${activeExports}/${EXPORT_LIMITS.MAX_PARALLEL_EXPORTS})`);

  try {
    await performExport(job);
    job.status = 'completed';
    console.log(`[Export Queue] ✅ Экспорт ${job.jobId} завершен`);
  } catch (error) {
    job.status = 'failed';
    job.error = error.message;
    console.error(`[Export Queue] ❌ Экспорт ${job.jobId} провалился:`, error.message);
  } finally {
    activeExports--;
    // Удаляем из очереди через 5 минут (чтобы клиент успел забрать результат)
    setTimeout(() => {
      const index = exportQueue.findIndex((j) => j.jobId === job.jobId);
      if (index !== -1) exportQueue.splice(index, 1);
    }, 300000); // 5 минут

    // Запускаем следующий экспорт
    processQueue();
  }
}

// ========================================
// ВЫПОЛНЕНИЕ ЭКСПОРТА
// ========================================

async function performExport(job) {
  const { jobId, resolution, durationSec, audioFile, photoFile } = job;

  // Создаем временную папку
  const tmpPath = join(tmpdir(), 'toqibox-exports', jobId);
  await mkdir(tmpPath, { recursive: true });

  console.log(`[Export ${jobId}] Временная папка: ${tmpPath}`);

  try {
    // Сохраняем файлы
    const audioPath = join(tmpPath, 'audio.mp3');
    const photoPath = join(tmpPath, 'photo.jpg');
    const outputPath = join(tmpPath, 'output.mp4');

    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    const photoBuffer = Buffer.from(await photoFile.arrayBuffer());

    await writeFile(audioPath, audioBuffer);
    await writeFile(photoPath, photoBuffer);

    console.log(`[Export ${jobId}] Файлы сохранены, запускаем FFmpeg...`);

    // ========================================
    // FFMPEG КОМАНДА
    // ========================================
    // Делаем статичное видео: фото + аудио = MP4
    // ffmpeg -loop 1 -i photo.jpg -i audio.mp3 -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -t {duration} -vf "scale={width}:{height}" -movflags +faststart output.mp4

    const ffmpegArgs = [
      '-y', // Перезаписать файл если существует
      '-loop', '1', // Зациклить фото
      '-i', photoPath, // Входной файл - фото
      '-i', audioPath, // Входной файл - аудио
      '-c:v', 'libx264', // Видео кодек H.264
      '-tune', 'stillimage', // Оптимизация для статичного изображения
      '-c:a', 'aac', // Аудио кодек AAC
      '-b:a', '192k', // Битрейт аудио
      '-pix_fmt', 'yuv420p', // Формат пикселей (совместимость)
      '-shortest', // Обрезать по длине самого короткого потока
      '-t', durationSec.toString(), // Длительность
      '-vf', `scale=${resolution.width}:${resolution.height}`, // Разрешение
      '-movflags', '+faststart', // Оптимизация для веб
      outputPath, // Выходной файл
    ];

    console.log(`[Export ${jobId}] FFmpeg команда:`, 'ffmpeg', ffmpegArgs.join(' '));

    // Запускаем FFmpeg
    await runFFmpeg(ffmpegArgs, jobId);

    console.log(`[Export ${jobId}] ✅ FFmpeg завершен, файл готов: ${outputPath}`);

    // Сохраняем путь к готовому файлу в job
    job.outputPath = outputPath;
    job.outputSize = (await readFile(outputPath)).length;

    return outputPath;
  } catch (error) {
    console.error(`[Export ${jobId}] ❌ Ошибка экспорта:`, error);
    // Очистка временных файлов
    await cleanupTempFiles(tmpPath);
    throw error;
  }
}

// ========================================
// ЗАПУСК FFMPEG
// ========================================

function runFFmpeg(args, jobId) {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', args);

    let stderr = '';

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
      // Логируем прогресс (опционально)
      const progressMatch = stderr.match(/time=(\d+):(\d+):(\d+\.\d+)/);
      if (progressMatch) {
        const [, hours, minutes, seconds] = progressMatch;
        const totalSeconds = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
        console.log(`[Export ${jobId}] Прогресс: ${totalSeconds.toFixed(1)}s`);
      }
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`[Export ${jobId}] FFmpeg завершен успешно (код: ${code})`);
        resolve();
      } else {
        console.error(`[Export ${jobId}] FFmpeg завершен с ошибкой (код: ${code})`);
        console.error(`[Export ${jobId}] FFmpeg stderr:`, stderr);
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (error) => {
      console.error(`[Export ${jobId}] FFmpeg process error:`, error);
      reject(error);
    });

    // Таймаут
    const timeout = setTimeout(() => {
      console.error(`[Export ${jobId}] ⏱ Превышен таймаут экспорта, убиваем процесс`);
      ffmpeg.kill('SIGKILL');
      reject(new Error('Export timeout exceeded'));
    }, EXPORT_LIMITS.EXPORT_TIMEOUT_MS);

    ffmpeg.on('close', () => clearTimeout(timeout));
  });
}

// ========================================
// ОЧИСТКА ВРЕМЕННЫХ ФАЙЛОВ
// ========================================

async function cleanupTempFiles(tmpPath) {
  try {
    console.log(`[Cleanup] Удаляем временную папку: ${tmpPath}`);
    const files = await readdir(tmpPath);
    for (const file of files) {
      await unlink(join(tmpPath, file));
    }
    await rmdir(tmpPath);
    console.log(`[Cleanup] ✅ Папка удалена: ${tmpPath}`);
  } catch (error) {
    console.error(`[Cleanup] ❌ Ошибка очистки:`, error);
  }
}

// ========================================
// API ДЛЯ ПРОВЕРКИ СТАТУСА ЭКСПОРТА
// ========================================

export async function onRequestGet(context) {
  return new Response(
    JSON.stringify({
      error: 'FFmpeg экспорт недоступен на Cloudflare Pages',
      message: 'Используйте браузерный экспорт через MediaRecorder (WebM)',
    }),
    {
      status: 501,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

// Хелпер для чтения файла (нужен для определения размера)
async function readFile(path) {
  const { readFile } = await import('fs/promises');
  return readFile(path);
}
