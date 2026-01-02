-- Таблица для хранения платежей и скринов
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT,
  plan TEXT NOT NULL, -- 'PREMIUM' или 'PREMIUM+'
  amount TEXT NOT NULL, -- сумма в TJS
  screenshot_url TEXT, -- URL скрина чека
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID -- ID админа, который подтвердил
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at DESC);

-- RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать (для админки)
CREATE POLICY "Anyone can read payments"
  ON public.payments FOR SELECT
  USING (true);

-- Политика: все могут вставлять (для формы оплаты)
CREATE POLICY "Anyone can insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (true);

-- Политика: все могут обновлять (для админки)
CREATE POLICY "Anyone can update payments"
  ON public.payments FOR UPDATE
  USING (true)
  WITH CHECK (true);

