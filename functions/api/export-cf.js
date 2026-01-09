// Cloudflare Pages Function для экспорта
// ВАЖНО: Cloudflare Workers НЕ поддерживают child_process и FFmpeg!

export async function onRequestPost(context) {
  return new Response(
    JSON.stringify({
      error: 'FFmpeg экспорт недоступен на Cloudflare Pages',
      message: 'Cloudflare Workers не поддерживают Node.js модули (child_process, fs). Используйте браузерный экспорт (WebM) или разверните отдельный API сервер.',
      alternatives: [
        'Браузерный экспорт через MediaRecorder (WebM)',
        'Отдельный Node.js сервер (Railway, Render, VPS)',
        'Netlify Functions (поддерживают FFmpeg)',
      ],
    }),
    {
      status: 501, // Not Implemented
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export async function onRequestGet(context) {
  return new Response(
    JSON.stringify({
      error: 'FFmpeg экспорт недоступен на Cloudflare Pages',
      message: 'Используйте браузерный экспорт или отдельный API сервер',
    }),
    {
      status: 501,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
