-- Переименование колонки play_button_i в play_button_id
-- Выполните этот SQL в Supabase SQL Editor

-- 1. Проверяем, существует ли колонка play_button_i
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'artists' 
AND column_name IN ('play_button_i', 'play_button_id');

-- 2. Переименовываем play_button_i в play_button_id (если она существует)
DO $$ 
BEGIN
  -- Проверяем, существует ли play_button_i
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'artists' 
    AND column_name = 'play_button_i'
  ) THEN
    -- Проверяем, существует ли уже play_button_id
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'artists' 
      AND column_name = 'play_button_id'
    ) THEN
      -- Переименовываем
      ALTER TABLE public.artists RENAME COLUMN play_button_i TO play_button_id;
      RAISE NOTICE 'Колонка play_button_i переименована в play_button_id';
    ELSE
      RAISE NOTICE 'Колонка play_button_id уже существует, копируем данные из play_button_i';
      -- Копируем данные из play_button_i в play_button_id
      UPDATE public.artists 
      SET play_button_id = play_button_i 
      WHERE play_button_i IS NOT NULL 
      AND (play_button_id IS NULL OR play_button_id = '');
      -- Удаляем старую колонку
      ALTER TABLE public.artists DROP COLUMN play_button_i;
      RAISE NOTICE 'Данные скопированы, колонка play_button_i удалена';
    END IF;
  ELSE
    RAISE NOTICE 'Колонка play_button_i не найдена';
  END IF;
END $$;

-- 3. Если play_button_id все еще не существует, создаем её
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

-- 4. Проверяем результат
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'artists' 
AND column_name IN ('play_button_i', 'play_button_id');

-- 5. Проверяем данные (только play_button_id, так как play_button_i уже переименована)
SELECT 
  id, 
  play_button_id
FROM public.artists 
WHERE id = '50b8808c-f0b7-4aa2-a517-998080ea72be';

