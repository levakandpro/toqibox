// ВАЖНО: Cloudflare Pages Functions НЕ поддерживают Node.js модули!
// fs, fs/promises, path, os - недоступны в Cloudflare Workers runtime

// ========================================
// СКАЧИВАНИЕ ГОТОВОГО MP4
// ========================================
// Эта функция не работает на Cloudflare Pages, так как требует доступа к файловой системе
// Для работы с файлами используйте Cloudflare R2 или браузерный экспорт

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

  // Cloudflare Workers не поддерживают файловую систему
  return new Response(
    JSON.stringify({
      error: 'Скачивание файлов недоступно на Cloudflare Pages',
      details: 'Cloudflare Workers не поддерживают Node.js модули (fs, fs/promises, path, os)',
      jobId: jobId,
      solutions: [
        {
          name: 'Браузерный экспорт (WebM)',
          description: 'Используйте MediaRecorder API для экспорта WebM прямо в браузере',
          available: true,
        },
        {
          name: 'Cloudflare R2',
          description: 'Сохраняйте готовые файлы в R2 и отдавайте через CDN',
          available: true,
        },
        {
          name: 'Отдельный API сервер',
          description: 'Разверните Node.js сервер с доступом к файловой системе',
          available: false,
        },
      ],
      recommendation: 'Используйте браузерный экспорт или сохраняйте файлы в R2',
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
