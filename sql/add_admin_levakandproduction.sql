-- Добавление администратора для levakandproduction@gmail.com
-- User ID: 50ba3a67-d9fd-4b91-9124-02c3cc8f13dc

-- Временно отключаем RLS
ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;

-- Добавляем админа
INSERT INTO public.admins (user_id, email, is_active)
VALUES (
  '50ba3a67-d9fd-4b91-9124-02c3cc8f13dc',
  'levakandproduction@gmail.com',
  true
)
ON CONFLICT (user_id) DO UPDATE
SET email = EXCLUDED.email,
    is_active = EXCLUDED.is_active;

-- Включаем RLS обратно
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Проверка
SELECT * FROM public.admins WHERE user_id = '50ba3a67-d9fd-4b91-9124-02c3cc8f13dc';

