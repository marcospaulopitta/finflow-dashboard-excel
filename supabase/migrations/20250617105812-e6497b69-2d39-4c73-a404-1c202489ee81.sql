
-- Criar tabela de categorias
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#8b5cf6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de contas bancárias
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('current', 'savings', 'salary')),
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de cartões de crédito
CREATE TABLE public.credit_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  limit_amount DECIMAL(10,2) NOT NULL,
  current_balance DECIMAL(10,2) DEFAULT 0.00,
  due_date INTEGER NOT NULL CHECK (due_date >= 1 AND due_date <= 31),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de receitas
CREATE TABLE public.incomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  account_id UUID REFERENCES public.bank_accounts(id),
  category_id UUID REFERENCES public.categories(id),
  recurrence TEXT DEFAULT 'Única' CHECK (recurrence IN ('Única', 'Semanal', 'Quinzenal', 'Mensal', 'Anual')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de despesas
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  account_id UUID REFERENCES public.bank_accounts(id),
  credit_card_id UUID REFERENCES public.credit_cards(id),
  category_id UUID REFERENCES public.categories(id),
  recurrence TEXT DEFAULT 'Única' CHECK (recurrence IN ('Única', 'Semanal', 'Quinzenal', 'Mensal', 'Anual')),
  installments INTEGER DEFAULT 1,
  current_installment INTEGER DEFAULT 1,
  installment_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2),
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP WITH TIME ZONE,
  is_postponed BOOLEAN DEFAULT FALSE,
  original_due_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categories
CREATE POLICY "Users can view their own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para bank_accounts
CREATE POLICY "Users can view their own bank accounts" ON public.bank_accounts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bank accounts" ON public.bank_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bank accounts" ON public.bank_accounts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bank accounts" ON public.bank_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para credit_cards
CREATE POLICY "Users can view their own credit cards" ON public.credit_cards
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own credit cards" ON public.credit_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own credit cards" ON public.credit_cards
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own credit cards" ON public.credit_cards
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para incomes
CREATE POLICY "Users can view their own incomes" ON public.incomes
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own incomes" ON public.incomes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own incomes" ON public.incomes
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own incomes" ON public.incomes
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para expenses
CREATE POLICY "Users can view their own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Criar função para adiar despesas não pagas automaticamente
CREATE OR REPLACE FUNCTION public.postpone_unpaid_expenses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.expenses 
  SET 
    due_date = due_date + INTERVAL '1 month',
    is_postponed = true,
    original_due_date = CASE 
      WHEN original_due_date IS NULL THEN due_date 
      ELSE original_due_date 
    END,
    updated_at = now()
  WHERE 
    is_paid = false 
    AND due_date < CURRENT_DATE 
    AND EXTRACT(MONTH FROM due_date) < EXTRACT(MONTH FROM CURRENT_DATE);
END;
$$;

-- Inserir algumas categorias padrão
INSERT INTO public.categories (user_id, name, color) 
SELECT 
  id as user_id,
  unnest(ARRAY['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Vestuário', 'Outros']) as name,
  unnest(ARRAY['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']) as color
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories WHERE categories.user_id = auth.users.id
);
