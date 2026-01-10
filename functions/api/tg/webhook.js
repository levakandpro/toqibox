/**
 * Cloudflare Pages Function: POST /api/tg/webhook
 * 
 * Webhook для обработки Telegram Bot API updates
 * Обрабатывает callback_query (нажатия кнопок Одобрить/Отклонить)
 * 
 * Защита: принимает апдейты только от ADMIN_TG_CHAT_ID
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // Проверяем наличие обязательных переменных окружения
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_ADMIN_CHAT_ID || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing required environment variables");
      return new Response("Server configuration error", { status: 500 });
    }

    // Получаем update от Telegram
    const update = await request.json().catch(() => null);
    
    if (!update) {
      return new Response("Invalid request body", { status: 400 });
    }

    // Обрабатываем только callback_query (нажатия кнопок)
    if (!update.callback_query) {
      // Если это не callback_query, просто подтверждаем получение
      return new Response("OK", { status: 200 });
    }

    const callbackQuery = update.callback_query;
    const chatId = callbackQuery.message?.chat?.id;
    const messageId = callbackQuery.message?.message_id;

    // ЗАЩИТА: принимаем только из админского чата
    if (String(chatId) !== String(env.TELEGRAM_ADMIN_CHAT_ID)) {
      console.warn("Unauthorized chat_id:", chatId);
      return new Response("Unauthorized", { status: 403 });
    }

    // Парсим callback_data
    let callbackData;
    try {
      callbackData = JSON.parse(callbackQuery.data);
    } catch (e) {
      console.error("Invalid callback_data:", callbackQuery.data);
      return new Response("Invalid callback_data", { status: 400 });
    }

    const { action, request_id, product } = callbackData;

    if (!action || !request_id || !product) {
      console.error("Missing required fields in callback_data:", callbackData);
      return new Response("Invalid callback_data", { status: 400 });
    }

    // Подтверждаем получение callback_query (убираем загрузку на кнопке)
    const botToken = env.TELEGRAM_BOT_TOKEN;
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQuery.id
      })
    }).catch(err => console.error("Error answering callback:", err));

    // Используем Supabase REST API напрямую (service role)
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

    // Получаем данные заявки через REST API
    const requestResponse = await fetch(
      `${supabaseUrl}/rest/v1/payment_requests?id=eq.${request_id}&select=id,user_id,product,plan,amount,receipt_url,status`,
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
      await sendTelegramMessage(botToken, chatId, `❌ Ошибка: Заявка не найдена`, messageId);
      return new Response("Payment request not found", { status: 404 });
    }

    const paymentRequests = await requestResponse.json();
    const paymentRequest = paymentRequests?.[0];

    if (!paymentRequest) {
      console.error("Payment request not found");
      await sendTelegramMessage(botToken, chatId, `❌ Ошибка: Заявка не найдена`, messageId);
      return new Response("Payment request not found", { status: 404 });
    }

    // Проверяем соответствие product
    if (paymentRequest.product !== product) {
      console.error("Product mismatch:", paymentRequest.product, product);
      await sendTelegramMessage(botToken, chatId, `❌ Ошибка: Несоответствие продукта`, messageId);
      return new Response("Product mismatch", { status: 400 });
    }

    // Проверяем, что заявка в статусе pending (идемпотентность)
    if (paymentRequest.status !== 'pending') {
      const statusText = paymentRequest.status === 'approved' ? 'одобрена' : 'отклонена';
      await sendTelegramMessage(botToken, chatId, `⚠️ Заявка уже ${statusText}`, messageId);
      return new Response("Request already processed", { status: 200 });
    }

    const productLabel = product === 'studio' ? 'TQ STUDIO' : 'TOQIBOX';
    const planLabel = paymentRequest.plan?.toUpperCase() || 'N/A';

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

    if (action === 'approve') {
      // ОДОБРЕНИЕ
      try {
        // Обновляем заявку (идемпотентно - проверка статуса уже выполнена выше)
        const updateResponse = await fetch(
          `${supabaseUrl}/rest/v1/payment_requests?id=eq.${request_id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              status: 'approved',
              approved_at: new Date().toISOString(),
              approved_by: null // Можно оставить null если нет админского user_id из Telegram
            })
          }
        );

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          throw new Error(`Update failed: ${updateResponse.status} - ${errorText}`);
        }

        const updatedRequests = await updateResponse.json();

        // Проверяем, что обновлена ровно 1 запись
        if (!updatedRequests || updatedRequests.length === 0) {
          await sendTelegramMessage(botToken, chatId, `⚠️ Заявка не найдена`, messageId);
          return new Response("Request not found", { status: 404 });
        }

        if (updatedRequests.length !== 1) {
          console.error("Unexpected number of updated rows:", updatedRequests.length);
          throw new Error(`Unexpected update result: ${updatedRequests.length} rows`);
        }

        const updatedRequest = updatedRequests[0];
        
        // Дополнительная проверка: убеждаемся, что статус действительно approved
        if (updatedRequest.status !== 'approved') {
          console.error("Status update failed - unexpected status:", updatedRequest.status);
          // Если статус не изменился (race condition), отправляем сообщение и завершаем
          if (updatedRequest.status === 'pending') {
            await sendTelegramMessage(botToken, chatId, `⚠️ Заявка уже обрабатывается другим запросом`, messageId);
            return new Response("Request being processed", { status: 200 });
          }
          throw new Error(`Status update failed - got ${updatedRequest.status} instead of approved`);
        }

        // Рассчитываем дату истечения
        const expiresAt = new Date();
        // PREMIUM+ дается на 1 год (365 дней), PREMIUM на 30 дней
        if (paymentRequest.plan === 'premium_plus') {
          expiresAt.setDate(expiresAt.getDate() + 365);
        } else {
          expiresAt.setDate(expiresAt.getDate() + 30);
        }

        // Обновляем профиль пользователя в зависимости от продукта через REST API
        if (product === 'studio') {
          const profileUpdateResponse = await fetch(
            `${supabaseUrl}/rest/v1/profiles?id=eq.${paymentRequest.user_id}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify({
                studio_plan: paymentRequest.plan,
                studio_plan_expires_at: expiresAt.toISOString(),
                studio_approved_at: new Date().toISOString(),
                studio_approved_by: null
              })
            }
          );

          if (!profileUpdateResponse.ok) {
            const errorText = await profileUpdateResponse.text();
            throw new Error(`Profile update error: ${profileUpdateResponse.status} - ${errorText}`);
          }
        } else if (product === 'toqibox') {
          const profileUpdateResponse = await fetch(
            `${supabaseUrl}/rest/v1/profiles?id=eq.${paymentRequest.user_id}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify({
                toqibox_plan: paymentRequest.plan,
                toqibox_plan_expires_at: expiresAt.toISOString()
              })
            }
          );

          if (!profileUpdateResponse.ok) {
            const errorText = await profileUpdateResponse.text();
            throw new Error(`Profile update error: ${profileUpdateResponse.status} - ${errorText}`);
          }
        }

        // Отправляем подтверждение в Telegram
        const expiresDateStr = expiresAt.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        
        const durationText = paymentRequest.plan === 'premium_plus' ? '1 год' : '30 дней';
        const successText = `✅ Подтверждено\n` +
          `📦 ${productLabel}\n` +
          `💎 ${planLabel}\n` +
          `👤 ${userEmail}\n` +
          `✅ Активен до ${expiresDateStr} (${durationText})`;

        await sendTelegramMessage(botToken, chatId, successText, messageId);

        return new Response("OK", { status: 200 });

      } catch (error) {
        console.error("Error approving payment request:", error);
        await sendTelegramMessage(botToken, chatId, `❌ Ошибка при одобрении: ${error.message}`, messageId);
        return new Response("Internal server error", { status: 500 });
      }

    } else if (action === 'reject') {
      // ОТКЛОНЕНИЕ
      try {
        // Обновляем заявку (идемпотентно - проверка статуса уже выполнена выше)
        const updateResponse = await fetch(
          `${supabaseUrl}/rest/v1/payment_requests?id=eq.${request_id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              status: 'rejected',
              rejected_at: new Date().toISOString(),
              rejected_by: null
            })
          }
        );

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          throw new Error(`Update failed: ${updateResponse.status} - ${errorText}`);
        }

        const updatedRequests = await updateResponse.json();

        // Проверяем, что обновлена ровно 1 запись
        if (!updatedRequests || updatedRequests.length === 0) {
          await sendTelegramMessage(botToken, chatId, `⚠️ Заявка не найдена`, messageId);
          return new Response("Request not found", { status: 404 });
        }

        if (updatedRequests.length !== 1) {
          console.error("Unexpected number of updated rows:", updatedRequests.length);
          throw new Error(`Unexpected update result: ${updatedRequests.length} rows`);
        }

        const updatedRequest = updatedRequests[0];
        
        // Дополнительная проверка: убеждаемся, что статус действительно rejected
        if (updatedRequest.status !== 'rejected') {
          console.error("Status update failed - unexpected status:", updatedRequest.status);
          // Если статус не изменился (race condition), отправляем сообщение и завершаем
          if (updatedRequest.status === 'pending') {
            await sendTelegramMessage(botToken, chatId, `⚠️ Заявка уже обрабатывается другим запросом`, messageId);
            return new Response("Request being processed", { status: 200 });
          }
          throw new Error(`Status update failed - got ${updatedRequest.status} instead of rejected`);
        }

        // Профиль НЕ меняем при отклонении

        // Отправляем подтверждение в Telegram
        const rejectText = `❌ Отклонено\n` +
          `📦 ${productLabel}\n` +
          `💎 ${planLabel}\n` +
          `👤 ${userEmail}`;

        await sendTelegramMessage(botToken, chatId, rejectText, messageId);

        return new Response("OK", { status: 200 });

      } catch (error) {
        console.error("Error rejecting payment request:", error);
        await sendTelegramMessage(botToken, chatId, `❌ Ошибка при отклонении: ${error.message}`, messageId);
        return new Response("Internal server error", { status: 500 });
      }

    } else {
      console.error("Unknown action:", action);
      return new Response("Unknown action", { status: 400 });
    }

  } catch (error) {
    console.error("Error in webhook:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

/**
 * Отправляет сообщение в Telegram и редактирует исходное сообщение
 */
async function sendTelegramMessage(botToken, chatId, text, messageIdToEdit) {
  try {
    if (messageIdToEdit) {
      // Редактируем исходное сообщение
      await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageIdToEdit,
          text: text,
          parse_mode: 'HTML'
        })
      });
    } else {
      // Отправляем новое сообщение
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
        })
      });
    }
  } catch (error) {
    console.error("Error sending Telegram message:", error);
  }
}
