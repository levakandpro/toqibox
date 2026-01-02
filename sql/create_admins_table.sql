-- Таблица для хранения администраторов
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON public.admins(user_id);
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);

-- RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Политика: только админы могут читать список админов
CREATE POLICY "Admins can read admins"
  ON public.admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Политика: только админы могут вставлять новых админов
-- ВАЖНО: Для добавления первого админа используйте Supabase Dashboard или временно отключите RLS
CREATE POLICY "Admins can insert admins"
  ON public.admins FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Политика: только админы могут обновлять админов
CREATE POLICY "Admins can update admins"
  ON public.admins FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Политика: только админы могут удалять админов
CREATE POLICY "Admins can delete admins"
  ON public.admins FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Функция для проверки, является ли пользователь админом
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = user_uuid AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ВАЖНО: Для добавления первого администратора нужно временно отключить RLS
-- или использовать сервисный ключ. После добавления первого админа политики заработают.
-- 
-- ВАРИАНТ 1: Временно отключить RLS для добавления первого админа
-- ALTER TABLE public.admins DISABLE ROW LEVEL SECURITY;
-- -- Затем добавьте первого админа через INSERT
-- -- Затем снова включите RLS:
-- ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
--
-- ВАРИАНТ 2: Использовать Supabase Dashboard → Table Editor → Insert row
-- (Dashboard обходит RLS политики)

-- Комментарии
COMMENT ON TABLE public.admins IS 'Таблица администраторов системы';
COMMENT ON COLUMN public.admins.user_id IS 'ID пользователя из auth.users';
COMMENT ON COLUMN public.admins.email IS 'Email администратора';
COMMENT ON COLUMN public.admins.is_active IS 'Активен ли администратор';

