-- Добавляем колонки rejected_at и rejected_by в таблицу payment_requests
-- Если таблица была создана раньше без этих колонок

DO $$
BEGIN
  -- Добавляем rejected_at, если её нет
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payment_requests' 
    AND column_name = 'rejected_at'
  ) THEN
    ALTER TABLE public.payment_requests ADD COLUMN rejected_at TIMESTAMPTZ;
    RAISE NOTICE 'Колонка rejected_at добавлена';
  ELSE
    RAISE NOTICE 'Колонка rejected_at уже существует';
  END IF;

  -- Добавляем rejected_by, если её нет
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'payment_requests' 
    AND column_name = 'rejected_by'
  ) THEN
    ALTER TABLE public.payment_requests ADD COLUMN rejected_by UUID REFERENCES auth.users(id);
    RAISE NOTICE 'Колонка rejected_by добавлена';
  ELSE
    RAISE NOTICE 'Колонка rejected_by уже существует';
  END IF;
END $$;
