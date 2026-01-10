// Скрипт для тестирования Telegram уведомлений
// Запуск: node test-telegram-notification.js

const BOT_TOKEN = '8405827498:AAGbTkz1L1lcjO3-MslEdB_Ui_j3rDab8sI';
const CHAT_ID = '8247308735';

async function testNotification() {
  try {
    console.log('🧪 Тестирование Telegram уведомления...\n');
    
    // Тест 1: Простое сообщение
    console.log('1️⃣ Тест отправки простого сообщения...');
    const messageRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: '🧪 Тестовое сообщение от бота @toqibox_bot'
      })
    });
    
    const messageData = await messageRes.json();
    
    if (messageData.ok) {
      console.log('✅ Сообщение отправлено успешно!\n');
    } else {
      console.error('❌ Ошибка отправки сообщения:', messageData);
      return;
    }
    
    // Тест 2: Сообщение с кнопками (как при заявке на оплату)
    console.log('2️⃣ Тест отправки сообщения с кнопками...');
    const buttonRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: '💰 Тестовая заявка на оплату\n📦 Продукт: TOQIBOX\n💎 Тариф: PREMIUM\n💵 Сумма: 100 TJS\n👤 test@example.com',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Одобрить', callback_data: 'approve_test123_studio' },
              { text: '❌ Отклонить', callback_data: 'reject_test123_studio' }
            ]
          ]
        }
      })
    });
    
    const buttonData = await buttonRes.json();
    
    if (buttonData.ok) {
      console.log('✅ Сообщение с кнопками отправлено успешно!\n');
    } else {
      console.error('❌ Ошибка отправки сообщения с кнопками:', buttonData);
      return;
    }
    
    console.log('✅ Все тесты пройдены! Проверьте Telegram чат @toqibox_bot');
    console.log(`   Chat ID: ${CHAT_ID}`);
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  }
}

testNotification();
