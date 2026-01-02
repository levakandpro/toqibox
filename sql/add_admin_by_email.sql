-- Добавление администратора по email
-- Этот скрипт найдет пользователя по email и добавит его в админы

-- ВАРИАНТ 1: Если пользователь уже существует в auth.users
-- Временно отключаем RLS
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Добавляем админа по email (находим user_id из auth.users)
INSERT INTO public.admins (user_id, email, is_active)
SELECT 
  id as user_id,
  email,
  true as is_active
FROM auth.users
WHERE email = 'levakandproduction@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET email = EXCLUDED.email,
    is_active = EXCLUDED.is_active;

-- Включаем RLS обратно
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Проверка
SELECT * FROM public.admins WHERE email = 'levakandproduction@gmail.com';

