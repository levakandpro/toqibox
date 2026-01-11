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
    console.log('[notify-payment-request] ⚡ Function called at', new Date().toISOString());
    
    // Проверяем наличие обязательных переменных окружения
    const botToken = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_ADMIN_CHAT_ID;
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('[notify-payment-request] Environment check:', {
      hasBotToken: !!botToken,
      hasChatId: !!chatId,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey
    });
    
    if (!botToken || !chatId || !supabaseUrl || !supabaseKey) {
      const missing = [];
      if (!botToken) missing.push('TELEGRAM_BOT_TOKEN');
      if (!chatId) missing.push('TELEGRAM_ADMIN_CHAT_ID');
      if (!supabaseUrl) missing.push('SUPABASE_URL');
      if (!supabaseKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      console.error('[notify-payment-request] ❌ Missing required environment variables:', missing);
      return new Response(
        JSON.stringify({ error: "Server configuration error", missing }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Получаем payment_request_id из тела запроса
    let body;
    try {
      body = await request.json();
      console.log('[notify-payment-request] Request body received:', { payment_request_id: body.payment_request_id });
    } catch (parseError) {
      console.error('[notify-payment-request] ❌ Error parsing request body:', parseError);
      body = {};
    }
    const { payment_request_id } = body || {};

    console.log('[notify-payment-request] Payment request ID:', payment_request_id);

    if (!payment_request_id) {
      console.error('[notify-payment-request] ❌ payment_request_id is required');
      return new Response(
        JSON.stringify({ error: "payment_request_id is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Используем переменные, которые уже извлечены выше

    // Получаем данные заявки из БД через REST API с повторными попытками
    console.log('[notify-payment-request] Fetching payment request from Supabase:', payment_request_id);
    const requestUrl = `${supabaseUrl}/rest/v1/payment_requests?id=eq.${payment_request_id}&select=id,user_id,product,plan,amount,receipt_url,status,created_at`;
    console.log('[notify-payment-request] Request URL:', requestUrl);
    
    // Пытаемся получить заявку несколько раз с задержкой (на случай, если она еще не сохранилась)
    let paymentRequest = null;
    const maxRetries = 3;
    const retryDelay = 500; // 500ms между попытками
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`[notify-payment-request] Attempt ${attempt}/${maxRetries} to fetch payment request`);
      
      const requestResponse = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });

      const responseText = await requestResponse.text();
      console.log(`[notify-payment-request] Supabase response status (attempt ${attempt}):`, requestResponse.status);
      console.log(`[notify-payment-request] Supabase response body (attempt ${attempt}):`, responseText.substring(0, 500));

      if (requestResponse.ok) {
        let paymentRequests;
        try {
          paymentRequests = JSON.parse(responseText);
          paymentRequest = paymentRequests?.[0];
          if (paymentRequest) {
            console.log(`[notify-payment-request] ✅ Payment request found on attempt ${attempt}:`, paymentRequest);
            break; // Успешно нашли заявку, выходим из цикла
          }
        } catch (parseError) {
          console.error(`[notify-payment-request] ❌ Error parsing response (attempt ${attempt}):`, parseError);
        }
      }
      
      // Если это не последняя попытка, ждем перед следующей
      if (attempt < maxRetries) {
        console.log(`[notify-payment-request] Waiting ${retryDelay}ms before next attempt...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    if (!paymentRequest) {
      console.error('[notify-payment-request] ❌ Payment request not found after all attempts');
      return new Response(
        JSON.stringify({ error: "Payment request not found", attempts: maxRetries }),
        { status: 404, headers: corsHeaders }
      );
    }
    
    console.log('[notify-payment-request] Payment request data:', paymentRequest);

    // Проверяем, что заявка в статусе pending
    if (paymentRequest.status !== 'pending') {
      console.warn('[notify-payment-request] ⚠️ Payment request already processed. Status:', paymentRequest.status);
      return new Response(
        JSON.stringify({ success: false, message: "Request already processed", status: paymentRequest.status }),
        { status: 200, headers: corsHeaders }
      );
    }
    
    console.log('[notify-payment-request] ✅ Payment request found and is pending');

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

    // Создаем inline клавиатуру с кнопками Одобрить/Отклонить
    // Используем короткий формат callback_data (a:action,r:request_id) чтобы уложиться в лимит 64 байта
    // UUID занимает 36 символов, поэтому product убираем (его можно определить из БД)
    const inlineKeyboard = {
      inline_keyboard: [[
        {
          text: '✅ Одобрить',
          callback_data: JSON.stringify({ a: 'approve', r: paymentRequest.id })
        },
        {
          text: '❌ Отклонить',
          callback_data: JSON.stringify({ a: 'reject', r: paymentRequest.id })
        }
      ]]
    };
    
    // Проверяем длину callback_data (лимит Telegram: 64 байта)
    const approveLen = Buffer.byteLength(inlineKeyboard.inline_keyboard[0][0].callback_data, 'utf8');
    const rejectLen = Buffer.byteLength(inlineKeyboard.inline_keyboard[0][1].callback_data, 'utf8');
    console.log('[notify-payment-request] Callback data lengths:', { approve: approveLen, reject: rejectLen });
    
    if (approveLen > 64 || rejectLen > 64) {
      console.error('[notify-payment-request] ❌ Callback data still too long!', { approveLen, rejectLen });
      // Если всё ещё слишком длинный - используем только первые 16 символов UUID
      const shortId = paymentRequest.id.substring(0, 16);
      inlineKeyboard.inline_keyboard[0][0].callback_data = JSON.stringify({ a: 'approve', r: shortId });
      inlineKeyboard.inline_keyboard[0][1].callback_data = JSON.stringify({ a: 'reject', r: shortId });
      console.warn('[notify-payment-request] ⚠️ Using short ID:', shortId);
    }

    // Если есть receipt_url, сначала отправляем сообщение с текстом
    // Затем отправляем чек как photo или document
    let messageSent = false;
    let messageId = null;

    try {
      // Отправляем текстовое сообщение с кнопками
      console.log('[notify-payment-request] Sending message to Telegram. Chat ID:', chatId);
      console.log('[notify-payment-request] Message text:', messageText);
      
      const messageResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          reply_markup: inlineKeyboard
        })
      });

      const telegramResponseText = await messageResponse.text();
      console.log('[notify-payment-request] Telegram API response status:', messageResponse.status);
      console.log('[notify-payment-request] Telegram API response body:', telegramResponseText.substring(0, 500));

      if (!messageResponse.ok) {
        console.error('[notify-payment-request] ❌ Telegram sendMessage error:', telegramResponseText);
        throw new Error(`Telegram API error: ${messageResponse.status} - ${telegramResponseText}`);
      }

      let messageData;
      try {
        messageData = JSON.parse(telegramResponseText);
      } catch (parseError) {
        console.error('[notify-payment-request] ❌ Error parsing Telegram response:', parseError);
        throw new Error(`Invalid Telegram response: ${telegramResponseText.substring(0, 200)}`);
      }
      
      messageSent = true;
      messageId = messageData.result?.message_id;
      console.log('[notify-payment-request] ✅ Message sent successfully. Message ID:', messageId);

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
                text: `📎 Чек: ${receiptUrl}`
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
              const formData = new FormData();
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
                  text: `📎 Чек: ${receiptUrl}`
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
      console.error('[notify-payment-request] ❌ Error sending Telegram message:', telegramError);
      console.error('[notify-payment-request] Error message:', telegramError.message);
      console.error('[notify-payment-request] Error stack:', telegramError.stack);
      return new Response(
        JSON.stringify({ 
          error: "Failed to send Telegram notification", 
          details: telegramError.message || String(telegramError),
          stack: telegramError.stack ? telegramError.stack.substring(0, 500) : undefined
        }),
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
    console.error('[notify-payment-request] ❌ CRITICAL ERROR:', error);
    console.error('[notify-payment-request] Error stack:', error.stack);
    console.error('[notify-payment-request] Error message:', error.message);
    console.error('[notify-payment-request] Error name:', error.name);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        message: error.message || "Unknown error",
        details: error.stack ? error.stack.substring(0, 500) : "No stack trace"
      }),
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
