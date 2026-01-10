-- Добавляем админа в таблицу admins для доступа к payment_requests
-- Замените 'YOUR_USER_ID_HERE' на ваш реальный user_id из auth.users

-- Сначала находим user_id по email
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Получаем user_id из auth.users по email
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'levakandproduction@gmail.com'
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Добавляем админа в таблицу admins, если его там еще нет
    INSERT INTO public.admins (user_id, email, is_active)
    VALUES (admin_user_id, 'levakandproduction@gmail.com', true)
    ON CONFLICT (user_id) DO UPDATE
    SET is_active = true,
        email = 'levakandproduction@gmail.com';
    
    RAISE NOTICE 'Админ добавлен/обновлен: user_id = %, email = levakandproduction@gmail.com', admin_user_id;
  ELSE
    RAISE WARNING 'Пользователь с email levakandproduction@gmail.com не найден в auth.users';
  END IF;
END $$;
