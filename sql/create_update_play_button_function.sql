-- Создание RPC функции для обновления play_button_id (обходит кэш PostgREST)
-- Выполните этот SQL в Supabase SQL Editor
-- ВАЖНО: После выполнения перезагрузите схему в Dashboard: Settings → API → Reload schema

-- Создаем функцию для обновления play_button_id
CREATE OR REPLACE FUNCTION public.update_artist_play_button(
  artist_id UUID,
  new_play_button_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Это позволяет функции обходить RLS
SET search_path = public -- Важно для безопасности
AS $$
DECLARE
  result JSON;
  artist_record RECORD;
BEGIN
  -- Обновляем play_button_id
  UPDATE public.artists
  SET play_button_id = new_play_button_id,
      updated_at = NOW()
  WHERE id = artist_id;
  
  -- Проверяем, обновилось ли
  IF FOUND THEN
    -- Получаем обновленные данные
    SELECT id, play_button_id INTO artist_record
    FROM public.artists
    WHERE id = artist_id;
    
    -- Возвращаем обновленные данные
    result := json_build_object(
      'success', true,
      'id', artist_record.id,
      'play_button_id', artist_record.play_button_id
    );
    
    RETURN result;
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Artist not found'
    );
  END IF;
END;
$$;

-- Даем права на выполнение функции
GRANT EXECUTE ON FUNCTION public.update_artist_play_button(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.update_artist_play_button(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_artist_play_button(UUID, TEXT) TO service_role;

-- Проверяем, что функция создана
SELECT 
  routine_name, 
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'update_artist_play_button';

