-- SQL запрос для добавления поля play_icon в таблицу tracks
-- Скопируйте и выполните этот запрос в SQL Editor в Supabase

ALTER TABLE tracks 
ADD COLUMN IF NOT EXISTS play_icon TEXT DEFAULT NULL;

