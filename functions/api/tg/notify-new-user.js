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
    console.log('[notify-new-user] Function called at', new Date().toISOString());
    
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
      notifyNewUsers: env.TELEGRAM_NOTIFY_NEW_USERS,
      botTokenLength: botToken?.length || 0,
      chatIdValue: chatId || 'MISSING',
      supabaseUrlValue: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING'
    });
    
    // Для отправки в Telegram достаточно только токена и chat_id
    // Supabase нужен только для получения email, но если его нет - используем переданный email
    if (!botToken || !chatId) {
      const missing = [];
      if (!botToken) missing.push('TELEGRAM_BOT_TOKEN');
      if (!chatId) missing.push('TELEGRAM_ADMIN_CHAT_ID');
      
      console.error('[notify-new-user] ❌ Missing REQUIRED environment variables:', missing);
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error", 
          missing,
          message: "Добавь TELEGRAM_BOT_TOKEN и TELEGRAM_ADMIN_CHAT_ID в Cloudflare Pages → Settings → Environment Variables"
        }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    // Предупреждение, если Supabase переменные отсутствуют (но продолжаем работу)
    if (!supabaseUrl || !supabaseKey) {
      console.warn('[notify-new-user] ⚠️ SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY отсутствуют, но продолжаем работу с переданным email');
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
    
    // Пытаемся получить email из Supabase только если переменные установлены И email не передан
    if (!userEmail && user_id && supabaseUrl && supabaseKey) {
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
            console.log('[notify-new-user] Email fetched from Supabase:', userEmail);
          } else {
            console.warn('[notify-new-user] Profile not found in Supabase for user_id:', user_id);
          }
        } else {
          const errorText = await profileResponse.text().catch(() => 'Unknown error');
          console.warn('[notify-new-user] Failed to fetch email from Supabase:', profileResponse.status, errorText.substring(0, 100));
        }
      } catch (profileError) {
        console.warn('[notify-new-user] Error fetching user email from Supabase:', profileError.message || profileError);
      }
    } else if (!userEmail && !supabaseUrl) {
      console.warn('[notify-new-user] SUPABASE_URL не установлен, пропускаем получение email из БД');
    }

    if (!userEmail) {
      userEmail = user_id ? `User ID: ${user_id.substring(0, 8)}...` : 'Не указан';
      console.warn('[notify-new-user] Using fallback email/identifier:', userEmail);
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
