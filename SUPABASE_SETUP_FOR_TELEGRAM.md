# Что нужно настроить в Supabase для Telegram уведомлений

## ✅ Что уже должно быть (если SQL скрипты выполнены):

1. **Таблица `payment_requests`** - должна быть создана через `sql/create_payment_requests_table.sql`
2. **Функция `is_admin()`** - должна быть создана в том же скрипте
3. **RLS политики** - должны быть настроены

## 🔧 Что нужно проверить/добавить:

### 1. Получить Service Role Key (ОБЯЗАТЕЛЬНО!)

**Это нужно для Cloudflare Pages Functions** - они используют service role key для доступа к Supabase REST API.

**Шаги:**
1. Откройте [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. Перейдите в **Settings** → **API**
4. Найдите секцию **Project API keys**
5. Найдите ключ **`service_role` (secret)** - это тот, который нужен!
   - ⚠️ **НЕ** используйте `anon` или `public` ключ!
   - Service Role Key имеет **полные права доступа** к базе данных
6. Скопируйте этот ключ (начинается с `eyJ...`)

**Добавьте в Cloudflare Pages:**
- Название: `SUPABASE_SERVICE_ROLE_KEY`
- Значение: (скопированный service role key)
- Тип: **Secret** ⚠️ (обязательно!)

### 2. Проверить/создать Storage Bucket `payments`

**Для загрузки чеков пользователями:**

1. В Supabase Dashboard перейдите в **Storage**
2. Проверьте, есть ли bucket с названием `payments`
3. Если нет - создайте его:
   - Нажмите **"New bucket"**
   - Название: `payments`
   - **Public bucket:** ✅ Включить (чтобы чеки были доступны)
   - **File size limit:** 5MB (или больше, если нужно)
   - Нажмите **"Create bucket"**

4. **Настройте политики Storage:**

   Перейдите в **Storage** → **Policies** для bucket `payments`

   **Политика для загрузки (INSERT):**
   ```sql
   -- Разрешить авторизованным пользователям загружать файлы
   CREATE POLICY "Users can upload receipts"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'payments');
   ```

   **Политика для чтения (SELECT):**
   ```sql
   -- Разрешить всем читать файлы (т.к. bucket публичный)
   CREATE POLICY "Anyone can read receipts"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'payments');
   ```

   **Или через UI:**
   - Storage → `payments` bucket → Policies
   - Add policy для INSERT: `authenticated` users
   - Add policy для SELECT: `public` (или `authenticated`)

### 3. Проверить, что таблица `payment_requests` существует

**В Supabase Dashboard:**

1. Перейдите в **Table Editor**
2. Найдите таблицу `payment_requests`
3. Проверьте структуру - должна содержать колонки:
   - `id` (UUID)
   - `user_id` (UUID)
   - `product` (TEXT) - 'studio' или 'toqibox'
   - `plan` (TEXT) - 'premium' или 'premium_plus'
   - `amount` (NUMERIC)
   - `receipt_url` (TEXT)
   - `status` (TEXT) - 'pending', 'approved', 'rejected'
   - `created_at` (TIMESTAMPTZ)
   - `approved_at` (TIMESTAMPTZ)
   - `approved_by` (UUID)
   - `rejected_at` (TIMESTAMPTZ)
   - `rejected_by` (UUID)

**Если таблицы нет:**
- Выполните SQL скрипт `sql/create_payment_requests_table.sql` в Supabase SQL Editor

### 4. Проверить функцию `is_admin()`

**В Supabase Dashboard:**

1. Перейдите в **Database** → **Functions**
2. Найдите функцию `is_admin()` в схеме `public`
3. Если функции нет - выполните SQL скрипт `sql/create_payment_requests_table.sql` (там есть CREATE FUNCTION)

### 5. Проверить RLS политики для `payment_requests`

**В Supabase Dashboard:**

1. Перейдите в **Authentication** → **Policies** (или **Table Editor** → `payment_requests` → RLS)
2. Должны быть политики:
   - `pr_select_own` - пользователи видят свои заявки
   - `pr_insert_own` - пользователи могут создавать заявки
   - `pr_admin_select` - админы видят все заявки
   - `pr_admin_update` - админы могут обновлять заявки

**Если политик нет:**
- Выполните SQL скрипт `sql/create_payment_requests_table.sql`

### 6. (Опционально) Проверить, что `profiles` таблица имеет нужные поля

Для Telegram webhook нужны поля для подписок:

**Для Studio:**
- `studio_plan` (TEXT) - 'free', 'premium', 'premium_plus'
- `studio_plan_expires_at` (TIMESTAMPTZ)
- `studio_approved_at` (TIMESTAMPTZ)

**Для TOQIBOX:**
- `toqibox_plan` (TEXT) - 'free', 'premium', 'premium_plus'
- `toqibox_plan_expires_at` (TIMESTAMPTZ)
- `toqibox_approved_at` (TIMESTAMPTZ)

Если этих полей нет - webhook не сможет активировать подписки при одобрении заявок.

## ✅ Быстрая проверка - всё ли готово:

### SQL запрос для проверки структуры:

Выполните в Supabase SQL Editor:

```sql
-- Проверка таблицы payment_requests
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payment_requests'
ORDER BY ordinal_position;

-- Проверка функции is_admin
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'is_admin';

-- Проверка RLS политик
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'payment_requests';

-- Проверка Storage bucket
SELECT name, public
FROM storage.buckets
WHERE name = 'payments';
```

## 📝 Итого - что нужно сделать:

1. ✅ **Получить Service Role Key** из Supabase Dashboard → Settings → API
2. ✅ **Добавить его в Cloudflare Pages** как `SUPABASE_SERVICE_ROLE_KEY` (Secret)
3. ✅ **Проверить/создать Storage bucket `payments`**
4. ✅ **Убедиться, что таблица `payment_requests` существует**
5. ✅ **Убедиться, что функция `is_admin()` существует**
6. ✅ **Проверить RLS политики**

## 🔍 После настройки - тест:

1. Создайте тестовую заявку на оплату через `/pricing` или `/payment`
2. Проверьте, что файл чека загрузился в Storage bucket `payments`
3. Проверьте, что в таблице `payment_requests` появилась новая запись
4. Проверьте, что пришло уведомление в Telegram (chat_id: `8247308735`)
5. Нажмите кнопку "✅ Одобрить" в Telegram
6. Проверьте, что заявка обновилась в админ-панели и подписка активировалась
