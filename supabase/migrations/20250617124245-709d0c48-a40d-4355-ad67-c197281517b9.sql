
-- Habilitar Row Level Security (RLS) em todas as tabelas financeiras
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;

-- Políticas para bank_accounts
CREATE POLICY "Users can view own bank accounts" ON public.bank_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts" ON public.bank_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts" ON public.bank_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank accounts" ON public.bank_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para categories
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para credit_cards
CREATE POLICY "Users can view own credit cards" ON public.credit_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credit cards" ON public.credit_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credit cards" ON public.credit_cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credit cards" ON public.credit_cards
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para expenses
CREATE POLICY "Users can view own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para incomes
CREATE POLICY "Users can view own incomes" ON public.incomes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own incomes" ON public.incomes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incomes" ON public.incomes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own incomes" ON public.incomes
  FOR DELETE USING (auth.uid() = user_id);
