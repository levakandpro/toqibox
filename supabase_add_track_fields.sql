-- Добавление недостающих полей в таблицу tracks
-- Выполните этот скрипт в Supabase SQL Editor

-- Добавляем поле play_icon (если еще не существует)
ALTER TABLE tracks 
ADD COLUMN IF NOT EXISTS play_icon TEXT DEFAULT NULL;

-- Добавляем поле preview_start_seconds (если еще не существует)
ALTER TABLE tracks 
ADD COLUMN IF NOT EXISTS preview_start_seconds INTEGER DEFAULT 0;

-- Добавляем поле shadertoy_background_id (если еще не существует)
ALTER TABLE tracks 
ADD COLUMN IF NOT EXISTS shadertoy_background_id TEXT DEFAULT NULL;

-- Проверяем, что все поля добавлены
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tracks' 
ORDER BY ordinal_position;

