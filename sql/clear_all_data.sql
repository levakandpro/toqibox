-- Скрипт для полной очистки всех данных из базы
-- ВНИМАНИЕ: Это удалит ВСЕ данные! Используйте только для тестирования!
-- Выполните этот скрипт в Supabase SQL Editor

-- Отключаем проверку внешних ключей временно
SET session_replication_role = 'replica';

-- Удаляем данные в правильном порядке (сначала зависимые таблицы)

-- 1. Удаляем экспорты Studio
DELETE FROM exports;

-- 2. Удаляем треки (зависят от artists)
DELETE FROM tracks;

-- 3. Удаляем заявки на оплату
DELETE FROM payment_requests;

-- 4. Удаляем платежи
DELETE FROM payments;

-- 5. Удаляем артистов (зависят от users/profiles)
DELETE FROM artists;

-- 6. Сбрасываем подписки в profiles (не удаляем сами профили, чтобы не сломать auth)
UPDATE profiles SET 
  toqibox_plan = 'free',
  toqibox_plan_expires_at = NULL,
  studio_plan = 'free',
  studio_plan_expires_at = NULL,
  studio_approved_at = NULL,
  studio_approved_by = NULL,
  premium_type = NULL,
  premium_until = NULL,
  verified = false;

-- 7. Удаляем пользователей из auth (кроме админа)
-- ВНИМАНИЕ: Это удалит всех пользователей кроме тех, кто в таблице admins
-- Если нужно сохранить админа, сначала добавьте его в admins таблицу
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Получаем ID админа (если есть)
  SELECT user_id INTO admin_user_id FROM admins WHERE is_active = true LIMIT 1;
  
  -- Удаляем всех пользователей кроме админа
  IF admin_user_id IS NOT NULL THEN
    -- Удаляем из auth.users всех кроме админа
    DELETE FROM auth.users WHERE id != admin_user_id;
  ELSE
    -- Если админа нет, удаляем всех (ОСТОРОЖНО!)
    -- Раскомментируйте следующую строку, если хотите удалить ВСЕХ пользователей:
    -- DELETE FROM auth.users;
    RAISE NOTICE 'Админ не найден. Пропускаем удаление пользователей из auth.users';
  END IF;
END $$;

-- Включаем обратно проверку внешних ключей
SET session_replication_role = 'origin';

-- Проверяем результат
SELECT 
  'exports' as table_name, COUNT(*) as count FROM exports
UNION ALL
SELECT 'tracks', COUNT(*) FROM tracks
UNION ALL
SELECT 'payment_requests', COUNT(*) FROM payment_requests
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'artists', COUNT(*) FROM artists
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'auth.users', COUNT(*) FROM auth.users;
