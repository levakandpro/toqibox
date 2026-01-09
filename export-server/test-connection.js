// Простой тест: проверка что Export Server работает
import http from 'http';

const PORT = 3001;

console.log(`🔍 Проверяю Export Server на http://localhost:${PORT}...`);

const req = http.get(`http://localhost:${PORT}/export/test`, (res) => {
  console.log(`✅ Export Server работает! Статус: ${res.statusCode}`);
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   Export Server ДОСТУПЕН!              ║');
  console.log('║   Можно пробовать экспорт в Studio     ║');
  console.log('╚════════════════════════════════════════╝');
  process.exit(0);
});

req.on('error', (err) => {
  console.error('❌ Export Server НЕ ЗАПУЩЕН!');
  console.error('');
  console.error('Ошибка:', err.message);
  console.error('');
  console.error('╔════════════════════════════════════════╗');
  console.error('║   ЗАПУСТИТЕ Export Server:             ║');
  console.error('║                                        ║');
  console.error('║   cd export-server                     ║');
  console.error('║   npm install                          ║');
  console.error('║   npm start                            ║');
  console.error('║                                        ║');
  console.error('╚════════════════════════════════════════╝');
  process.exit(1);
});

req.end();
