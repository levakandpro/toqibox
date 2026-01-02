-- SQL функция для обновления display_name артиста
-- Выполните этот SQL в Supabase SQL Editor

-- Создаем функцию для обновления display_name
CREATE OR REPLACE FUNCTION update_artist_display_name(
  artist_id UUID,
  new_display_name TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- Это позволяет функции обходить RLS
AS $$
DECLARE
  result JSON;
BEGIN
  -- Обновляем display_name
  UPDATE artists
  SET display_name = new_display_name
  WHERE id = artist_id;
  
  -- Проверяем, обновилось ли
  IF FOUND THEN
    -- Возвращаем обновленные данные
    SELECT json_build_object(
      'success', true,
      'id', id,
      'display_name', display_name
    ) INTO result
    FROM artists
    WHERE id = artist_id;
    
    RETURN result;
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Artist not found'
    );
  END IF;
END;
$$;

-- Даем права на выполнение функции анонимным пользователям
GRANT EXECUTE ON FUNCTION update_artist_display_name(UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION update_artist_display_name(UUID, TEXT) TO authenticated;

