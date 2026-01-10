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

-- Политика: пользователь видит только свои заявки
CREATE POLICY "pr_select_own"
  ON public.payment_requests FOR SELECT
  USING (user_id = auth.uid());

-- Политика: пользователь может создавать заявки только для себя
CREATE POLICY "pr_insert_own"
  ON public.payment_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Политика: админы могут все операции (SELECT, UPDATE, INSERT, DELETE)
CREATE POLICY "pr_admin_all"
  ON public.payment_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );
