-- Таблица tracks для хранения треков артистов
-- Если таблица уже существует, сначала удаляем её (осторожно! это удалит все данные)
-- DROP TABLE IF EXISTS tracks CASCADE;

-- Создаем таблицу tracks
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'youtube', -- 'youtube', 'tiktok', 'instagram'
  link TEXT NOT NULL, -- Полная ссылка на видео
  cover_key TEXT, -- Ключ обложки в R2 (опционально, для кастомных обложек)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Добавляем поле link, если его нет (для существующих таблиц)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tracks' AND column_name = 'link'
  ) THEN
    ALTER TABLE tracks ADD COLUMN link TEXT;
  END IF;
END $$;

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_tracks_slug ON tracks(slug);
CREATE INDEX IF NOT EXISTS idx_tracks_created_at ON tracks(created_at DESC);

-- RLS (Row Level Security) политики
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать треки
CREATE POLICY "Anyone can read tracks"
  ON tracks FOR SELECT
  USING (true);

-- Политика: только владелец артиста может создавать треки
-- В dev режиме разрешаем вставку для всех (если нужно, можно убрать эту политику)
CREATE POLICY "Artists can insert their own tracks"
  ON tracks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM artists
      WHERE artists.id = tracks.artist_id
      AND (artists.user_id = auth.uid() OR auth.uid() IS NULL)
    )
  );

-- Дополнительная политика для dev режима (разрешает вставку без проверки auth)
-- ВНИМАНИЕ: Эта политика разрешает вставку всем! Используйте только для разработки!
-- Для продакшена удалите эту политику и оставьте только "Artists can insert their own tracks"
CREATE POLICY "Allow insert for development"
  ON tracks FOR INSERT
  WITH CHECK (true);

-- Политика: только владелец артиста может обновлять свои треки
CREATE POLICY "Artists can update their own tracks"
  ON tracks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM artists
      WHERE artists.id = tracks.artist_id
      AND artists.user_id = auth.uid()
    )
  );

-- Политика: только владелец артиста может удалять свои треки
CREATE POLICY "Artists can delete their own tracks"
  ON tracks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM artists
      WHERE artists.id = tracks.artist_id
      AND artists.user_id = auth.uid()
    )
  );

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_tracks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER tracks_updated_at
  BEFORE UPDATE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_tracks_updated_at();

