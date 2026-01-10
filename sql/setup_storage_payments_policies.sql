-- Настройка RLS политик для Storage bucket "payments"
-- ⚠️ ВАЖНО: Выполните этот скрипт ПОСЛЕ создания bucket "payments" в Supabase Dashboard

-- ШАГ 1: Убедитесь, что bucket "payments" существует и создан
-- Если bucket не существует, создайте его вручную:
-- Supabase Dashboard → Storage → New bucket → Название: "payments" → Public: true

-- ШАГ 2: Удаляем старые политики, если они есть (для обновления)
DROP POLICY IF EXISTS "Users can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public can read receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own receipts" ON storage.objects;

-- ШАГ 3: Создаем политику для загрузки файлов (INSERT)
-- Авторизованные пользователи могут загружать файлы в bucket "payments"
-- Путь файла: {user_id}/{timestamp}.{ext}
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payments' AND
  -- Проверяем, что путь начинается с user_id текущего пользователя
  -- name будет в формате: {user_id}/{timestamp}.{ext}
  split_part(name, '/', 1) = (auth.uid())::text
);

-- ШАГ 4: Создаем политику для чтения файлов (SELECT)
-- Все могут читать файлы из bucket "payments" (т.к. bucket публичный)
CREATE POLICY "Public can read receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payments');

-- ШАГ 5: Создаем политику для удаления файлов (DELETE)
-- Пользователи могут удалять только свои файлы
CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'payments' AND
  split_part(name, '/', 1) = (auth.uid())::text
);

-- ШАГ 6: Проверка политик
-- Выполните этот запрос, чтобы увидеть все политики для bucket "payments":
-- SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%receipt%';

-- ПРИМЕЧАНИЯ:
-- 1. Структура файлов в bucket "payments": {user_id}/{timestamp}.{ext}
--    Например: 6a5db1c7-85e8-464b-86c8-4256b9ae6ac8/1768064712516.jpg
--    (БЕЗ префикса "payments/" - bucket уже "payments")
-- 2. Политика INSERT проверяет, что первая часть пути (split_part) = user_id текущего пользователя
-- 3. Политика SELECT позволяет всем читать файлы (для админки и Telegram)
-- 4. Политика DELETE позволяет пользователям удалять только свои файлы
