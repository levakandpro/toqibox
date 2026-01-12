-- Добавление RLS политики для обновления payment_requests
-- Выполните этот скрипт в Supabase SQL Editor

-- Удаляем старую политику, если она существует
DROP POLICY IF EXISTS "Anyone can update payment_requests" ON public.payment_requests;
DROP POLICY IF EXISTS "pr_admin_update" ON public.payment_requests;

-- Политика: все могут обновлять заявки на оплату (для админки)
CREATE POLICY "Anyone can update payment_requests"
  ON public.payment_requests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Также убедимся, что политика SELECT работает для всех (для админки)
DROP POLICY IF EXISTS "Anyone can select payment_requests" ON public.payment_requests;
CREATE POLICY "Anyone can select payment_requests"
  ON public.payment_requests
  FOR SELECT
  USING (true);
