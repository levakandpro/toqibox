-- Установка дефолтного фона для всех артистов, у которых page_background_id пустой
-- Выполните этот SQL в Supabase SQL Editor

-- Дефолтный фон - первый бесплатный фон ("custom-shader-1")
UPDATE public.artists
SET page_background_id = 'custom-shader-1'
WHERE page_background_id IS NULL OR page_background_id = '';

-- Проверка: посмотреть, сколько артистов получили дефолтный фон
SELECT 
  COUNT(*) as total_artists,
  COUNT(CASE WHEN page_background_id = 'custom-shader-1' THEN 1 END) as with_default_background,
  COUNT(CASE WHEN page_background_id IS NULL OR page_background_id = '' THEN 1 END) as without_background
FROM public.artists;
