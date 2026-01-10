/**
 * Cloudflare Pages Function: POST /api/tg/notify-payment-request
 * 
 * Уведомляет админа в Telegram о новой заявке на оплату
 * Отправляет текст сообщения с деталями заявки + чек (photo/document) + inline кнопки
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  try {
    // Проверяем наличие обязательных переменных окружения
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_ADMIN_CHAT_ID || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Получаем payment_request_id из тела запроса
    const body = await request.json().catch(() => ({}));
    const { payment_request_id } = body;

    if (!payment_request_id) {
      return new Response(
        JSON.stringify({ error: "payment_request_id is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Используем Supabase REST API напрямую (service role)
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

    // Получаем данные заявки из БД через REST API
    const requestResponse = await fetch(
      `${supabaseUrl}/rest/v1/payment_requests?id=eq.${payment_request_id}&select=id,user_id,product,plan,amount,receipt_url,status,created_at`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      }
    );

    if (!requestResponse.ok) {
      console.error("Error fetching payment request:", requestResponse.status);
      return new Response(
        JSON.stringify({ error: "Payment request not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    const paymentRequests = await requestResponse.json();
    const paymentRequest = paymentRequests?.[0];

    if (!paymentRequest) {
      console.error("Payment request not found");
      return new Response(
        JSON.stringify({ error: "Payment request not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    // Проверяем, что заявка в статусе pending
    if (paymentRequest.status !== 'pending') {
      console.warn("Payment request already processed:", paymentRequest.status);
      return new Response(
        JSON.stringify({ success: false, message: "Request already processed" }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Получаем email пользователя из profiles через REST API
    let userEmail = 'Не указан';
    try {
      const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${paymentRequest.user_id}&select=email`,
        {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        }
      );

      if (profileResponse.ok) {
        const profiles = await profileResponse.json();
        if (profiles?.[0]?.email) {
          userEmail = profiles[0].email;
        }
      }
    } catch (profileError) {
      console.warn("Error fetching user email:", profileError);
      // Продолжаем с дефолтным значением
    }

    // Формируем текст сообщения
    const productLabel = paymentRequest.product === 'studio' ? 'TQ STUDIO' : 'TOQIBOX';
    const planLabel = paymentRequest.plan?.toUpperCase() || 'N/A';
    
    const messageText = `💰 Новая заявка на оплату\n` +
      `📦 Продукт: ${productLabel}\n` +
      `💎 Тариф: ${planLabel}\n` +
      `💵 Сумма: ${paymentRequest.amount} TJS\n` +
      `👤 ${userEmail}\n` +
      `🆔 ID: ${paymentRequest.id.substring(0, 8)}...`;

    const botToken = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_ADMIN_CHAT_ID;

    // Создаем inline клавиатуру с кнопками Одобрить/Отклонить
    const inlineKeyboard = {
      inline_keyboard: [[
        {
          text: '✅ Одобрить',
          callback_data: JSON.stringify({
            action: 'approve',
            request_id: paymentRequest.id,
            product: paymentRequest.product
          })
        },
        {
          text: '❌ Отклонить',
          callback_data: JSON.stringify({
            action: 'reject',
            request_id: paymentRequest.id,
            product: paymentRequest.product
          })
        }
      ]]
    };

    // Если есть receipt_url, сначала отправляем сообщение с текстом
    // Затем отправляем чек как photo или document
    let messageSent = false;
    let messageId = null;

    try {
      // Отправляем текстовое сообщение с кнопками
      const messageResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          reply_markup: inlineKeyboard,
          parse_mode: 'HTML'
        })
      });

      if (!messageResponse.ok) {
        const errorData = await messageResponse.text();
        console.error("Telegram sendMessage error:", errorData);
        throw new Error(`Telegram API error: ${messageResponse.status}`);
      }

      const messageData = await messageResponse.json();
      messageSent = true;
      messageId = messageData.result?.message_id;

      // Теперь отправляем чек, если есть receipt_url
      if (paymentRequest.receipt_url) {
        try {
          // Определяем тип файла по URL и content-type
          const receiptUrl = paymentRequest.receipt_url;
          
          // Скачиваем файл с Supabase Storage
          const fileResponse = await fetch(receiptUrl);
          
          if (!fileResponse.ok) {
            console.warn("Failed to fetch receipt file, sending URL instead");
            // Если не удалось скачать, отправляем ссылку в тексте
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: `📎 Чек: <a href="${receiptUrl}">Открыть</a>`,
                parse_mode: 'HTML'
              })
            }).catch(err => console.error("Error sending receipt URL:", err));
          } else {
            try {
              const fileBuffer = await fileResponse.arrayBuffer();
              const contentType = fileResponse.headers.get('content-type') || '';
              const urlLower = receiptUrl.toLowerCase();
              
              // Определяем тип файла по content-type и URL
              let isImage = false;
              let isPdf = false;
              let fileName = 'receipt';

              if (contentType.startsWith('image/') || 
                  urlLower.includes('.png') || urlLower.includes('.jpg') || 
                  urlLower.includes('.jpeg') || urlLower.includes('.webp')) {
                isImage = true;
                fileName = 'receipt.png';
              } else if (contentType === 'application/pdf' || urlLower.includes('.pdf')) {
                isPdf = true;
                fileName = 'receipt.pdf';
              }

              // Создаем FormData для отправки файла в Telegram
              // В Cloudflare Workers FormData поддерживается
              const formData = new FormData();
              
              // В Cloudflare Workers нужно создать File или Blob
              const fileBlob = new Blob([fileBuffer], { type: contentType || 'application/octet-stream' });
              
              if (isImage) {
                // Отправляем как photo
                formData.append('photo', fileBlob, fileName);
                formData.append('chat_id', chatId);
                formData.append('caption', `Чек об оплате (${productLabel})`);
                
                const photoResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                  method: 'POST',
                  body: formData
                });
                
                if (!photoResponse.ok) {
                  const errorText = await photoResponse.text().catch(() => 'Unknown error');
                  console.error("Error sending photo:", errorText);
                  throw new Error(`Telegram photo send failed: ${photoResponse.status}`);
                }
              } else {
                // Отправляем как document (PDF или неизвестный тип)
                const docFormData = new FormData();
                docFormData.append('document', fileBlob, fileName);
                docFormData.append('chat_id', chatId);
                docFormData.append('caption', `Чек об оплате (${productLabel})`);
                
                const docResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendDocument`, {
                  method: 'POST',
                  body: docFormData
                });
                
                if (!docResponse.ok) {
                  const errorText = await docResponse.text().catch(() => 'Unknown error');
                  console.error("Error sending document:", errorText);
                  throw new Error(`Telegram document send failed: ${docResponse.status}`);
                }
              }
            } catch (fileError) {
              console.error("Error processing receipt file:", fileError);
              // Если не удалось отправить файл, отправляем ссылку в тексте
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: `📎 Чек: <a href="${receiptUrl}">Открыть</a>`,
                  parse_mode: 'HTML'
                })
              }).catch(err => console.error("Error sending receipt URL fallback:", err));
            }
          }
        } catch (receiptError) {
          console.error("Error sending receipt:", receiptError);
          // Не падаем, если чек не удалось отправить - основное сообщение уже отправлено
        }
      }
    } catch (telegramError) {
      console.error("Error sending Telegram message:", telegramError);
      return new Response(
        JSON.stringify({ error: "Failed to send Telegram notification" }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message_id: messageId,
        sent: messageSent 
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error("Error in notify-payment-request:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// CORS preflight
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
