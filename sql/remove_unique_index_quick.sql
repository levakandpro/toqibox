-- Быстрое удаление уникального индекса payment_requests_one_pending_per_product_idx
-- Просто скопируй и выполни этот SQL в Supabase SQL Editor

DROP INDEX IF EXISTS public.payment_requests_one_pending_per_product_idx;

-- Если индекс называется по-другому, сначала найди его имя:
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'payment_requests' 
--   AND schemaname = 'public'
--   AND indexdef LIKE '%UNIQUE%'
--   AND (indexdef LIKE '%pending%' OR indexdef LIKE '%product%' OR indexdef LIKE '%user_id%');

-- Затем удали его по имени:
-- DROP INDEX IF EXISTS public.НАЙДЕННОЕ_ИМЯ_ИНДЕКСА;
