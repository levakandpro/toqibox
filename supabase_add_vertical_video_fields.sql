-- Добавляем поля для вертикальных видео в таблицу tracks

ALTER TABLE tracks
ADD COLUMN IF NOT EXISTS shorts_link TEXT,
ADD COLUMN IF NOT EXISTS tiktok_link TEXT,
ADD COLUMN IF NOT EXISTS reels_link TEXT,
ADD COLUMN IF NOT EXISTS vertical_video_source TEXT;

-- Комментарии к полям
COMMENT ON COLUMN tracks.shorts_link IS 'Ссылка на YouTube Shorts для кнопки в шапке';
COMMENT ON COLUMN tracks.tiktok_link IS 'Ссылка на TikTok для кнопки в шапке';
COMMENT ON COLUMN tracks.reels_link IS 'Ссылка на Instagram Reels для кнопки в шапке';
COMMENT ON COLUMN tracks.vertical_video_source IS 'Тип вертикального видео: shorts, tiktok, reels или null';

