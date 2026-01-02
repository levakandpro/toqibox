-- Создание таблицы artists (если её нет)
-- Выполните этот SQL в Supabase SQL Editor

-- Создаем таблицу artists (если её нет)
CREATE TABLE IF NOT EXISTS public.artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT,
  header_start_sec INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Добавляем поля для кастомизации (если их нет)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'artists' 
    AND column_name = 'page_background_id'
  ) THEN
    ALTER TABLE public.artists ADD COLUMN page_background_id TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'artists' 
    AND column_name = 'play_button_id'
  ) THEN
    ALTER TABLE public.artists ADD COLUMN play_button_id TEXT;
  END IF;
END $$;

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_artists_user_id ON public.artists(user_id);
CREATE INDEX IF NOT EXISTS idx_artists_slug ON public.artists(slug);

-- Включаем RLS (Row Level Security)
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;

-- Политики RLS (для разработки - разрешаем всем)
-- ВНИМАНИЕ: Для продакшена нужны более строгие политики!

-- Политика для чтения: все могут читать
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'artists' 
    AND policyname = 'Anyone can read artists'
  ) THEN
    CREATE POLICY "Anyone can read artists"
      ON public.artists FOR SELECT
      USING (true);
  END IF;
END $$;

-- Политика для вставки: все могут вставлять (для dev)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'artists' 
    AND policyname = 'Allow insert for development'
  ) THEN
    CREATE POLICY "Allow insert for development"
      ON public.artists FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- Политика для обновления: все могут обновлять (для dev)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'artists' 
    AND policyname = 'Allow update for development'
  ) THEN
    CREATE POLICY "Allow update for development"
      ON public.artists FOR UPDATE
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Политика для удаления: все могут удалять (для dev)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'artists' 
    AND policyname = 'Allow delete for development'
  ) THEN
    CREATE POLICY "Allow delete for development"
      ON public.artists FOR DELETE
      USING (true);
  END IF;
END $$;

