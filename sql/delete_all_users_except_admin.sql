-- УДАЛЕНИЕ ВСЕХ ПОЛЬЗОВАТЕЛЕЙ КРОМЕ АДМИНА
-- ⚠️ ВНИМАНИЕ: Этот скрипт удалит ВСЕХ пользователей кроме админа levakandproduction@gmail.com
-- ⚠️ ВНИМАНИЕ: Это действие НЕОБРАТИМО! Все данные пользователей будут удалены!
-- ⚠️ ВАЖНО: Удаление из auth.users может требовать прав суперпользователя
--    Если не работает - удалите пользователей через Supabase Dashboard → Authentication → Users

-- Админ email
-- Админ user_id из таблицы admins: 50ba3a67-d9fd-4b91-9124-02c3cc8f13dc

-- ШАГ 1: Проверяем, сколько пользователей есть
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE email = 'levakandproduction@gmail.com') as admin_count,
  COUNT(*) FILTER (WHERE email != 'levakandproduction@gmail.com') as users_to_delete
FROM auth.users;

-- ШАГ 2: Показываем пользователей, которые будут удалены (для проверки)
SELECT 
  id,
  email,
  created_at,
  '❌ Будет удален' as status
FROM auth.users
WHERE email != 'levakandproduction@gmail.com'
ORDER BY created_at DESC;

-- ШАГ 3: Удаляем все данные, связанные с пользователями (кроме админа)
-- Находим админа по email
DO $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'levakandproduction@gmail.com';
  deleted_count INTEGER;
BEGIN
  -- Получаем user_id админа по email
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = admin_email;
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'Админ с email % не найден! Прекращаю выполнение.', admin_email;
  END IF;
  
  RAISE NOTICE 'Найден админ: user_id = %, email = %', admin_user_id, admin_email;
  
  -- Удаляем из payment_requests
  DELETE FROM public.payment_requests WHERE user_id != admin_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Удалено заявок на оплату: %', deleted_count;
  
  -- Удаляем из profiles
  DELETE FROM public.profiles WHERE id != admin_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Удалено профилей: %', deleted_count;
  
  -- Удаляем из artists
  DELETE FROM public.artists WHERE user_id != admin_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Удалено артистов: %', deleted_count;
  
  -- Удаляем из exports
  DELETE FROM public.exports WHERE user_id != admin_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Удалено экспортов: %', deleted_count;
  
  -- Удаляем из usage_daily
  DELETE FROM public.usage_daily WHERE user_id != admin_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RAISE NOTICE 'Удалено записей usage_daily: %', deleted_count;
  
  RAISE NOTICE '✅ Все связанные данные удалены (кроме админа)';
  
END $$;

-- ШАГ 4: Удаляем пользователей из auth.users (кроме админа)
-- ⚠️ ВНИМАНИЕ: Это может не сработать из-за ограничений доступа к auth.users
-- Если ошибка - удалите вручную через Supabase Dashboard → Authentication → Users

-- Вариант 1: Прямое удаление (может не сработать из-за прав)
-- DELETE FROM auth.users WHERE email != 'levakandproduction@gmail.com';

-- Вариант 2: Через Supabase Auth API (рекомендуется)
-- Используйте Supabase Dashboard → Authentication → Users
-- Или Supabase CLI: supabase auth delete-user <user_id>

-- Для ручного удаления через Dashboard:
-- 1. Откройте Supabase Dashboard → Authentication → Users
-- 2. Найдите всех пользователей кроме levakandproduction@gmail.com
-- 3. Нажмите на каждого и выберите "Delete user"
-- 4. Или используйте массовое удаление через SQL Editor с правами суперпользователя

-- ШАГ 5: Финальная проверка
SELECT 
  id,
  email,
  created_at,
  CASE 
    WHEN email = 'levakandproduction@gmail.com' THEN '✅ АДМИН (сохранен)'
    ELSE '⚠️ Еще не удален'
  END as status
FROM auth.users
ORDER BY created_at DESC;

-- Если после выполнения скрипта остались пользователи (кроме админа):
-- Удалите их вручную через Supabase Dashboard → Authentication → Users
