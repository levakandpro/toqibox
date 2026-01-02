-- Создаем запись в artists, если её нет
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

