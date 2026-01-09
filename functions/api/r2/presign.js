/**
 * Cloudflare Pages Function: POST /api/r2/presign
 * 
 * Генерирует presigned PUT URL для безопасной загрузки в R2
 * Секреты используются только здесь, не передаются на фронт
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Парсим тело запроса
    const body = await request.json();
    const { type, id, mime } = body;

    // Валидация типа
    const validTypes = ["artist_cover", "artist_avatar", "track_cover", "studio_photo"];
    if (!validTypes.includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid type. Must be one of: artist_cover, artist_avatar, track_cover, studio_photo" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          } 
        }
      );
    }

    // Валидация mime
    const validMimes = ["image/jpeg", "image/png"];
    if (!validMimes.includes(mime)) {
      return new Response(
        JSON.stringify({ error: "Invalid mime. Must be image/jpeg or image/png" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          } 
        }
      );
    }

    // Валидация id (не требуется для studio_photo)
    if (type !== "studio_photo" && (!id || typeof id !== "string" || id.trim().length === 0)) {
      return new Response(
        JSON.stringify({ error: "Invalid id. Must be a non-empty string" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          } 
        }
      );
    }

    // Определяем фиксированный key на основе типа
    let key;
    const extension = mime === "image/jpeg" ? "jpg" : "png";
    
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
      default:
        return new Response(
          JSON.stringify({ error: "Invalid type" }),
          { 
            status: 400, 
            headers: { 
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type",
            } 
          }
        );
    }

    // Получаем секреты из env (только здесь, не передаем на фронт)
    const accountId = env.R2_ACCOUNT_ID;
    const bucket = env.R2_BUCKET;
    const accessKeyId = env.R2_ACCESS_KEY_ID;
    const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
    const publicBase = env.R2_PUBLIC_BASE || "https://cdn.toqibox.win";

    if (!accountId || !bucket || !accessKeyId || !secretAccessKey) {
      return new Response(
        JSON.stringify({ error: "R2 configuration missing" }),
        { 
          status: 500, 
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          } 
        }
      );
    }

    // Генерируем presigned PUT URL (S3 совместимость)
    // Используем AWS Signature Version 4 для R2
    const expiresIn = 60; // 60 секунд
    const region = "auto"; // R2 использует "auto" как регион
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    
    // Создаем presigned URL
    const presignedUrl = await generatePresignedPutUrl({
      endpoint,
      bucket,
      key,
      accessKeyId,
      secretAccessKey,
      region,
      expiresIn,
      contentType: mime,
    });

    const publicUrl = `${publicBase}/${key}`;

    return new Response(
      JSON.stringify({
        uploadUrl: presignedUrl,
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
    console.error("Error generating presigned URL:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        } 
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

/**
 * Генерирует presigned PUT URL используя AWS Signature Version 4
 */
async function generatePresignedPutUrl({
  endpoint,
  bucket,
  key,
  accessKeyId,
  secretAccessKey,
  region,
  expiresIn,
  contentType,
}) {
  const now = new Date();
  const dateStamp = formatDate(now);
  const amzDate = formatDateTime(now);
  const expires = expiresIn.toString();

  // Создаем credential scope
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const credential = `${accessKeyId}/${credentialScope}`;

  // Query параметры для presigned URL
  const params = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": expires,
    "X-Amz-SignedHeaders": "host;content-type",
  });

  // Canonical request
  const canonicalUri = `/${key}`;
  const canonicalQueryString = params.toString();
  const canonicalHeaders = `host:${new URL(endpoint).host}\ncontent-type:${contentType}\n`;
  const signedHeaders = "host;content-type";
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  // String to sign
  const algorithm = "AWS4-HMAC-SHA256";
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");

  // Вычисляем подпись
  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, "s3");
  const signature = await hmacSha256Hex(signingKey, stringToSign);

  // Добавляем подпись
  params.set("X-Amz-Signature", signature);

  return `${endpoint}/${bucket}/${key}?${params.toString()}`;
}

// Вспомогательные функции
function formatDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

function formatDateTime(date) {
  return date.toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "T");
}

async function sha256Hex(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacSha256Hex(key, message) {
  const keyBuffer = typeof key === "string" ? new TextEncoder().encode(key) : key;
  const msgBuffer = new TextEncoder().encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgBuffer);
  const sigArray = Array.from(new Uint8Array(signature));
  return sigArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = await hmacSha256Bytes(`AWS4${key}`, dateStamp);
  const kRegion = await hmacSha256Bytes(kDate, regionName);
  const kService = await hmacSha256Bytes(kRegion, serviceName);
  const kSigning = await hmacSha256Bytes(kService, "aws4_request");
  return kSigning;
}

async function hmacSha256Bytes(key, message) {
  const keyBuffer = typeof key === "string" ? new TextEncoder().encode(key) : key;
  const msgBuffer = new TextEncoder().encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgBuffer);
  return new Uint8Array(signature);
}
