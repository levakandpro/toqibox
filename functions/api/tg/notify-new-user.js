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
    // Проверяем наличие обязательных переменных окружения
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_ADMIN_CHAT_ID || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Опционально: проверяем флаг включения уведомлений о регистрации
    if (env.TELEGRAM_NOTIFY_NEW_USERS === 'false') {
      return new Response(
        JSON.stringify({ success: true, message: "New user notifications disabled" }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Получаем данные из тела запроса
    const body = await request.json().catch(() => ({}));
    const { user_id, email } = body;

    if (!user_id && !email) {
      return new Response(
        JSON.stringify({ error: "user_id or email is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Используем Supabase REST API напрямую (service role)
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

    // Получаем email пользователя, если не передан
    let userEmail = email;
    if (!userEmail && user_id) {
      try {
        const profileResponse = await fetch(
          `${supabaseUrl}/rest/v1/profiles?id=eq.${user_id}&select=email`,
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
    }

    if (!userEmail) {
      userEmail = 'Не указан';
    }

    // Формируем текст сообщения
    const messageText = `🆕 Новая регистрация\n👤 ${userEmail || 'Пользователь'}`;

    const botToken = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_ADMIN_CHAT_ID;

    // Отправляем сообщение в Telegram
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'HTML'
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Telegram sendMessage error:", errorData);
        throw new Error(`Telegram API error: ${response.status}`);
      }

      return new Response(
        JSON.stringify({ success: true, sent: true }),
        { status: 200, headers: corsHeaders }
      );

    } catch (telegramError) {
      console.error("Error sending Telegram message:", telegramError);
      return new Response(
        JSON.stringify({ error: "Failed to send Telegram notification" }),
        { status: 500, headers: corsHeaders }
      );
    }

  } catch (error) {
    console.error("Error in notify-new-user:", error);
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
