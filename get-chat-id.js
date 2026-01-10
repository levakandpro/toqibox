// Получить chat_id (временно удалит webhook, получит chat_id, затем вернет webhook)
const BOT_TOKEN = '8405827498:AAGbTkz1L1lcjO3-MslEdB_Ui_j3rDab8sI';
const WEBHOOK_URL = 'https://toqibox.win/api/tg/webhook';

async function getChatId() {
  try {
    console.log('🔍 Получаем chat_id...\n');
    console.log('⚠️  Убедитесь, что вы отправили любое сообщение боту @toqibox_bot\n');
    console.log('⏳ Временно удаляем webhook для получения обновлений...\n');
    
    // 1. Временно удаляем webhook
    const deleteRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drop_pending_updates: false }) // Не удаляем ожидающие обновления
    });
    const deleteResult = await deleteRes.json();
    
    if (!deleteResult.ok) {
      throw new Error(`Ошибка удаления webhook: ${deleteResult.description}`);
    }
    
    console.log('✅ Webhook временно удален\n');
    console.log('⏳ Получаем обновления...\n');
    
    // Небольшая задержка для получения обновлений
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 2. Получаем обновления
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    const data = await res.json();
    
    if (!data.ok) {
      throw new Error(`Ошибка: ${data.description}`);
    }
    
    if (!data.result || data.result.length === 0) {
      console.log('❌ Обновлений нет. Отправьте любое сообщение боту @toqibox_bot и попробуйте снова.');
      // Восстанавливаем webhook
      await restoreWebhook();
      return;
    }
    
    // Находим все уникальные chat_id
    const chatIds = new Set();
    const chats = [];
    
    for (const update of data.result) {
      const chat = update.message?.chat || update.callback_query?.message?.chat;
      if (chat && !chatIds.has(chat.id)) {
        chatIds.add(chat.id);
        chats.push({
          id: chat.id,
          type: chat.type,
          firstName: chat.first_name,
          lastName: chat.last_name,
          username: chat.username,
          title: chat.title
        });
      }
    }
    
    if (chats.length === 0) {
      console.log('❌ Chat_id не найден. Отправьте сообщение боту @toqibox_bot и попробуйте снова.');
      // Восстанавливаем webhook
      await restoreWebhook();
      return;
    }
    
    console.log('✅ Найдены chat_id:\n');
    
    chats.forEach((chat, index) => {
      console.log(`${index + 1}. Chat ID: ${chat.id}`);
      if (chat.title) {
        console.log(`   Группа/Канал: ${chat.title}`);
      } else {
        console.log(`   Имя: ${chat.firstName || ''} ${chat.lastName || ''}`.trim());
        if (chat.username) {
          console.log(`   Username: @${chat.username}`);
        }
      }
      console.log(`   Тип: ${chat.type}\n`);
    });
    
    // Рекомендуем первый (последний) chat_id
    const recommendedChatId = chats[chats.length - 1].id;
    console.log('📝 Рекомендуемый TELEGRAM_ADMIN_CHAT_ID:');
    console.log(`   ${recommendedChatId}\n`);
    
    // 3. Восстанавливаем webhook
    console.log('⏳ Восстанавливаем webhook...\n');
    await restoreWebhook();
    
    console.log('✅ Готово! Скопируйте chat_id выше и добавьте в Cloudflare Pages как TELEGRAM_ADMIN_CHAT_ID');
    
  } catch (error) {
    console.error(`\n❌ Ошибка: ${error.message}`);
    // Пытаемся восстановить webhook даже при ошибке
    try {
      await restoreWebhook();
    } catch (e) {
      console.error(`⚠️  Не удалось восстановить webhook: ${e.message}`);
      console.log('Запустите: node setup-webhook.js для восстановления webhook');
    }
    process.exit(1);
  }
}

async function restoreWebhook() {
  const webhookRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: WEBHOOK_URL })
  });
  
  const webhookResult = await webhookRes.json();
  
  if (!webhookResult.ok) {
    throw new Error(`Ошибка восстановления webhook: ${webhookResult.description}`);
  }
  
  console.log('✅ Webhook восстановлен\n');
}

getChatId();
