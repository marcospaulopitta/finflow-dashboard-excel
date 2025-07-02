-- Add missing columns to incomes table to match expenses structure
ALTER TABLE public.incomes 
ADD COLUMN IF NOT EXISTS installment_amount numeric,
ADD COLUMN IF NOT EXISTS installments integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS current_installment integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_amount numeric;