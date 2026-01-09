import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { spawn } from 'child_process';
import { mkdir, writeFile, unlink, rmdir, readdir, readFile } from 'fs/promises';
import { createWriteStream, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { tmpdir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ========================================
// КОНФИГУРАЦИЯ
// ========================================

const EXPORT_CONFIG = {
  MAX_DURATION_SEC: 240, // 4 минуты
  MAX_PARALLEL_EXPORTS: 2,
  EXPORT_TIMEOUT_MS: 600000, // 10 минут
  FPS: 30,
  RESOLUTIONS: {
    free: { width: 1280, height: 720 },
    premium: { width: 1920, height: 1080 },
  },
};

// In-memory очередь (для production - Redis/DB)
const exportJobs = new Map();
let activeExports = 0;

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// ========================================
// POST /export - Создать задачу экспорта
// ========================================

app.post('/export', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
]), async (req, res) => {
  try {
    const { duration, plan = 'free' } = req.body;
    const audioFile = req.files['audio']?.[0];
    const photoFile = req.files['photo']?.[0];

    console.log('[Export API] Новый запрос:', { duration, plan });

    // Валидация
    if (!audioFile || !photoFile) {
      return res.status(400).json({ error: 'Требуются audio и photo файлы' });
    }

    const durationSec = parseFloat(duration);
    if (!durationSec || durationSec <= 0) {
      return res.status(400).json({ error: 'Некорректная длительность' });
    }

    if (durationSec > EXPORT_CONFIG.MAX_DURATION_SEC) {
      return res.status(400).json({
        error: `Максимальная длительность: ${EXPORT_CONFIG.MAX_DURATION_SEC / 60} минут`,
      });
    }

    if (!['free', 'premium'].includes(plan)) {
      return res.status(400).json({ error: 'Неверный plan: free | premium' });
    }

    // Создаем задачу
    const jobId = randomUUID();
    const resolution = EXPORT_CONFIG.RESOLUTIONS[plan];

    const job = {
      jobId,
      plan,
      durationSec,
      resolution,
      audioBuffer: audioFile.buffer,
      photoBuffer: photoFile.buffer,
      status: 'queued',
      progress: 0,
      createdAt: Date.now(),
    };

    exportJobs.set(jobId, job);
    console.log(`[Export API] Задача создана: ${jobId}`);

    // Запускаем обработку
    processQueue();

    res.status(202).json({
      success: true,
      jobId,
      status: 'queued',
      message: 'Экспорт добавлен в очередь',
    });
  } catch (error) {
    console.error('[Export API] Ошибка:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// GET /export/:jobId - Проверить статус
// ========================================

app.get('/export/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = exportJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Экспорт не найден' });
  }

  const response = {
    jobId: job.jobId,
    status: job.status,
    progress: job.progress,
    plan: job.plan,
    resolution: job.resolution,
    createdAt: job.createdAt,
  };

  if (job.status === 'completed' && job.outputPath) {
    response.downloadUrl = `/download/${jobId}`;
  }

  if (job.status === 'failed') {
    response.error = job.error;
  }

  res.json(response);
});

// ========================================
// GET /download/:jobId - Скачать MP4
// ========================================

app.get('/download/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = exportJobs.get(jobId);

  if (!job || job.status !== 'completed' || !job.outputPath) {
    return res.status(404).json({ error: 'Файл не найден' });
  }

  try {
    const fileBuffer = await readFile(job.outputPath);

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="TQ-STUDIO.mp4"`);
    res.setHeader('Content-Length', fileBuffer.length);
    res.send(fileBuffer);

    console.log(`[Download] Файл отдан: ${jobId}`);

    // Очистка через 5 секунд
    setTimeout(() => cleanupJob(jobId), 5000);
  } catch (error) {
    console.error('[Download] Ошибка:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========================================
// ОБРАБОТКА ОЧЕРЕДИ
// ========================================

async function processQueue() {
  if (activeExports >= EXPORT_CONFIG.MAX_PARALLEL_EXPORTS) {
    console.log('[Queue] Достигнут лимит параллельных экспортов');
    return;
  }

  const job = Array.from(exportJobs.values()).find((j) => j.status === 'queued');
  if (!job) return;

  job.status = 'processing';
  job.progress = 0;
  activeExports++;

  console.log(`[Queue] Начинаем экспорт ${job.jobId}`);

  try {
    await performExport(job);
    job.status = 'completed';
    job.progress = 100;
    console.log(`[Queue] ✅ Экспорт завершен: ${job.jobId}`);
  } catch (error) {
    job.status = 'failed';
    job.error = error.message;
    job.progress = 0;
    console.error(`[Queue] ❌ Экспорт провалился: ${job.jobId}`, error);
    
    // Удалить failed job через 5 минут (чтобы клиент успел получить ошибку)
    setTimeout(() => {
      exportJobs.delete(job.jobId);
      console.log(`[Cleanup] Удален failed job: ${job.jobId}`);
    }, 300000); // 5 минут
  } finally {
    activeExports--;
    processQueue(); // Следующий в очереди
  }
}

// ========================================
// ВЫПОЛНЕНИЕ ЭКСПОРТА (OFFLINE RENDER)
// ========================================

async function performExport(job) {
  const { jobId, resolution, durationSec, audioBuffer, photoBuffer } = job;

  const tmpPath = join(tmpdir(), 'toqibox-exports', jobId);
  await mkdir(tmpPath, { recursive: true });

  console.log(`[Export ${jobId}] Временная папка: ${tmpPath}`);

  try {
    // Сохраняем аудио
    const audioPath = join(tmpPath, 'audio.mp3');
    await writeFile(audioPath, audioBuffer);

    // Сохраняем фото
    const photoPath = join(tmpPath, 'photo.jpg');
    await writeFile(photoPath, photoBuffer);

    job.progress = 20;
    console.log(`[Export ${jobId}] Файлы сохранены, запускаем FFmpeg...`);

    // ========================================
    // FFMPEG: Статичное видео (фото + аудио)
    // ========================================
    // Простая версия: loop фото + аудио = MP4

    const outputPath = join(tmpPath, 'output.mp4');

    await runFFmpeg([
      '-y',
      '-loop', '1',
      '-i', photoPath,
      '-i', audioPath,
      '-c:v', 'libx264',
      '-tune', 'stillimage',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-pix_fmt', 'yuv420p',
      '-shortest',
      '-t', durationSec.toString(),
      '-vf', `scale=${resolution.width}:${resolution.height}`,
      '-movflags', '+faststart',
      outputPath,
    ], jobId);

    job.progress = 95;
    job.outputPath = outputPath;

    console.log(`[Export ${jobId}] ✅ MP4 готов: ${outputPath}`);

    job.progress = 100;
  } catch (error) {
    console.error(`[Export ${jobId}] ❌ Ошибка:`, error);
    // НЕ удаляем job сразу - пусть клиент получит ошибку через GET /export/:jobId
    // Cleanup произойдет через 5 минут (см. processQueue catch block)
    
    // Но очищаем временные файлы
    try {
      const tmpPath = join(tmpdir(), 'toqibox-exports', jobId);
      if (existsSync(tmpPath)) {
        const files = await readdir(tmpPath);
        for (const file of files) {
          await unlink(join(tmpPath, file));
        }
        await rmdir(tmpPath);
        console.log(`[Cleanup] Временные файлы удалены (после ошибки): ${jobId}`);
      }
    } catch (cleanupError) {
      console.error(`[Cleanup] Ошибка очистки: ${jobId}`, cleanupError);
    }
    
    throw error;
  }
}

// TODO: В будущем можно добавить покадровый рендер с эффектами
// Для этого нужно будет вернуть canvas и функцию renderFrameAtTime

// ========================================
// ЗАПУСК FFMPEG
// ========================================

function runFFmpeg(args, jobId) {
  return new Promise((resolve, reject) => {
    // Полный путь к FFmpeg (для Windows)
    const ffmpegPath = process.platform === 'win32' 
      ? 'C:\\ffmpeg\\bin\\ffmpeg.exe' 
      : 'ffmpeg';
    
    console.log(`[FFmpeg ${jobId}] Команда:`, ffmpegPath, args.join(' '));

    const ffmpeg = spawn(ffmpegPath, args);
    let stderr = '';

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`[FFmpeg ${jobId}] ✅ Завершен успешно`);
        resolve();
      } else {
        console.error(`[FFmpeg ${jobId}] ❌ Код ошибки: ${code}`);
        console.error(`[FFmpeg ${jobId}] stderr:`, stderr);
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (error) => {
      console.error(`[FFmpeg ${jobId}] ❌ Ошибка процесса:`, error);
      reject(error);
    });

    // Таймаут
    const timeout = setTimeout(() => {
      ffmpeg.kill('SIGKILL');
      reject(new Error('FFmpeg timeout'));
    }, EXPORT_CONFIG.EXPORT_TIMEOUT_MS);

    ffmpeg.on('close', () => clearTimeout(timeout));
  });
}

// ========================================
// ОЧИСТКА
// ========================================

async function cleanupJob(jobId) {
  const job = exportJobs.get(jobId);
  if (!job) return;

  try {
    const tmpPath = join(tmpdir(), 'toqibox-exports', jobId);
    if (existsSync(tmpPath)) {
      const files = await readdir(tmpPath);
      for (const file of files) {
        await unlink(join(tmpPath, file));
      }
      await rmdir(tmpPath);
      console.log(`[Cleanup] Временные файлы удалены: ${jobId}`);
    }
  } catch (error) {
    console.error(`[Cleanup] Ошибка: ${jobId}`, error);
  }

  exportJobs.delete(jobId);
}

// ========================================
// ЗАПУСК СЕРВЕРА
// ========================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   TOQIBOX Export Server (FFmpeg)       ║
║   http://localhost:${PORT}              ║
╚════════════════════════════════════════╝

Endpoints:
  POST   /export          - Создать экспорт
  GET    /export/:jobId   - Статус экспорта
  GET    /download/:jobId - Скачать MP4

Config:
  Max duration: ${EXPORT_CONFIG.MAX_DURATION_SEC / 60} минут
  Max parallel: ${EXPORT_CONFIG.MAX_PARALLEL_EXPORTS}
  FPS: ${EXPORT_CONFIG.FPS}
  
Resolutions:
  Free:    ${EXPORT_CONFIG.RESOLUTIONS.free.width}x${EXPORT_CONFIG.RESOLUTIONS.free.height}
  Premium: ${EXPORT_CONFIG.RESOLUTIONS.premium.width}x${EXPORT_CONFIG.RESOLUTIONS.premium.height}
  `);
});
