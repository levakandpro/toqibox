-- Добавление RLS политики для удаления payment_requests
-- Выполните этот скрипт в Supabase SQL Editor

-- Удаляем старую политику, если она существует
DROP POLICY IF EXISTS "Anyone can delete payment_requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Admins can delete payment_requests" ON public.payment_requests;

-- Политика: все могут удалять заявки на оплату (для админки)
CREATE POLICY "Anyone can delete payment_requests"
  ON public.payment_requests
  FOR DELETE
  USING (true);

-- Альтернативный вариант: только админы могут удалять
-- Если нужна более строгая политика, закомментируйте политику выше и раскомментируйте эту:
-- CREATE POLICY "Admins can delete payment_requests"
--   ON public.payment_requests
--   FOR DELETE
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.admins
--       WHERE user_id = auth.uid() AND is_active = true
--     )
--   );
