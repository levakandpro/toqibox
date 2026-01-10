-- ИСПРАВЛЕНИЕ RLS ПОЛИТИК ДЛЯ STORAGE BUCKET "payments"
-- ⚠️ ВАЖНО: Выполни этот скрипт в Supabase SQL Editor
-- ⚠️ ВАЖНО: Сначала создай bucket "payments" в Supabase Dashboard → Storage → New bucket

-- ШАГ 1: Проверяем, что bucket "payments" существует
SELECT name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE name = 'payments';

-- Если bucket не существует, создай его вручную:
-- Supabase Dashboard → Storage → New bucket → Название: "payments" → Public: true

-- ШАГ 2: Удаляем ВСЕ старые политики для bucket "payments" (если есть)
DROP POLICY IF EXISTS "Users can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public can read receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public reads" ON storage.objects;

-- ШАГ 3: Создаем политику для ЗАГРУЗКИ (INSERT)
-- Авторизованные пользователи могут загружать файлы в bucket "payments"
-- Путь файла: {user_id}/{timestamp}.{ext}
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payments' AND
  -- Проверяем, что первая часть пути (до первого слэша) = user_id текущего пользователя
  -- name будет в формате: {user_id}/{timestamp}.{ext}
  (string_to_array(name, '/'))[1] = (auth.uid())::text
);

-- ШАГ 4: Создаем политику для ЧТЕНИЯ (SELECT)
-- Все могут читать файлы из bucket "payments" (для админки и Telegram)
CREATE POLICY "Public can read receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'payments');

-- ШАГ 5: Создаем политику для УДАЛЕНИЯ (DELETE) - опционально
-- Пользователи могут удалять только свои файлы
CREATE POLICY "Users can delete own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'payments' AND
  (string_to_array(name, '/'))[1] = (auth.uid())::text
);

-- ШАГ 6: Проверка политик
SELECT 
  policyname, 
  cmd, 
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%receipt%'
ORDER BY cmd;

-- ПРИМЕЧАНИЯ:
-- 1. Путь файла в bucket "payments": {user_id}/{timestamp}.{ext}
--    Пример: 6a5db1c7-85e8-464b-86c8-4256b9ae6ac8/1768064712516.jpg
--    БЕЗ префикса "payments/" - bucket уже "payments"
-- 2. Политика INSERT проверяет, что первая часть пути = user_id
-- 3. Политика SELECT позволяет всем читать (для админки)
-- 4. Политика DELETE позволяет удалять только свои файлы

-- ЕСЛИ ПОЛИТИКИ НЕ РАБОТАЮТ:
-- 1. Проверь, что bucket "payments" создан и публичный
-- 2. Проверь, что bucket существует: SELECT * FROM storage.buckets WHERE name = 'payments';
-- 3. Если bucket не существует - создай его через Supabase Dashboard
