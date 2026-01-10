// Прямой тест функции notify-new-user
// Запуск: node test-notify-direct.js

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bkyyiatcjhkzmmemkbah.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_KEY_HERE';
const TELEGRAM_BOT_TOKEN = '8405827498:AAGbTkz1L1lcjO3-MslEdB_Ui_j3rDab8sI';
const TELEGRAM_ADMIN_CHAT_ID = '8247308735';

async function testNotify() {
  console.log('🧪 Тестирование функции notify-new-user напрямую...\n');
  
  // Тест 1: Проверка Telegram бота
  console.log('1️⃣ Проверка Telegram бота...');
  try {
    const botTest = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const botData = await botTest.json();
    if (botData.ok) {
      console.log(`✅ Бот работает: @${botData.result.username}\n`);
    } else {
      console.error('❌ Бот не работает:', botData);
      return;
    }
  } catch (e) {
    console.error('❌ Ошибка проверки бота:', e.message);
    return;
  }
  
  // Тест 2: Отправка тестового сообщения в Telegram
  console.log('2️⃣ Отправка тестового сообщения в Telegram...');
  try {
    const msgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_ADMIN_CHAT_ID,
        text: '🧪 Тестовое сообщение от скрипта проверки'
      })
    });
    
    const msgData = await msgRes.json();
    if (msgData.ok) {
      console.log('✅ Тестовое сообщение отправлено в Telegram\n');
    } else {
      console.error('❌ Ошибка отправки сообщения:', msgData);
      console.error('Проверь chat_id:', TELEGRAM_ADMIN_CHAT_ID);
      return;
    }
  } catch (e) {
    console.error('❌ Ошибка:', e.message);
    return;
  }
  
  // Тест 3: Симуляция вызова функции notify-new-user
  console.log('3️⃣ Симуляция вызова /api/tg/notify-new-user...');
  console.log('⚠️  Это можно проверить только через реальный HTTP запрос к Cloudflare Pages\n');
  console.log('Выполни вручную:');
  console.log(`curl -X POST https://toqibox.win/api/tg/notify-new-user \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"user_id":"test-user-id","email":"test@example.com"}'`);
  console.log('\nИли открой в браузере:');
  console.log('https://toqibox.win/api/tg/notify-new-user');
  console.log('(должна вернуться ошибка, но это покажет, что функция доступна)');
}

// Проверка переменных окружения
console.log('📋 Переменные окружения:');
console.log(`SUPABASE_URL: ${SUPABASE_URL ? '✅ Установлен' : '❌ НЕ УСТАНОВЛЕН'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY !== 'YOUR_KEY_HERE' && SUPABASE_SERVICE_ROLE_KEY ? '✅ Установлен' : '❌ НЕ УСТАНОВЛЕН'}`);
console.log(`TELEGRAM_BOT_TOKEN: ✅ Установлен`);
console.log(`TELEGRAM_ADMIN_CHAT_ID: ✅ Установлен (${TELEGRAM_ADMIN_CHAT_ID})\n`);

testNotify();
