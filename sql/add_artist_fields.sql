-- ============================================
-- ВАЖНО: Сначала найдите правильное имя таблицы!
-- ============================================
-- Выполните запросы из файла find_artists_table.sql
-- чтобы найти таблицу с данными артистов
-- 
-- После того как найдете правильное имя таблицы,
-- замените "YOUR_TABLE_NAME" на реальное имя ниже
-- ============================================

-- ============================================
-- ВАРИАНТ 1: Если таблица называется "profiles"
-- ============================================
-- Выполните эти простые запросы:
-- ALTER TABLE profiles ADD COLUMN page_background_id TEXT;
-- ALTER TABLE profiles ADD COLUMN play_button_id TEXT;

-- ============================================
-- ВАРИАНТ 2: Если нужно создать таблицу "artists"
-- ============================================
-- Сначала создайте таблицу (если её нет):
-- CREATE TABLE IF NOT EXISTS artists (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID,
--   slug TEXT NOT NULL UNIQUE,
--   display_name TEXT,
--   page_background_id TEXT,
--   play_button_id TEXT,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   updated_at TIMESTAMPTZ DEFAULT NOW()
-- );

-- ============================================
-- ВАРИАНТ 3: Универсальный (замените имя таблицы)
-- ============================================
-- После того как узнаете имя таблицы, замените YOUR_TABLE_NAME ниже
-- и выполните этот блок:

DO $$ 
DECLARE
  table_name_var TEXT := 'profiles'; -- ИЗМЕНИТЕ НА ПРАВИЛЬНОЕ ИМЯ! (profiles, authors, или artists)
BEGIN
  -- Добавляем поле для фона страницы артиста
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = table_name_var
    AND column_name = 'page_background_id'
  ) THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN page_background_id TEXT', table_name_var);
    RAISE NOTICE 'Поле page_background_id добавлено в таблицу %', table_name_var;
  ELSE
    RAISE NOTICE 'Поле page_background_id уже существует';
  END IF;

  -- Добавляем поле для кнопки плеера
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = table_name_var
    AND column_name = 'play_button_id'
  ) THEN
    EXECUTE format('ALTER TABLE %I ADD COLUMN play_button_id TEXT', table_name_var);
    RAISE NOTICE 'Поле play_button_id добавлено в таблицу %', table_name_var;
  ELSE
    RAISE NOTICE 'Поле play_button_id уже существует';
  END IF;
END $$;

-- Проверка: посмотреть все поля таблицы artists
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'artists' 
-- ORDER BY ordinal_position;

-- ============================================
-- АЛЬТЕРНАТИВА: Простые запросы (если знаете имя таблицы)
-- ============================================
-- Если вы знаете имя таблицы (например, "authors"), 
-- выполните эти простые запросы:

-- ALTER TABLE authors ADD COLUMN page_background_id TEXT;
-- ALTER TABLE authors ADD COLUMN play_button_id TEXT;

-- Или если таблица называется "profiles":
-- ALTER TABLE profiles ADD COLUMN page_background_id TEXT;
-- ALTER TABLE profiles ADD COLUMN play_button_id TEXT;

