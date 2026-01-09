/**
 * Cloudflare Pages Function: POST /api/r2/upload
 * 
 * Загружает файл напрямую в R2 через Workers API
 * Использует R2 binding из env вместо presigned URLs
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Получаем данные из FormData
    const formData = await request.formData();
    const file = formData.get('file');
    const key = formData.get('key');
    const contentType = formData.get('contentType');

    if (!file || !key) {
      return new Response(
        JSON.stringify({ error: "Missing file or key" }),
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

    // Получаем R2 bucket из env
    // В Cloudflare Pages нужно использовать R2 binding через wrangler.toml
    // Но можно также использовать S3 API напрямую
    const bucket = env.R2_BUCKET;
    const accountId = env.R2_ACCOUNT_ID;
    const accessKeyId = env.R2_ACCESS_KEY_ID;
    const secretAccessKey = env.R2_SECRET_ACCESS_KEY;

    if (!bucket || !accountId || !accessKeyId || !secretAccessKey) {
      return new Response(
        JSON.stringify({ error: "R2 configuration missing" }),
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

    // Конвертируем File в ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // Используем S3 API для загрузки в R2
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    const url = `${endpoint}/${bucket}/${key}`;

    // Генерируем подпись для PUT запроса
    const now = new Date();
    const dateStamp = formatDate(now);
    const amzDate = formatDateTime(now);

    // Создаем подпись для PUT запроса
    const signature = await generateSignature({
      method: 'PUT',
      endpoint,
      bucket,
      key,
      accessKeyId,
      secretAccessKey,
      dateStamp,
      amzDate,
      contentType: contentType || 'application/octet-stream',
      payload: fileBuffer,
    });

    // Загружаем файл в R2
    const uploadResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': signature,
        'Content-Type': contentType || 'application/octet-stream',
        'x-amz-date': amzDate,
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text().catch(() => '');
      console.error('❌ Ошибка загрузки в R2:', { status: uploadResponse.status, errorText, url: url.substring(0, 100) });
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
      JSON.stringify({ success: true, key }),
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

// Генерирует AWS Signature Version 4 для PUT запроса
async function generateSignature({ method, endpoint, bucket, key, accessKeyId, secretAccessKey, dateStamp, amzDate, contentType, payload }) {
  const region = 'auto';
  const service = 's3';
  
  // Canonical request
  const canonicalUri = `/${key}`;
  const canonicalQueryString = '';
  const canonicalHeaders = `host:${new URL(endpoint).host}\nx-amz-date:${amzDate}\ncontent-type:${contentType}\n`;
  const signedHeaders = 'host;x-amz-date;content-type';
  
  // Вычисляем SHA256 хеш payload
  const payloadHash = await sha256Hex(new Uint8Array(payload));
  
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  // String to sign
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join('\n');

  // Вычисляем подпись
  const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = await hmacSha256Hex(signingKey, stringToSign);

  // Формируем Authorization header
  const credential = `${accessKeyId}/${credentialScope}`;
  return `AWS4-HMAC-SHA256 Credential=${credential}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

async function sha256Hex(data) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256Hex(key, message) {
  const keyBuffer = typeof key === 'string' ? new TextEncoder().encode(key) : key;
  const msgBuffer = new TextEncoder().encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
  const sigArray = Array.from(new Uint8Array(signature));
  return sigArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = await hmacSha256Bytes(`AWS4${key}`, dateStamp);
  const kRegion = await hmacSha256Bytes(kDate, regionName);
  const kService = await hmacSha256Bytes(kRegion, serviceName);
  const kSigning = await hmacSha256Bytes(kService, 'aws4_request');
  return kSigning;
}

async function hmacSha256Bytes(key, message) {
  const keyBuffer = typeof key === 'string' ? new TextEncoder().encode(key) : key;
  const msgBuffer = new TextEncoder().encode(message);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgBuffer);
  return new Uint8Array(signature);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function formatDateTime(date) {
  return date.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', 'T');
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
