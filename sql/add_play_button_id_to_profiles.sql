-- Добавление поля play_button_id в таблицу profiles
-- Выполните этот SQL в Supabase SQL Editor

-- Проверяем и добавляем play_button_id, если его нет
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'play_button_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN play_button_id TEXT;
    RAISE NOTICE 'Поле play_button_id добавлено в таблицу profiles';
  ELSE
    RAISE NOTICE 'Поле play_button_id уже существует в таблице profiles';
  END IF;
END $$;

-- Проверка: посмотреть все поля таблицы profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND column_name IN ('page_background_id', 'play_button_id')
ORDER BY ordinal_position;

