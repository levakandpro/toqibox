-- Скрипт для добавления первого администратора
-- 
-- ВАЖНО: Этот скрипт нужно выполнить ПОСЛЕ создания таблицы admins
-- 
-- ПРОБЛЕМА: RLS политики требуют, чтобы пользователь уже был админом,
-- чтобы добавить нового админа. Поэтому для первого админа есть 3 способа:

-- ============================================
-- ВАРИАНТ 1: Временно отключить RLS (РЕКОМЕНДУЕТСЯ)
-- ============================================
-- 
-- ВАЖНО: Перед выполнением замените 'YOUR_USER_ID' на ваш реальный UUID!
-- 
-- Как получить ваш UUID:
-- 1. Войдите в приложение
-- 2. Откройте консоль браузера (F12)
-- 3. Выполните: (await supabase.auth.getSession()).data.session.user.id
-- 4. Скопируйте полученный UUID (формат: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
--
-- Затем выполните эти команды в Supabase SQL Editor:

-- ШАГ 1: Отключаем RLS
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- ШАГ 2: Добавляем первого админа
-- ⚠️ ОБЯЗАТЕЛЬНО ЗАМЕНИТЕ 'YOUR_USER_ID' НА ВАШ РЕАЛЬНЫЙ UUID!
-- ⚠️ ОБЯЗАТЕЛЬНО ЗАМЕНИТЕ 'your-email@example.com' НА ВАШ EMAIL!
INSERT INTO public.admins (user_id, email, is_active)
VALUES (
  'YOUR_USER_ID',  -- ⚠️ ЗАМЕНИТЕ НА ВАШ UUID! (формат: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
  'your-email@example.com',  -- ⚠️ ЗАМЕНИТЕ НА ВАШ EMAIL!
  true
)
ON CONFLICT (user_id) DO UPDATE
SET email = EXCLUDED.email,
    is_active = EXCLUDED.is_active;

-- ШАГ 3: Включаем RLS обратно
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- ШАГ 4: Проверка (замените UUID на ваш)
-- SELECT * FROM public.admins WHERE user_id = 'YOUR_USER_ID';

-- ============================================
-- ВАРИАНТ 2: Использовать Supabase Dashboard (САМЫЙ ПРОСТОЙ)
-- ============================================
-- 1. Откройте Supabase Dashboard → Table Editor → admins
-- 2. Нажмите "Insert row" (кнопка справа вверху)
-- 3. Заполните поля:
--    - user_id: YOUR_USER_ID (UUID) - вставьте ваш UUID
--    - email: your-email@example.com - вставьте ваш email
--    - is_active: true (поставьте галочку)
-- 4. Нажмите "Save"
--
-- Dashboard обходит RLS политики, поэтому это самый простой способ!

-- ============================================
-- ВАРИАНТ 3: Использовать сервисный ключ
-- ============================================
-- Если у вас есть service_role key, можно использовать его через API
-- (не рекомендуется для обычных случаев)

