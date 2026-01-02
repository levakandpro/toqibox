-- Проверка: все ли правильно настроено для play_button_id
-- Выполните этот SQL в Supabase SQL Editor

-- 1. Проверяем, существует ли поле play_button_id
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'artists' 
AND column_name = 'play_button_id';

-- 2. Проверяем, существует ли запись с нужным id
SELECT 
  id, 
  slug, 
  display_name, 
  page_background_id, 
  play_button_id,
  created_at,
  updated_at
FROM public.artists 
WHERE id = '50b8808c-f0b7-4aa2-a517-998080ea72be';

-- 3. Проверяем политику UPDATE (должен быть with_check = true)
SELECT 
  policyname, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'artists'
AND cmd = 'UPDATE';

-- 4. Пробуем обновить вручную (чтобы увидеть ошибку, если она есть)
UPDATE public.artists 
SET play_button_id = 'test-value'
WHERE id = '50b8808c-f0b7-4aa2-a517-998080ea72be'
RETURNING id, play_button_id;

-- 5. Откатываем тестовое значение
UPDATE public.artists 
SET play_button_id = NULL
WHERE id = '50b8808c-f0b7-4aa2-a517-998080ea72be';

