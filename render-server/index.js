const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const { z } = require('zod');
const path = require('path');
const fs = require('fs-extra');
const { chromium } = require('playwright');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const axios = require('axios');

const app = express();
const PORT = 3001;

// Устанавливаем путь к FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

// Middleware
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

// In-memory storage для задач
const jobs = new Map();

// Путь к jobs директории
const JOBS_DIR = path.join(__dirname, 'jobs');
const RENDERER_HTML_PATH = path.join(__dirname, 'renderer', 'renderer.html');

// Создаем jobs директорию если её нет
fs.ensureDirSync(JOBS_DIR);

// Разрешения по планам
const RESOLUTIONS = {
  free: { width: 1280, height: 720 },
  premium: { width: 1920, height: 1080 }
};

// Схема валидации для POST /export
const exportRequestSchema = z.object({
  audioUrl: z.string().url().refine((url) => {
    return url.endsWith('.mp3') || url.includes('.mp3?') || url.includes('.mp3#');
  }, {
    message: "audioUrl must be an MP3 file"
  }),
  durationSec: z.number().int().positive().max(240),
  plan: z.enum(['free', 'premium'])
});

// Функция для запуска job
async function runJob(job) {
  const jobId = job.job_id;
  const jobDir = path.join(JOBS_DIR, jobId);
  const framesDir = path.join(jobDir, 'frames');
  const outputPath = path.join(jobDir, 'out.mp4');
  const audioPath = path.join(jobDir, 'audio.mp3');
  
  try {
    // Обновляем статус
    job.status = 'rendering';
    job.progress = 0;
    job.error = null;
    
    // Создаем директории
    await fs.ensureDir(framesDir);
    
    const resolution = RESOLUTIONS[job.plan];
    const fps = 30;
    const totalFrames = Math.floor(job.durationSec * fps);
    
    // Запускаем браузер
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: resolution.width, height: resolution.height }
    });
    const page = await context.newPage();
    
    // Открываем реальную страницу Studio в режиме render
    const studioUrl = `http://127.0.0.1:5174/studio?render=1`;
    await page.goto(studioUrl, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Ждем готовности renderFrame
    await page.waitForFunction(() => typeof window.renderFrame === 'function', { timeout: 30000 });
    
    // Параметры для renderFrame
    const jobParams = {
      durationSec: job.durationSec,
      fps: fps,
      width: resolution.width,
      height: resolution.height,
      bgImageUrl: job.bgImageUrl || null,
      presetId: job.presetId || null,
      presetParams: job.presetParams || {}
    };
    
    // Находим canvas элемент
    const canvasHandle = await page.$('.canvas-16x9');
    if (!canvasHandle) {
      throw new Error('Canvas element not found');
    }
    
    // Рендерим кадры
    for (let i = 0; i < totalFrames; i++) {
      const t = i / fps;
      
      // Читаем текущий счетчик кадров
      const prev = await page.evaluate(() => window.__frameId || 0);
      
      // Вызываем renderFrame (async функция)
      await page.evaluate((time, params) => {
        if (window.renderFrame) {
          return window.renderFrame(time, params);
        }
      }, t, jobParams);
      
      // Ждем увеличения счетчика кадров (кадр отрендерился)
      await page.waitForFunction((v) => (window.__frameId || 0) > v, {}, prev);
      
      // Делаем screenshot только canvas через elementHandle
      const framePath = path.join(framesDir, `frame_${String(i + 1).padStart(6, '0')}.png`);
      await canvasHandle.screenshot({ path: framePath });
      
      // Обновляем прогресс
      job.progress = (i + 1) / totalFrames;
    }
    
    await canvasHandle.dispose();
    
    await browser.close();
    
    // Скачиваем аудио
    try {
      const audioResponse = await axios({
        method: 'GET',
        url: job.audioUrl,
        responseType: 'stream'
      });
      
      const audioWriter = fs.createWriteStream(audioPath);
      audioResponse.data.pipe(audioWriter);
      
      await new Promise((resolve, reject) => {
        audioWriter.on('finish', resolve);
        audioWriter.on('error', reject);
      });
    } catch (audioError) {
      throw new Error(`Failed to download audio: ${audioError.message}`);
    }
    
    // Собираем MP4 через FFmpeg
    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(path.join(framesDir, 'frame_%06d.png'))
        .inputOptions(['-framerate 30'])
        .input(audioPath)
        .videoCodec('libx264')
        .outputOptions([
          '-pix_fmt yuv420p',
          '-r 30',
          '-shortest'
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .run();
    });
    
    // Обновляем статус
    job.status = 'done';
    job.progress = 1;
    
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error);
    job.status = 'failed';
    job.error = error.message;
  }
}

// POST /export - создание задачи на экспорт
app.post('/export', async (req, res) => {
  try {
    // Валидация входных данных
    const validatedData = exportRequestSchema.parse(req.body);
    
    // Генерируем job_id
    const jobId = uuidv4();
    
    // Создаем job объект
    const job = {
      job_id: jobId,
      status: 'queued',
      progress: 0,
      audioUrl: validatedData.audioUrl,
      durationSec: validatedData.durationSec,
      plan: validatedData.plan,
      bgImageUrl: req.body.bgImageUrl || null,
      visualType: req.body.visualType || 'gradient',
      createdAt: new Date().toISOString(),
      error: null
    };
    
    // Сохраняем задачу
    jobs.set(jobId, job);
    
    // Запускаем job асинхронно (не ждем)
    runJob(job).catch(err => {
      console.error(`Background job ${jobId} error:`, err);
    });
    
    // Возвращаем job_id и status
    res.status(201).json({
      job_id: jobId,
      status: 'queued'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Ошибка валидации
      res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    } else {
      // Другая ошибка
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
});

// GET /export/:job_id - получение статуса задачи
app.get('/export/:job_id', (req, res) => {
  const { job_id } = req.params;
  
  const job = jobs.get(job_id);
  
  if (!job) {
    return res.status(404).json({
      error: 'Job not found'
    });
  }
  
  const response = {
    job_id: job.job_id,
    status: job.status,
    progress: job.progress
  };
  
  if (job.error) {
    response.error = job.error;
  }
  
  res.json(response);
});

// GET /download/:job_id - скачивание готового MP4
app.get('/download/:job_id', (req, res) => {
  const { job_id } = req.params;
  
  const job = jobs.get(job_id);
  
  if (!job) {
    return res.status(404).json({
      error: 'Job not found'
    });
  }
  
  if (job.status !== 'done') {
    return res.status(404).json({
      error: 'Job not ready',
      status: job.status
    });
  }
  
  const outputPath = path.join(JOBS_DIR, job_id, 'out.mp4');
  
  if (!fs.existsSync(outputPath)) {
    return res.status(404).json({
      error: 'Output file not found'
    });
  }
  
  res.sendFile(outputPath, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment; filename="export_${job_id}.mp4"`
    }
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Render server listening on port ${PORT}`);
});
