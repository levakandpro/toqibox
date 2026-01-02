-- Добавление полей премиума в таблицу artists
DO $$ 
BEGIN
  -- premium_type: 'premium', 'premium_plus', или NULL
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'artists' 
    AND column_name = 'premium_type'
  ) THEN
    ALTER TABLE public.artists ADD COLUMN premium_type TEXT;
  END IF;

  -- premium_until: дата окончания премиума
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'artists' 
    AND column_name = 'premium_until'
  ) THEN
    ALTER TABLE public.artists ADD COLUMN premium_until TIMESTAMPTZ;
  END IF;

  -- verified: есть ли верификация (золотая тюбетейка)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'artists' 
    AND column_name = 'verified'
  ) THEN
    ALTER TABLE public.artists ADD COLUMN verified BOOLEAN DEFAULT false;
  END IF;

  -- name_color: цвет ника (только для премиум)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'artists' 
    AND column_name = 'name_color'
  ) THEN
    ALTER TABLE public.artists ADD COLUMN name_color TEXT;
  END IF;
END $$;

-- Индексы для быстрого поиска премиум пользователей
CREATE INDEX IF NOT EXISTS idx_artists_premium_type ON public.artists(premium_type);
CREATE INDEX IF NOT EXISTS idx_artists_premium_until ON public.artists(premium_until);
CREATE INDEX IF NOT EXISTS idx_artists_verified ON public.artists(verified);

