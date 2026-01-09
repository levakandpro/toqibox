/**
 * Cloudflare Pages Function: POST /api/r2/upload
 * 
 * Проксирует загрузку файла в R2, обходя CORS ограничения
 * Файл загружается через сервер, а не напрямую из браузера
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Получаем данные из FormData
    const formData = await request.formData();
    const file = formData.get('file');
    const uploadUrl = formData.get('uploadUrl');
    const contentType = formData.get('contentType');

    if (!file || !uploadUrl) {
      return new Response(
        JSON.stringify({ error: "Missing file or uploadUrl" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    // Конвертируем File в ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // Загружаем файл в R2 через presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text().catch(() => '');
      console.error('❌ Ошибка загрузки в R2:', { status: uploadResponse.status, errorText });
      return new Response(
        JSON.stringify({ 
          error: `Failed to upload to R2: ${uploadResponse.status}`,
          details: errorText 
        }),
        {
          status: uploadResponse.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
}

// Обработка OPTIONS для CORS
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
