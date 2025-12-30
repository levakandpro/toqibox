-- Упрощенный скрипт для создания таблицы tracks
-- Выполните этот скрипт в Supabase SQL Editor

-- Удаляем таблицу, если она существует (ОСТОРОЖНО: это удалит все данные!)
DROP TABLE IF EXISTS tracks CASCADE;

-- Создаем таблицу tracks заново
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'youtube',
  link TEXT NOT NULL,
  cover_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_tracks_artist_id ON tracks(artist_id);
CREATE INDEX idx_tracks_slug ON tracks(slug);
CREATE INDEX idx_tracks_created_at ON tracks(created_at DESC);

-- RLS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Политики RLS для dev режима
-- ВНИМАНИЕ: Эти политики разрешают всем читать/вставлять/обновлять/удалять треки!
-- Используйте только для разработки! Для продакшена нужны более строгие политики.

-- Политика для чтения: все могут читать треки
CREATE POLICY "Anyone can read tracks"
  ON tracks FOR SELECT
  USING (true);

-- Политика для вставки: все могут вставлять треки (для dev режима)
CREATE POLICY "Allow insert for development"
  ON tracks FOR INSERT
  WITH CHECK (true);

-- Политика для обновления: все могут обновлять треки (для dev режима)
CREATE POLICY "Allow update for development"
  ON tracks FOR UPDATE
  USING (true);

-- Политика для удаления: все могут удалять треки (для dev режима)
CREATE POLICY "Allow delete for development"
  ON tracks FOR DELETE
  USING (true);

-- Функция для updated_at
CREATE OR REPLACE FUNCTION update_tracks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер
CREATE TRIGGER tracks_updated_at
  BEFORE UPDATE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_tracks_updated_at();

