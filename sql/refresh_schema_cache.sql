-- Обновление кэша схемы PostgREST
-- Выполните этот SQL в Supabase SQL Editor

-- 1. Проверяем, что колонка play_button_id действительно существует
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  table_name,
  table_schema
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'artists' 
AND column_name = 'play_button_id';

-- 2. Проверяем все колонки таблицы artists
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'artists'
ORDER BY ordinal_position;

-- 3. Пробуем обновить кэш схемы через NOTIFY (может помочь)
NOTIFY pgrst, 'reload schema';

-- 4. Проверяем, что можем обновить значение напрямую
UPDATE public.artists 
SET play_button_id = 'test-cache-refresh'
WHERE id = '50b8808c-f0b7-4aa2-a517-998080ea72be'
RETURNING id, play_button_id;

-- 5. Откатываем тестовое значение
UPDATE public.artists 
SET play_button_id = NULL
WHERE id = '50b8808c-f0b7-4aa2-a517-998080ea72be';

