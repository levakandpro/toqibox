// Быстрая настройка webhook для Telegram бота
const BOT_TOKEN = '8405827498:AAGbTkz1L1lcjO3-MslEdB_Ui_j3rDab8sI';
const WEBHOOK_URL = 'https://toqibox.win/api/tg/webhook';

async function setup() {
  try {
    // 1. Проверяем бота
    console.log('🔍 Проверяем бота...');
    const botInfoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const botInfo = await botInfoRes.json();
    
    if (!botInfo.ok) {
      throw new Error(`Ошибка проверки бота: ${botInfo.description}`);
    }
    
    console.log(`✅ Бот найден: @${botInfo.result.username} (${botInfo.result.first_name})`);
    
    // 2. Получаем последние обновления (чтобы найти chat_id)
    console.log('\n🔍 Ищем chat_id...');
    const updatesRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
    const updates = await updatesRes.json();
    
    if (updates.ok && updates.result && updates.result.length > 0) {
      const lastUpdate = updates.result[updates.result.length - 1];
      const chatId = lastUpdate.message?.chat?.id || lastUpdate.callback_query?.message?.chat?.id;
      
      if (chatId) {
        console.log(`✅ Найден chat_id: ${chatId}`);
        console.log(`   Имя чата: ${lastUpdate.message?.chat?.first_name || lastUpdate.message?.chat?.title || 'Неизвестно'}`);
      } else {
        console.log('⚠️  Chat_id не найден в обновлениях. Нужно отправить любое сообщение боту.');
      }
    } else {
      console.log('⚠️  Обновлений нет. Отправьте любое сообщение боту @toqibox_bot, затем запустите:');
      console.log(`   node setup-webhook.js --get-chat-id`);
    }
    
    // 3. Настраиваем webhook
    console.log(`\n🔗 Настраиваем webhook на ${WEBHOOK_URL}...`);
    const webhookRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: WEBHOOK_URL })
    });
    
    const webhookResult = await webhookRes.json();
    
    if (!webhookResult.ok) {
      throw new Error(`Ошибка настройки webhook: ${webhookResult.description}`);
    }
    
    console.log('✅ Webhook успешно настроен!');
    
    // 4. Проверяем webhook
    console.log('\n🔍 Проверяем webhook...');
    const checkRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const checkResult = await checkRes.json();
    
    if (checkResult.ok) {
      const info = checkResult.result;
      console.log(`✅ Webhook проверен:`);
      console.log(`   URL: ${info.url}`);
      console.log(`   Ожидает обновлений: ${info.pending_update_count}`);
      if (info.last_error_date) {
        const errorDate = new Date(info.last_error_date * 1000);
        console.log(`   ⚠️  Последняя ошибка: ${info.last_error_message} (${errorDate.toLocaleString('ru-RU')})`);
      }
    }
    
    console.log('\n📝 Следующие шаги:');
    console.log('1. Добавьте переменные окружения в Cloudflare Pages Dashboard:');
    console.log('   Settings → Environment Variables → Production');
    console.log(`   TELEGRAM_BOT_TOKEN = ${BOT_TOKEN}`);
    console.log('   TELEGRAM_ADMIN_CHAT_ID = (ваш chat_id - см. выше или отправьте сообщение боту)');
    console.log('   SUPABASE_URL = (ваш VITE_SUPABASE_URL из существующих переменных)');
    console.log('   SUPABASE_SERVICE_ROLE_KEY = (service role key из Supabase Dashboard → Settings → API)');
    console.log('\n2. После добавления переменных сделайте Retry deployment');
    console.log('\n3. Протестируйте создание заявки на оплату - должно прийти уведомление в Telegram');
    
  } catch (error) {
    console.error(`\n❌ Ошибка: ${error.message}`);
    process.exit(1);
  }
}

setup();
