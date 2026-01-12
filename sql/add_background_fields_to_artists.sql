-- Добавление полей для фонов страницы артиста
-- Выполните этот SQL в Supabase SQL Editor

-- Добавляем поля для фонов (если их нет)
DO $$ 
BEGIN
  -- page_background_id: фон для шапки (видео/шейдер фоны)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'artists' 
    AND column_name = 'page_background_id'
  ) THEN
    ALTER TABLE public.artists ADD COLUMN page_background_id TEXT;
    RAISE NOTICE '✅ Колонка page_background_id создана';
  ELSE
    RAISE NOTICE 'ℹ️ Колонка page_background_id уже существует';
  END IF;

  -- page_background_left_id: фон для контента (фото фоны)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'artists' 
    AND column_name = 'page_background_left_id'
  ) THEN
    ALTER TABLE public.artists ADD COLUMN page_background_left_id TEXT;
    RAISE NOTICE '✅ Колонка page_background_left_id создана';
  ELSE
    RAISE NOTICE 'ℹ️ Колонка page_background_left_id уже существует';
  END IF;
END $$;

-- Проверка: посмотреть все поля таблицы artists
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'artists' 
AND column_name IN ('page_background_id', 'page_background_left_id', 'play_button_id')
ORDER BY ordinal_position;
