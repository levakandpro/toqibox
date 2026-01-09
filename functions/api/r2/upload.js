/**
 * Cloudflare Pages Function: POST /api/r2/upload
 * 
 * Загружает файл напрямую в R2 через R2 binding
 * Использует простой PUT запрос с правильной подписью
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Получаем данные из FormData
    const formData = await request.formData();
    const file = formData.get('file');
    const key = formData.get('key');
    const contentType = formData.get('contentType') || 'application/octet-stream';

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

    // Проверяем наличие R2 binding (если настроен) или используем S3 API
    const r2Bucket = env.R2_BUCKET; // Это может быть binding или строка с именем
    const accountId = env.R2_ACCOUNT_ID;
    const accessKeyId = env.R2_ACCESS_KEY_ID;
    const secretAccessKey = env.R2_SECRET_ACCESS_KEY;

    // Если R2_BUCKET это объект (binding), используем его напрямую
    if (r2Bucket && typeof r2Bucket === 'object' && r2Bucket.put) {
      const fileBuffer = await file.arrayBuffer();
      await r2Bucket.put(key, fileBuffer, {
        httpMetadata: {
          contentType: contentType,
        },
      });
      
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
    }

    // Иначе используем S3 API с упрощенной подписью
    if (!accountId || !accessKeyId || !secretAccessKey || !r2Bucket) {
      return new Response(
        JSON.stringify({ error: "R2 configuration missing. Need R2_BUCKET binding or R2 credentials." }),
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
    const bucketName = typeof r2Bucket === 'string' ? r2Bucket : 'toqibox-covers';

    // Используем упрощенный подход - загружаем через fetch с базовой авторизацией
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    const url = `${endpoint}/${bucketName}/${key}`;

    // Простая подпись для R2
    const now = new Date();
    const dateStamp = formatDate(now);
    const amzDate = formatDateTime(now);
    
    // Используем упрощенную подпись
    const signature = await generateSimpleSignature({
      method: 'PUT',
      url: new URL(url),
      accessKeyId,
      secretAccessKey,
      dateStamp,
      amzDate,
      contentType,
      payload: fileBuffer,
    });

    // Загружаем файл в R2
    const uploadResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': signature,
        'Content-Type': contentType,
        'x-amz-date': amzDate,
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

// Упрощенная генерация подписи для R2
async function generateSimpleSignature({ method, url, accessKeyId, secretAccessKey, dateStamp, amzDate, contentType, payload }) {
  const region = 'auto';
  const service = 's3';
  
  // Canonical request
  const canonicalUri = url.pathname;
  const canonicalQueryString = '';
  const canonicalHeaders = `host:${url.host}\nx-amz-date:${amzDate}\ncontent-type:${contentType}\n`;
  const signedHeaders = 'host;x-amz-date;content-type';
  
  // Вычисляем SHA256 хеш payload
  let payloadHash;
  if (payload instanceof ArrayBuffer) {
    payloadHash = await sha256Hex(new Uint8Array(payload));
  } else {
    payloadHash = await sha256Hex(payload);
  }
  
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
  let buffer;
  
  if (typeof data === 'string') {
    // Если строка - кодируем в UTF-8
    buffer = new TextEncoder().encode(data);
  } else if (data instanceof ArrayBuffer) {
    buffer = new Uint8Array(data);
  } else if (data instanceof Uint8Array) {
    buffer = data;
  } else {
    // Пытаемся конвертировать в Uint8Array
    buffer = new Uint8Array(data);
  }
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
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
