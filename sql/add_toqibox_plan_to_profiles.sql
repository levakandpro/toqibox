-- Добавление полей toqibox_plan в таблицу profiles
-- Выполните этот SQL в Supabase SQL Editor

DO $$ 
BEGIN
  -- toqibox_plan: 'free', 'premium', 'premium_plus'
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'toqibox_plan'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN toqibox_plan TEXT DEFAULT 'free';
  END IF;

  -- toqibox_plan_expires_at: дата окончания плана TOQIBOX
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'toqibox_plan_expires_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN toqibox_plan_expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_profiles_toqibox_plan ON public.profiles(toqibox_plan);
CREATE INDEX IF NOT EXISTS idx_profiles_toqibox_plan_expires_at ON public.profiles(toqibox_plan_expires_at);
