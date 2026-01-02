-- ПОЛНОЕ ИСПРАВЛЕНИЕ: play_button_id для продакшена
-- Выполните этот SQL в Supabase SQL Editor
-- ВАЖНО: После выполнения ОБЯЗАТЕЛЬНО перезагрузите схему: Settings → API → Reload schema

-- ============================================
-- 1. Убеждаемся, что колонка play_button_id существует
-- ============================================
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
  ELSE
    RAISE NOTICE '✅ Колонка play_button_id уже существует';
  END IF;
END $$;

-- ============================================
-- 2. Удаляем старую колонку play_button_i, если она существует
-- ============================================
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
    RAISE NOTICE '✅ Колонка play_button_i удалена, данные скопированы';
  END IF;
END $$;

-- ============================================
-- 3. Исправляем политику UPDATE (должна иметь WITH CHECK)
-- ============================================
DROP POLICY IF EXISTS "Allow update for development" ON public.artists;

CREATE POLICY "Allow update for development"
  ON public.artists FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. Создаем RPC функцию для обновления (обходит кэш PostgREST)
-- ============================================
CREATE OR REPLACE FUNCTION public.update_artist_play_button(
  artist_id UUID,
  new_play_button_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
  artist_record RECORD;
BEGIN
  -- Обновляем play_button_id
  UPDATE public.artists
  SET play_button_id = new_play_button_id,
      updated_at = NOW()
  WHERE id = artist_id;
  
  -- Проверяем, обновилось ли
  IF FOUND THEN
    -- Получаем обновленные данные
    SELECT id, play_button_id INTO artist_record
    FROM public.artists
    WHERE id = artist_id;
    
    -- Возвращаем обновленные данные
    result := json_build_object(
      'success', true,
      'id', artist_record.id,
      'play_button_id', artist_record.play_button_id
    );
    
    RETURN result;
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Artist not found'
    );
  END IF;
END;
$$;

-- Даем права на выполнение функции
GRANT EXECUTE ON FUNCTION public.update_artist_play_button(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.update_artist_play_button(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_artist_play_button(UUID, TEXT) TO service_role;

-- ============================================
-- 5. Проверяем результат
-- ============================================
-- Проверяем колонку
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'artists' 
AND column_name = 'play_button_id';

-- Проверяем политики
SELECT 
  policyname, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'artists'
AND cmd = 'UPDATE';

-- Проверяем функцию
SELECT 
  routine_name, 
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'update_artist_play_button';

-- ============================================
-- ВАЖНО: После выполнения этого SQL:
-- ============================================
-- 1. Перейдите в Supabase Dashboard → Settings → API
-- 2. Найдите кнопку "Reload schema" или "Refresh schema"
-- 3. Нажмите её и подождите 10-30 секунд
-- 4. Обновите страницу в браузере (F5)
-- 5. Попробуйте снова сохранить фон кнопок
-- 
-- После перезагрузки схемы:
-- - RPC функция будет доступна (не будет ошибки 404)
-- - Обычный UPDATE будет работать (не будет ошибки 400)
-- - Все будет работать без ошибок в консоли!

