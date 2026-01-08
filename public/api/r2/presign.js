// Локальная заглушка для разработки
// В продакшене используется Cloudflare Pages Function functions/api/r2/presign.js

// Это просто заглушка для локальной разработки
// В реальности нужно использовать Cloudflare Pages Functions

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const body = await request.json();
      const { type, id, mime } = body;

      // Валидация
      const validTypes = ["artist_cover", "artist_avatar", "track_cover", "studio_photo"];
      if (!validTypes.includes(type)) {
        return new Response(
          JSON.stringify({ error: "Invalid type" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const validMimes = ["image/jpeg", "image/png"];
      if (!validMimes.includes(mime)) {
        return new Response(
          JSON.stringify({ error: "Invalid mime" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // id не требуется для studio_photo
      if (type !== "studio_photo" && (!id || typeof id !== "string" || id.trim().length === 0)) {
        return new Response(
          JSON.stringify({ error: "Invalid id" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Для локальной разработки возвращаем фиктивный URL
      // В реальности файл не загрузится, но форма будет работать
      const extension = mime === "image/jpeg" ? "jpg" : "png";
      let key;
      
      switch (type) {
        case "artist_cover":
          key = `artists/${id}/cover.${extension}`;
          break;
        case "artist_avatar":
          key = `artists/${id}/avatar.${extension}`;
          break;
        case "track_cover":
          key = `tracks/${id}/cover.${extension}`;
          break;
        case "studio_photo":
          key = `studio/photo.${extension}`;
          break;
      }

      const publicUrl = `https://cdn.toqibox.win/${key}`;
      
      // Возвращаем фиктивный uploadUrl (в реальности это должен быть presigned URL от R2)
      // Для локальной разработки просто возвращаем публичный URL
      const uploadUrl = `https://cdn.toqibox.win/${key}`;

      return new Response(
        JSON.stringify({
          uploadUrl,
          key,
          publicUrl,
        }),
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
      return new Response(
        JSON.stringify({ error: error.message || "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};

