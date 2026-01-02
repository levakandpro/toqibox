-- Исправление проблемы с play_button_id
-- Выполните этот SQL в Supabase SQL Editor

-- 1. Проверяем, существует ли поле play_button_id в таблице artists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'artists' 
AND column_name = 'play_button_id';

-- 2. Если поля нет - добавляем его
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'artists' 
    AND column_name = 'play_button_id'
  ) THEN
    ALTER TABLE public.artists ADD COLUMN play_button_id TEXT;
    RAISE NOTICE 'Поле play_button_id добавлено';
  ELSE
    RAISE NOTICE 'Поле play_button_id уже существует';
  END IF;
END $$;

-- 3. Проверяем, существует ли запись с таким id
SELECT id, slug, display_name, play_button_id
FROM public.artists 
WHERE id = '50b8808c-f0b7-4aa2-a517-998080ea72be';

-- 4. Если записи нет - создаем её
INSERT INTO public.artists (id, user_id, slug, display_name, header_start_sec, page_background_id, play_button_id)
VALUES (
  '50b8808c-f0b7-4aa2-a517-998080ea72be',
  '50b8808c-f0b7-4aa2-a517-998080ea72be',
  'artist-50b8808c',
  'Artist',
  0,
  (SELECT page_background_id FROM public.profiles WHERE id = '50b8808c-f0b7-4aa2-a517-998080ea72be' LIMIT 1),
  (SELECT play_button_id FROM public.profiles WHERE id = '50b8808c-f0b7-4aa2-a517-998080ea72be' LIMIT 1)
)
ON CONFLICT (id) DO UPDATE
SET 
  page_background_id = COALESCE(EXCLUDED.page_background_id, artists.page_background_id),
  play_button_id = COALESCE(EXCLUDED.play_button_id, artists.play_button_id);

-- 5. Исправляем политику UPDATE - добавляем WITH CHECK
DROP POLICY IF EXISTS "Allow update for development" ON public.artists;

CREATE POLICY "Allow update for development"
  ON public.artists FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 6. Проверяем политики RLS для UPDATE (должен быть with_check = true)
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'artists'
AND cmd = 'UPDATE';

