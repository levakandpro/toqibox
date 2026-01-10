#!/usr/bin/env node

/**
 * Скрипт для настройки Telegram webhook
 * 
 * Использование:
 *   node setup-telegram.js --token YOUR_BOT_TOKEN --chat-id YOUR_CHAT_ID --url https://your-domain.com
 * 
 * Или интерактивно:
 *   node setup-telegram.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupWebhook() {
  console.log('🤖 Настройка Telegram webhook для TOQIBOX/TQ STUDIO\n');

  // Получаем параметры из аргументов командной строки или интерактивно
  let botToken = process.argv.find(arg => arg.startsWith('--token='))?.split('=')[1];
  let chatId = process.argv.find(arg => arg.startsWith('--chat-id='))?.split('=')[1];
  let webhookUrl = process.argv.find(arg => arg.startsWith('--url='))?.split('=')[1];

  if (!botToken) {
    botToken = await question('Введите TELEGRAM_BOT_TOKEN: ');
  }
  
  if (!chatId) {
    chatId = await question('Введите TELEGRAM_ADMIN_CHAT_ID: ');
  }
  
  if (!webhookUrl) {
    webhookUrl = await question('Введите URL вашего сайта (например, https://toqibox.win): ');
  }

  if (!botToken || !chatId || !webhookUrl) {
    console.error('❌ Все параметры обязательны!');
    rl.close();
    process.exit(1);
  }

  const webhookEndpoint = `${webhookUrl}/api/tg/webhook`;

  console.log('\n📋 Параметры:');
  console.log(`  Bot Token: ${botToken.substring(0, 10)}...`);
  console.log(`  Chat ID: ${chatId}`);
  console.log(`  Webhook URL: ${webhookEndpoint}\n`);

  try {
    // Проверяем информацию о боте
    console.log('🔍 Проверяем информацию о боте...');
    const botInfoResponse = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    
    if (!botInfoResponse.ok) {
      const errorText = await botInfoResponse.text();
      throw new Error(`Ошибка проверки бота: ${botInfoResponse.status} - ${errorText}`);
    }

    const botInfo = await botInfoResponse.json();
    console.log(`✅ Бот найден: @${botInfo.result.username}\n`);

    // Настраиваем webhook
    console.log('🔗 Настраиваем webhook...');
    const webhookResponse = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookEndpoint
      })
    });

    if (!webhookResponse.ok) {
      const errorText = await webhookResponse.text();
      throw new Error(`Ошибка настройки webhook: ${webhookResponse.status} - ${errorText}`);
    }

    const webhookResult = await webhookResponse.json();
    
    if (webhookResult.ok) {
      console.log('✅ Webhook успешно настроен!\n');
    } else {
      throw new Error(`Webhook не настроен: ${webhookResult.description}`);
    }

    // Проверяем webhook
    console.log('🔍 Проверяем webhook...');
    const checkResponse = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
    
    if (!checkResponse.ok) {
      throw new Error('Ошибка проверки webhook');
    }

    const webhookInfo = await checkResponse.json();
    
    if (webhookInfo.ok) {
      const info = webhookInfo.result;
      console.log(`✅ Webhook проверен:`);
      console.log(`   URL: ${info.url}`);
      console.log(`   Ожидает обновления: ${info.pending_update_count}`);
      if (info.last_error_message) {
        console.log(`   ⚠️  Последняя ошибка: ${info.last_error_message}`);
      }
    }

    console.log('\n📝 Следующие шаги:');
    console.log('1. Добавьте переменные окружения в Cloudflare Pages Dashboard:');
    console.log('   - Settings → Environment Variables');
    console.log(`   - TELEGRAM_BOT_TOKEN = ${botToken}`);
    console.log(`   - TELEGRAM_ADMIN_CHAT_ID = ${chatId}`);
    console.log('   - SUPABASE_URL = (ваш Supabase URL, обычно тот же что VITE_SUPABASE_URL)');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY = (service role key из Supabase Dashboard)');
    console.log('\n2. После добавления переменных сделайте новый деплой (или Retry deployment)');
    console.log('\n3. Протестируйте создание заявки на оплату - должно прийти уведомление в Telegram');

  } catch (error) {
    console.error(`\n❌ Ошибка: ${error.message}`);
    rl.close();
    process.exit(1);
  }

  rl.close();
}

setupWebhook();
