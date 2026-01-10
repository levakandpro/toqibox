# Отладка Telegram уведомлений

## Проблема: Уведомления не приходят в Telegram

### ✅ Шаг 1: Проверка переменных окружения

В Cloudflare Pages Dashboard → Settings → Environment Variables должны быть:

1. `TELEGRAM_BOT_TOKEN` = `8405827498:AAGbTkz1L1lcjO3-MslEdB_Ui_j3rDab8sI` ✅
2. `TELEGRAM_ADMIN_CHAT_ID` = `8247308735` ✅
3. `SUPABASE_URL` = (ваш Supabase URL, например `https://xxxxx.supabase.co`)
4. `SUPABASE_SERVICE_ROLE_KEY` = (service role key из Supabase)

**Проверка:**
- Если переменных нет - добавьте их и сделайте Retry deployment
- Если `SUPABASE_SERVICE_ROLE_KEY` нет - функция вернет `{"error":"Server configuration error"}`

### ✅ Шаг 2: Проверка webhook

```bash
node setup-webhook.js
```

Должно показать: `✅ Webhook проверен: URL: https://toqibox.win/api/tg/webhook`

### ✅ Шаг 3: Тест отправки сообщения

```bash
node test-telegram-notification.js
```

Должно отправить тестовое сообщение в Telegram. Если не приходит - проблема в токене или chat_id.

### ✅ Шаг 4: Проверка логов Cloudflare Pages Functions

1. Откройте Cloudflare Pages Dashboard
2. Перейдите в **Functions** → **View logs**
3. Найдите логи для `/api/tg/notify-payment-request` или `/api/tg/notify-new-user`

**Что искать в логах:**

#### Ошибка "Server configuration error":
```
Missing required environment variables
```
**Решение:** Добавьте все переменные окружения (см. Шаг 1)

#### Ошибка Supabase:
```
Error fetching payment request
```
**Решение:** 
- Проверьте, что `SUPABASE_URL` правильный
- Проверьте, что `SUPABASE_SERVICE_ROLE_KEY` правильный (service role, не anon!)
- Проверьте, что таблица `payment_requests` существует

#### Ошибка Telegram API:
```
Telegram API error: 400/401/403
```
**Решение:**
- Проверьте, что `TELEGRAM_BOT_TOKEN` правильный
- Проверьте, что `TELEGRAM_ADMIN_CHAT_ID` правильный
- Проверьте, что бот может отправлять сообщения (не заблокирован ли бот)

### ✅ Шаг 5: Проверка в браузере (консоль)

1. Откройте страницу `/pricing` или `/payment`
2. Откройте DevTools (F12) → Console
3. Создайте заявку на оплату
4. Смотрите логи:

**Если видите:**
```
[Payment] ✅ Уведомление в Telegram отправлено
```
✅ Всё работает! Проверьте Telegram.

**Если видите:**
```
[Payment] Ошибка отправки уведомления в Telegram: { status: 500, body: "Server configuration error" }
```
❌ Не хватает переменных окружения.

**Если видите:**
```
[Payment] Ошибка отправки уведомления в Telegram: { status: 400, body: "payment_request_id is required" }
```
❌ Проблема с передачей `payment_request_id`.

### ✅ Шаг 6: Ручная проверка endpoint

Откройте в браузере (замените `YOUR_PAYMENT_REQUEST_ID` на реальный ID из БД):
```
https://toqibox.win/api/tg/notify-payment-request
```

**С POST запросом через curl или Postman:**
```bash
curl -X POST https://toqibox.win/api/tg/notify-payment-request \
  -H "Content-Type: application/json" \
  -d '{"payment_request_id": "YOUR_PAYMENT_REQUEST_ID"}'
```

**Ожидаемый ответ:**
- `200 OK` с `{"success": true}` - всё работает ✅
- `500` с `{"error":"Server configuration error"}` - не хватает переменных ❌
- `400` с `{"error":"payment_request_id is required"}` - неправильный запрос ❌

### ✅ Шаг 7: Проверка заявок в БД

1. Откройте Supabase Dashboard → Table Editor → `payment_requests`
2. Проверьте, что заявка создана со статусом `pending`
3. Скопируйте `id` заявки
4. Используйте этот ID для ручной проверки (Шаг 6)

## Частые проблемы и решения

### Проблема: "Server configuration error"
**Причина:** Не все переменные окружения добавлены  
**Решение:** Добавьте `SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` в Cloudflare Pages

### Проблема: Уведомление не отправляется, но заявка сохраняется
**Причина:** Функция `/api/tg/notify-payment-request` не вызывается или падает  
**Решение:** Проверьте логи Cloudflare Pages Functions (Шаг 4)

### Проблема: Заявка не создается в БД
**Причина:** Проблема с RLS политиками или таблицей  
**Решение:** 
- Проверьте, что таблица `payment_requests` существует
- Проверьте RLS политики в Supabase
- Выполните SQL скрипт `sql/create_payment_requests_table.sql`

### Проблема: Telegram получает сообщение, но без чека
**Причина:** `receipt_url` недоступен или файл не загружен в Storage  
**Решение:**
- Проверьте, что файл загружен в Storage bucket `payments`
- Проверьте, что `receipt_url` в БД указывает на правильный URL
- Проверьте, что bucket `payments` публичный

## После исправления

1. Сделайте **Retry deployment** в Cloudflare Pages
2. Дождитесь завершения деплоя
3. Протестируйте создание заявки снова
4. Проверьте логи и консоль браузера
