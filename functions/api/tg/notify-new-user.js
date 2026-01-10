/**
 * Cloudflare Pages Function: POST /api/tg/notify-new-user
 * 
 * Уведомляет админа в Telegram о новой регистрации пользователя
 * Опционально: можно включить/выключить через env переменную
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
    console.log('[notify-new-user] Function called');
    
    // Проверяем наличие обязательных переменных окружения
    const botToken = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_ADMIN_CHAT_ID;
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('[notify-new-user] Environment check:', {
      hasBotToken: !!botToken,
      hasChatId: !!chatId,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      notifyNewUsers: env.TELEGRAM_NOTIFY_NEW_USERS
    });
    
    if (!botToken || !chatId || !supabaseUrl || !supabaseKey) {
      const missing = [];
      if (!botToken) missing.push('TELEGRAM_BOT_TOKEN');
      if (!chatId) missing.push('TELEGRAM_ADMIN_CHAT_ID');
      if (!supabaseUrl) missing.push('SUPABASE_URL');
      if (!supabaseKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      
      console.error('[notify-new-user] Missing environment variables:', missing);
      return new Response(
        JSON.stringify({ error: "Server configuration error", missing }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Опционально: проверяем флаг включения уведомлений о регистрации (по умолчанию включено)
    if (env.TELEGRAM_NOTIFY_NEW_USERS === 'false') {
      console.log('[notify-new-user] Notifications disabled by TELEGRAM_NOTIFY_NEW_USERS=false');
      return new Response(
        JSON.stringify({ success: true, message: "New user notifications disabled" }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Получаем данные из тела запроса
    let body;
    try {
      body = await request.json();
      console.log('[notify-new-user] Request body:', { user_id: body.user_id, email: body.email ? '***' : null });
    } catch (parseError) {
      console.error('[notify-new-user] Error parsing request body:', parseError);
      body = {};
    }
    
    const { user_id, email } = body || {};

    if (!user_id && !email) {
      console.error('[notify-new-user] Missing user_id and email in request');
      return new Response(
        JSON.stringify({ error: "user_id or email is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Получаем email пользователя (приоритет переданному email)
    let userEmail = email;
    if (!userEmail && user_id) {
      try {
        console.log('[notify-new-user] Fetching email from Supabase for user_id:', user_id);
        const profileResponse = await fetch(
          `${supabaseUrl}/rest/v1/profiles?id=eq.${user_id}&select=email`,
          {
            method: 'GET',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (profileResponse.ok) {
          const profiles = await profileResponse.json();
          if (profiles?.[0]?.email) {
            userEmail = profiles[0].email;
            console.log('[notify-new-user] Email fetched from Supabase');
          }
        } else {
          console.warn('[notify-new-user] Failed to fetch email from Supabase:', profileResponse.status);
        }
      } catch (profileError) {
        console.warn('[notify-new-user] Error fetching user email:', profileError.message);
      }
    }

    if (!userEmail) {
      userEmail = 'Не указан';
      console.warn('[notify-new-user] Using default email placeholder');
    }

    // Формируем текст сообщения
    const messageText = `🆕 Новая регистрация\n👤 ${userEmail}`;
    console.log('[notify-new-user] Sending message to Telegram:', { chatId, email: userEmail });

    // Отправляем сообщение в Telegram
    try {
      const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText
        })
      });

      const telegramData = await telegramResponse.json().catch(() => ({}));

      if (!telegramResponse.ok) {
        console.error('[notify-new-user] Telegram API error:', {
          status: telegramResponse.status,
          statusText: telegramResponse.statusText,
          response: telegramData
        });
        return new Response(
          JSON.stringify({ error: "Telegram API error", details: telegramData }),
          { status: 500, headers: corsHeaders }
        );
      }

      console.log('[notify-new-user] ✅ Message sent successfully to Telegram');
      return new Response(
        JSON.stringify({ success: true, sent: true, telegram: telegramData }),
        { status: 200, headers: corsHeaders }
      );

    } catch (telegramError) {
      console.error('[notify-new-user] Error sending Telegram message:', telegramError.message || telegramError);
      return new Response(
        JSON.stringify({ error: "Failed to send Telegram notification", details: telegramError.message }),
        { status: 500, headers: corsHeaders }
      );
    }

  } catch (error) {
    console.error('[notify-new-user] ❌ Unexpected error:', error.message || error, error.stack);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message || String(error) }),
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
