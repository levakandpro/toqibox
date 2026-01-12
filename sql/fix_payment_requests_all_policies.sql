-- ПОЛНЫЙ скрипт для настройки всех RLS политик для payment_requests
-- Выполните этот скрипт в Supabase SQL Editor
-- Этот скрипт гарантирует, что все операции (SELECT, INSERT, UPDATE, DELETE) работают

-- Удаляем ВСЕ старые политики
DROP POLICY IF EXISTS "pr_select_own" ON public.payment_requests;
DROP POLICY IF EXISTS "pr_insert_own" ON public.payment_requests;
DROP POLICY IF EXISTS "pr_admin_all" ON public.payment_requests;
DROP POLICY IF EXISTS "pr_admin_select" ON public.payment_requests;
DROP POLICY IF EXISTS "pr_admin_update" ON public.payment_requests;
DROP POLICY IF EXISTS "Anyone can select payment_requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Anyone can insert payment_requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Anyone can update payment_requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Anyone can delete payment_requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Admins can delete payment_requests" ON public.payment_requests;

-- 1. SELECT - все могут читать заявки (для админки)
CREATE POLICY "Anyone can select payment_requests"
  ON public.payment_requests
  FOR SELECT
  USING (true);

-- 2. INSERT - все могут создавать заявки (для формы оплаты)
CREATE POLICY "Anyone can insert payment_requests"
  ON public.payment_requests
  FOR INSERT
  WITH CHECK (true);

-- 3. UPDATE - все могут обновлять заявки (для админки: одобрение/отклонение)
CREATE POLICY "Anyone can update payment_requests"
  ON public.payment_requests
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 4. DELETE - все могут удалять заявки (для админки)
CREATE POLICY "Anyone can delete payment_requests"
  ON public.payment_requests
  FOR DELETE
  USING (true);

-- Проверка: показываем все политики для payment_requests
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'payment_requests'
ORDER BY policyname;
