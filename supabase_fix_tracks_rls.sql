-- Исправление RLS политик для таблицы tracks
-- Выполните этот скрипт в Supabase SQL Editor

-- Удаляем ВСЕ старые политики, если они существуют
DROP POLICY IF EXISTS "Anyone can read tracks" ON tracks;
DROP POLICY IF EXISTS "Artists can insert their own tracks" ON tracks;
DROP POLICY IF EXISTS "Allow insert for development" ON tracks;
DROP POLICY IF EXISTS "Artists can update their own tracks" ON tracks;
DROP POLICY IF EXISTS "Allow update for development" ON tracks;
DROP POLICY IF EXISTS "Artists can delete their own tracks" ON tracks;
DROP POLICY IF EXISTS "Allow delete for development" ON tracks;

-- Создаем новые политики для dev режима
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

