-- Принудительное обновление кэша схемы PostgREST
-- Выполните этот SQL в Supabase SQL Editor

-- 1. Убеждаемся, что колонка play_button_id существует
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'artists' 
    AND column_name = 'play_button_id'
  ) THEN
    ALTER TABLE public.artists ADD COLUMN play_button_id TEXT;
    RAISE NOTICE '✅ Колонка play_button_id создана';
  END IF;
END $$;

-- 2. Пробуем обновить кэш через NOTIFY (может помочь)
NOTIFY pgrst, 'reload schema';

-- 3. Пробуем обновить значение напрямую (чтобы проверить, работает ли)
UPDATE public.artists 
SET play_button_id = 'test-refresh'
WHERE id = '50b8808c-f0b7-4aa2-a517-998080ea72be'
RETURNING id, play_button_id;

-- 4. Откатываем тестовое значение
UPDATE public.artists 
SET play_button_id = NULL
WHERE id = '50b8808c-f0b7-4aa2-a517-998080ea72be';

-- 5. Проверяем, что колонка существует
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'artists' 
AND column_name = 'play_button_id';

-- ВАЖНО: После выполнения этого SQL:
-- 1. Подождите 1-2 минуты (кэш обновляется автоматически)
-- 2. Обновите страницу в браузере (F5)
-- 3. Попробуйте снова сохранить фон кнопок
--
-- Если ошибка 400 все еще есть, попробуйте:
-- - Закрыть и открыть браузер заново
-- - Очистить кэш браузера (Ctrl+Shift+Delete)
-- - Подождать еще 2-3 минуты


