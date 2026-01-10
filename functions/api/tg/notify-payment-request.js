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
    console.log('[notify-payment-request] Function called');
    
    // Проверяем наличие обязательных переменных окружения
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_ADMIN_CHAT_ID || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      const missing = [];
      if (!env.TELEGRAM_BOT_TOKEN) missing.push('TELEGRAM_BOT_TOKEN');
      if (!env.TELEGRAM_ADMIN_CHAT_ID) missing.push('TELEGRAM_ADMIN_CHAT_ID');
      if (!env.SUPABASE_URL) missing.push('SUPABASE_URL');
      if (!env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      console.error('[notify-payment-request] ❌ Missing required environment variables:', missing);
      return new Response(
        JSON.stringify({ error: "Server configuration error", missing }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Получаем payment_request_id из тела запроса
    const body = await request.json().catch((e) => {
      console.error('[notify-payment-request] ❌ Error parsing request body:', e);
      return {};
    });
    const { payment_request_id } = body;

    console.log('[notify-payment-request] Payment request ID:', payment_request_id);

    if (!payment_request_id) {
      console.error('[notify-payment-request] ❌ payment_request_id is required');
      return new Response(
        JSON.stringify({ error: "payment_request_id is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Используем Supabase REST API напрямую (service role)
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

    // Получаем данные заявки из БД через REST API
    console.log('[notify-payment-request] Fetching payment request from Supabase:', payment_request_id);
    const requestUrl = `${supabaseUrl}/rest/v1/payment_requests?id=eq.${payment_request_id}&select=id,user_id,product,plan,amount,receipt_url,status,created_at`;
    console.log('[notify-payment-request] Request URL:', requestUrl);
    
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
    console.log('[notify-payment-request] Supabase response status:', requestResponse.status);
    console.log('[notify-payment-request] Supabase response body:', responseText.substring(0, 500));

    if (!requestResponse.ok) {
      console.error('[notify-payment-request] ❌ Error fetching payment request:', requestResponse.status, responseText);
      return new Response(
        JSON.stringify({ error: "Payment request not found", details: responseText }),
        { status: 404, headers: corsHeaders }
      );
    }

    let paymentRequests;
    try {
      paymentRequests = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[notify-payment-request] ❌ Error parsing payment request response:', parseError);
      return new Response(
        JSON.stringify({ error: "Invalid response from database", details: responseText }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    const paymentRequest = paymentRequests?.[0];
    console.log('[notify-payment-request] Payment request data:', paymentRequest);

    if (!paymentRequest) {
      console.error('[notify-payment-request] ❌ Payment request not found in response. Array length:', paymentRequests?.length);
      return new Response(
        JSON.stringify({ error: "Payment request not found", arrayLength: paymentRequests?.length }),
        { status: 404, headers: corsHeaders }
      );
    }

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
