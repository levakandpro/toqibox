-- ПОЛНЫЙ скрипт для настройки ВСЕХ RLS политик
-- Выполните этот скрипт в Supabase SQL Editor
-- Этот скрипт гарантирует, что все операции работают для админки

-- ============================================
-- 1. PAYMENT_REQUESTS - все политики
-- ============================================
DROP POLICY IF EXISTS "pr_select_own" ON public.payment_requests;
DROP POLICY IF EXISTS "pr_insert_own" ON public.payment_requests;
DROP POLICY IF EXISTS "pr_admin_all" ON public.payment_requests;
DROP POLICY IF EXISTS "pr_admin_select" ON public.payment_requests;
DROP POLICY IF EXISTS "pr_admin_update" ON public.payment_requests;
DROP POLICY IF EXISTS "Anyone can select payment_requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Anyone can insert payment_requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Anyone can update payment_requests" ON public.payment_requests;
DROP POLICY IF EXISTS "Anyone can delete payment_requests" ON public.payment_requests;

CREATE POLICY "Anyone can select payment_requests" ON public.payment_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert payment_requests" ON public.payment_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update payment_requests" ON public.payment_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete payment_requests" ON public.payment_requests FOR DELETE USING (true);

-- ============================================
-- 2. PAYMENTS - проверяем политики
-- ============================================
-- Политики уже должны быть в create_payments_table.sql, но проверим
DROP POLICY IF EXISTS "Anyone can read payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can insert payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can update payments" ON public.payments;
DROP POLICY IF EXISTS "Anyone can delete payments" ON public.payments;

CREATE POLICY "Anyone can read payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update payments" ON public.payments FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete payments" ON public.payments FOR DELETE USING (true);

-- ============================================
-- 3. PROFILES - добавляем политики для обновления подписок
-- ============================================
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can select profiles" ON public.profiles;

CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can update profiles" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================
-- 4. ARTISTS - проверяем политики
-- ============================================
DROP POLICY IF EXISTS "Anyone can read artists" ON public.artists;
DROP POLICY IF EXISTS "Anyone can update artists" ON public.artists;
DROP POLICY IF EXISTS "Anyone can delete artists" ON public.artists;

CREATE POLICY "Anyone can read artists" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Anyone can update artists" ON public.artists FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete artists" ON public.artists FOR DELETE USING (true);

-- ============================================
-- 5. TRACKS - проверяем политики
-- ============================================
DROP POLICY IF EXISTS "Anyone can read tracks" ON public.tracks;
DROP POLICY IF EXISTS "Anyone can update tracks" ON public.tracks;
DROP POLICY IF EXISTS "Anyone can delete tracks" ON public.tracks;
DROP POLICY IF EXISTS "Allow update for development" ON public.tracks;
DROP POLICY IF EXISTS "Allow delete for development" ON public.tracks;

CREATE POLICY "Anyone can read tracks" ON public.tracks FOR SELECT USING (true);
CREATE POLICY "Anyone can update tracks" ON public.tracks FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete tracks" ON public.tracks FOR DELETE USING (true);

-- ============================================
-- 6. EXPORTS - проверяем политики
-- ============================================
DROP POLICY IF EXISTS "Anyone can read exports" ON public.exports;
DROP POLICY IF EXISTS "Anyone can select exports" ON public.exports;

CREATE POLICY "Anyone can read exports" ON public.exports FOR SELECT USING (true);

-- ============================================
-- Проверка: показываем все политики
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE tablename IN ('payment_requests', 'payments', 'profiles', 'artists', 'tracks', 'exports')
ORDER BY tablename, cmd, policyname;
