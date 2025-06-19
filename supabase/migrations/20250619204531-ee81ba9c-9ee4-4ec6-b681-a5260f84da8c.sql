
-- Criar tabela com as principais bandeiras de cartão do Brasil
CREATE TABLE IF NOT EXISTS public.card_brands (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir as 10 principais bandeiras do Brasil (apenas se não existirem)
INSERT INTO public.card_brands (id, name, display_name) VALUES
(1, 'visa', 'Visa'),
(2, 'mastercard', 'Mastercard'),
(3, 'elo', 'Elo'),
(4, 'american_express', 'American Express'),
(5, 'hipercard', 'Hipercard'),
(6, 'diners', 'Diners Club'),
(7, 'discover', 'Discover'),
(8, 'aura', 'Aura'),
(9, 'sorocred', 'Sorocred'),
(10, 'cabal', 'Cabal')
ON CONFLICT (id) DO NOTHING;

-- Adicionar coluna brand_id na tabela credit_cards (apenas se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'credit_cards' AND column_name = 'brand_id'
  ) THEN
    ALTER TABLE public.credit_cards ADD COLUMN brand_id INTEGER REFERENCES public.card_brands(id);
  END IF;
END $$;

-- Converter dados existentes (se houver) da coluna bank_name para brand_id
UPDATE public.credit_cards 
SET brand_id = CASE 
  WHEN LOWER(bank_name) LIKE '%visa%' THEN 1
  WHEN LOWER(bank_name) LIKE '%master%' THEN 2
  WHEN LOWER(bank_name) LIKE '%elo%' THEN 3
  WHEN LOWER(bank_name) LIKE '%american%' OR LOWER(bank_name) LIKE '%amex%' THEN 4
  WHEN LOWER(bank_name) LIKE '%hiper%' THEN 5
  WHEN LOWER(bank_name) LIKE '%diners%' THEN 6
  ELSE 1 -- Default para Visa
END
WHERE brand_id IS NULL;

-- Criar RLS policies para card_brands (tabela pública para leitura)
ALTER TABLE public.card_brands ENABLE ROW LEVEL SECURITY;

-- Remover policy existente se existir e recriar
DROP POLICY IF EXISTS "Anyone can view card brands" ON public.card_brands;
CREATE POLICY "Anyone can view card brands" 
  ON public.card_brands 
  FOR SELECT 
  USING (true);

-- Adicionar RLS policies para credit_cards (apenas se não existirem)
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

-- Remover policies existentes se existirem e recriar
DROP POLICY IF EXISTS "Users can view their own credit cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Users can create their own credit cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Users can update their own credit cards" ON public.credit_cards;
DROP POLICY IF EXISTS "Users can delete their own credit cards" ON public.credit_cards;

CREATE POLICY "Users can view their own credit cards" 
  ON public.credit_cards 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credit cards" 
  ON public.credit_cards 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit cards" 
  ON public.credit_cards 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credit cards" 
  ON public.credit_cards 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Adicionar comentário na coluna brand_id
COMMENT ON COLUMN public.credit_cards.brand_id IS 
'ID da bandeira do cartão - referencia card_brands.id';
