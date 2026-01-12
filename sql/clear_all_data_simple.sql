-- Упрощенный скрипт для полной очистки всех данных
-- ВНИМАНИЕ: Это удалит ВСЕ данные! Используйте только для тестирования!
-- Выполните этот скрипт в Supabase SQL Editor

-- Удаляем данные в правильном порядке

-- 1. Экспорты Studio
DELETE FROM exports;

-- 2. Треки
DELETE FROM tracks;

-- 3. Заявки на оплату
DELETE FROM payment_requests;

-- 4. Платежи
DELETE FROM payments;

-- 5. Артисты
DELETE FROM artists;

-- 6. Сбрасываем подписки в profiles (не удаляем профили)
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

-- 7. Удаляем всех пользователей из auth.users (кроме админа, если он есть)
-- ВНИМАНИЕ: Это удалит всех пользователей!
-- Если нужно сохранить админа, сначала убедитесь что он в таблице admins
DELETE FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM admins WHERE is_active = true);

-- Проверка: сколько записей осталось
SELECT 
  'exports' as таблица, COUNT(*) as количество FROM exports
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
