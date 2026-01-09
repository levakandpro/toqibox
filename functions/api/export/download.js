import { createReadStream } from 'fs';
import { stat, unlink, rmdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// ========================================
// СКАЧИВАНИЕ ГОТОВОГО MP4
// ========================================

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');

  if (!jobId) {
    return new Response(JSON.stringify({ error: 'Требуется параметр jobId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const tmpPath = join(tmpdir(), 'toqibox-exports', jobId);
    const outputPath = join(tmpPath, 'output.mp4');

    // Проверяем существование файла
    const fileStats = await stat(outputPath);

    console.log(`[Download] Отдаем файл для ${jobId}, размер: ${fileStats.size} bytes`);

    // Читаем файл
    const fileBuffer = await import('fs/promises').then(m => m.readFile(outputPath));

    // Планируем очистку после отдачи файла (через 5 секунд)
    setTimeout(async () => {
      try {
        console.log(`[Download] Очистка временных файлов для ${jobId}`);
        await unlink(outputPath);
        await unlink(join(tmpPath, 'audio.mp3'));
        await unlink(join(tmpPath, 'photo.jpg'));
        await rmdir(tmpPath);
        console.log(`[Download] ✅ Очистка завершена для ${jobId}`);
      } catch (error) {
        console.error(`[Download] ❌ Ошибка очистки для ${jobId}:`, error);
      }
    }, 5000);

    // Отдаем файл
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="toqibox-studio-${jobId}.mp4"`,
        'Content-Length': fileStats.size.toString(),
      },
    });
  } catch (error) {
    console.error(`[Download] Ошибка скачивания для ${jobId}:`, error);
    
    if (error.code === 'ENOENT') {
      return new Response(JSON.stringify({ error: 'Файл не найден или уже удален' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
