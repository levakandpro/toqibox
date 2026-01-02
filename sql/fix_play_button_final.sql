-- ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ: Принудительное обновление кэша PostgREST
-- Выполните этот SQL в Supabase SQL Editor
-- После выполнения ОБЯЗАТЕЛЬНО перезагрузите схему в Dashboard: Settings → API → Reload schema

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
    RAISE NOTICE 'Колонка play_button_id создана';
  ELSE
    RAISE NOTICE 'Колонка play_button_id уже существует';
  END IF;
END $$;

-- 2. Удаляем старую колонку play_button_i, если она существует
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'artists' 
    AND column_name = 'play_button_i'
  ) THEN
    -- Копируем данные из play_button_i в play_button_id
    UPDATE public.artists 
    SET play_button_id = play_button_i 
    WHERE play_button_i IS NOT NULL 
    AND (play_button_id IS NULL OR play_button_id = '');
    
    -- Удаляем старую колонку
    ALTER TABLE public.artists DROP COLUMN play_button_i;
    RAISE NOTICE 'Колонка play_button_i удалена, данные скопированы';
  END IF;
END $$;

-- 3. Проверяем политику UPDATE (должна иметь WITH CHECK)
DROP POLICY IF EXISTS "Allow update for development" ON public.artists;

CREATE POLICY "Allow update for development"
  ON public.artists FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 4. Пробуем обновить значение напрямую (чтобы проверить, что все работает)
UPDATE public.artists 
SET play_button_id = 'test-final-fix'
WHERE id = '50b8808c-f0b7-4aa2-a517-998080ea72be'
RETURNING id, play_button_id;

-- 5. Откатываем тестовое значение
UPDATE public.artists 
SET play_button_id = NULL
WHERE id = '50b8808c-f0b7-4aa2-a517-998080ea72be';

-- 6. Проверяем результат
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'artists' 
AND column_name = 'play_button_id';

-- 7. Проверяем политики
SELECT 
  policyname, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'artists'
AND cmd = 'UPDATE';

-- ВАЖНО: После выполнения этого SQL:
-- 1. Перейдите в Supabase Dashboard → Settings → API
-- 2. Найдите кнопку "Reload schema" или "Refresh schema"
-- 3. Нажмите её и подождите 10-30 секунд
-- 4. Обновите страницу в браузере (F5)
-- 5. Попробуйте снова сохранить фон кнопок

