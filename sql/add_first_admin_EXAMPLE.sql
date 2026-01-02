-- ПРИМЕР: Как добавить первого администратора
-- 
-- ВАЖНО: Замените 'YOUR_USER_ID' на ваш реальный UUID!
-- 
-- Как получить ваш UUID:
-- 1. Войдите в приложение
-- 2. Откройте консоль браузера (F12)
-- 3. Выполните: (await supabase.auth.getSession()).data.session.user.id
-- 4. Скопируйте полученный UUID (формат: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
--
-- Затем выполните этот скрипт:

-- ============================================
-- ШАГ 1: Отключаем RLS
-- ============================================
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ШАГ 2: Добавляем первого админа
-- ============================================
-- ЗАМЕНИТЕ 'YOUR_USER_ID' на ваш реальный UUID!
-- ЗАМЕНИТЕ 'your-email@example.com' на ваш email!
INSERT INTO public.admins (user_id, email, is_active)
VALUES (
  '12345678-1234-1234-1234-123456789abc',  -- ЗАМЕНИТЕ НА ВАШ UUID!
  'admin@example.com',  -- ЗАМЕНИТЕ НА ВАШ EMAIL!
  true
)
ON CONFLICT (user_id) DO UPDATE
SET email = EXCLUDED.email,
    is_active = EXCLUDED.is_active;

-- ============================================
-- ШАГ 3: Включаем RLS обратно
-- ============================================
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ШАГ 4: Проверка (замените UUID на ваш)
-- ============================================
SELECT * FROM public.admins WHERE user_id = '12345678-1234-1234-1234-123456789abc';

