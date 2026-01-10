-- Таблица для хранения заявок на оплату подписок Studio и TOQIBOX
CREATE TABLE IF NOT EXISTS public.payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product TEXT NOT NULL, -- 'studio' или 'toqibox'
  plan TEXT NOT NULL, -- 'premium' или 'premium_plus'
  amount NUMERIC NOT NULL, -- сумма в TJS (число)
  receipt_url TEXT, -- URL загруженного чека
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES auth.users(id)
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON public.payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON public.payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_product ON public.payment_requests(product);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON public.payment_requests(created_at DESC);

-- RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Удаляем существующие политики, если они есть (для обновления)
DROP POLICY IF EXISTS "pr_select_own" ON public.payment_requests;
DROP POLICY IF EXISTS "pr_insert_own" ON public.payment_requests;
DROP POLICY IF EXISTS "pr_admin_all" ON public.payment_requests;
DROP POLICY IF EXISTS "pr_admin_select" ON public.payment_requests;
DROP POLICY IF EXISTS "pr_admin_update" ON public.payment_requests;

-- Политика: пользователь видит только свои заявки
CREATE POLICY "pr_select_own"
  ON public.payment_requests FOR SELECT
  USING (user_id = auth.uid());

-- Политика: пользователь может создавать заявки только для себя
CREATE POLICY "pr_insert_own"
  ON public.payment_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Обновляем функцию для проверки, является ли пользователь админом (по таблице admins или email)
-- Используем CREATE OR REPLACE, чтобы не удалять зависимые политики
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Проверяем по таблице admins
  IF EXISTS (
    SELECT 1 FROM public.admins
    WHERE user_id = auth.uid() AND is_active = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Fallback: проверка по email из JWT токена (levakandproduction@gmail.com)
  -- В Supabase email доступен через auth.jwt() ->> 'email'
  user_email := (auth.jwt() ->> 'email');
  IF user_email = 'levakandproduction@gmail.com' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Политика: админы могут читать все заявки (для админки)
CREATE POLICY "pr_admin_select"
  ON public.payment_requests FOR SELECT
  USING (public.is_admin());

-- Политика: админы могут обновлять заявки (подтверждение/отклонение)
CREATE POLICY "pr_admin_update"
  ON public.payment_requests FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
