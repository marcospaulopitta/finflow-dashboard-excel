-- Correção da lógica de parcelamento para despesas e receitas
-- Agora o valor informado é o valor da parcela, não o total

-- Atualizar função de criação de parcelas de despesas para usar valor da parcela
DROP FUNCTION IF EXISTS public.create_expense_installments(jsonb, integer, numeric, date);

CREATE OR REPLACE FUNCTION public.create_expense_installments(
  base_expense_data jsonb, 
  installment_count integer, 
  installment_value numeric, 
  start_date date
)
RETURNS uuid[]
LANGUAGE plpgsql
AS $$
DECLARE
  expense_ids uuid[] := '{}';
  expense_id uuid;
  i integer;
  due_date_calc date;
  total_amount numeric := installment_value * installment_count;
BEGIN
  FOR i IN 1..installment_count LOOP
    expense_id := gen_random_uuid();
    due_date_calc := start_date + (i - 1) * interval '1 month';
    
    INSERT INTO public.expenses (
      id,
      user_id,
      description,
      amount,
      due_date,
      category_id,
      account_id,
      credit_card_id,
      recurrence,
      notes,
      installment_number,
      total_installments,
      installment_amount,
      total_amount
    ) VALUES (
      expense_id,
      (base_expense_data->>'user_id')::uuid,
      (base_expense_data->>'description') || ' (' || i || '/' || installment_count || ')',
      installment_value, -- Agora cada parcela tem o valor individual
      due_date_calc,
      NULLIF(base_expense_data->>'category_id', '')::uuid,
      NULLIF(base_expense_data->>'account_id', '')::uuid,
      NULLIF(base_expense_data->>'credit_card_id', '')::uuid,
      COALESCE(base_expense_data->>'recurrence', 'Única'),
      base_expense_data->>'notes',
      i,
      installment_count,
      installment_value,
      total_amount
    );
    
    expense_ids := array_append(expense_ids, expense_id);
  END LOOP;
  
  -- Atualizar todos com o parent_id sendo o primeiro
  UPDATE public.expenses 
  SET parent_id = expense_ids[1]
  WHERE id = ANY(expense_ids);
  
  RETURN expense_ids;
END;
$$;

-- Atualizar função de criação de parcelas de receitas para usar valor da parcela
DROP FUNCTION IF EXISTS public.create_income_installments(jsonb, integer, numeric, date);

CREATE OR REPLACE FUNCTION public.create_income_installments(
  base_income_data jsonb, 
  installment_count integer, 
  installment_value numeric, 
  start_date date
)
RETURNS uuid[]
LANGUAGE plpgsql
AS $$
DECLARE
  income_ids uuid[] := '{}';
  income_id uuid;
  i integer;
  due_date_calc date;
  total_amount numeric := installment_value * installment_count;
BEGIN
  FOR i IN 1..installment_count LOOP
    income_id := gen_random_uuid();
    due_date_calc := start_date + (i - 1) * interval '1 month';
    
    INSERT INTO public.incomes (
      id,
      user_id,
      description,
      amount,
      due_date,
      category_id,
      account_id,
      recurrence,
      notes,
      installment_number,
      total_installments
    ) VALUES (
      income_id,
      (base_income_data->>'user_id')::uuid,
      (base_income_data->>'description') || ' (' || i || '/' || installment_count || ')',
      installment_value, -- Agora cada parcela tem o valor individual
      due_date_calc,
      NULLIF(base_income_data->>'category_id', '')::uuid,
      NULLIF(base_income_data->>'account_id', '')::uuid,
      COALESCE(base_income_data->>'recurrence', 'Única'),
      base_income_data->>'notes',
      i,
      installment_count
    );
    
    income_ids := array_append(income_ids, income_id);
  END LOOP;
  
  -- Atualizar todos com o parent_id sendo o primeiro
  UPDATE public.incomes 
  SET parent_id = income_ids[1]
  WHERE id = ANY(income_ids);
  
  RETURN income_ids;
END;
$$;

-- Criar função para recorrências automáticas de despesas
CREATE OR REPLACE FUNCTION public.create_expense_recurrences(
  base_expense_data jsonb, 
  recurrence_type text, 
  start_date date,
  max_occurrences integer DEFAULT 12
)
RETURNS uuid[]
LANGUAGE plpgsql
AS $$
DECLARE
  expense_ids uuid[] := '{}';
  expense_id uuid;
  i integer;
  due_date_calc date;
  interval_value interval;
BEGIN
  -- Definir intervalo baseado no tipo de recorrência
  CASE recurrence_type
    WHEN 'Semanal' THEN interval_value := '1 week'::interval;
    WHEN 'Quinzenal' THEN interval_value := '2 weeks'::interval;
    WHEN 'Mensal' THEN interval_value := '1 month'::interval;
    WHEN 'Bimestral' THEN interval_value := '2 months'::interval;
    WHEN 'Trimestral' THEN interval_value := '3 months'::interval;
    WHEN 'Anual' THEN interval_value := '1 year'::interval;
    ELSE interval_value := '1 month'::interval;
  END CASE;

  FOR i IN 0..max_occurrences-1 LOOP
    expense_id := gen_random_uuid();
    due_date_calc := start_date + (i * interval_value);
    
    INSERT INTO public.expenses (
      id,
      user_id,
      description,
      amount,
      due_date,
      category_id,
      account_id,
      credit_card_id,
      recurrence,
      notes,
      recurrence_parent_id
    ) VALUES (
      expense_id,
      (base_expense_data->>'user_id')::uuid,
      base_expense_data->>'description',
      (base_expense_data->>'amount')::numeric,
      due_date_calc,
      NULLIF(base_expense_data->>'category_id', '')::uuid,
      NULLIF(base_expense_data->>'account_id', '')::uuid,
      NULLIF(base_expense_data->>'credit_card_id', '')::uuid,
      recurrence_type,
      base_expense_data->>'notes',
      CASE WHEN i = 0 THEN NULL ELSE expense_ids[1] END
    );
    
    expense_ids := array_append(expense_ids, expense_id);
  END LOOP;
  
  -- Atualizar o primeiro registro com seu próprio ID como parent
  UPDATE public.expenses 
  SET recurrence_parent_id = expense_ids[1]
  WHERE id = expense_ids[1];
  
  RETURN expense_ids;
END;
$$;

-- Criar função para recorrências automáticas de receitas
CREATE OR REPLACE FUNCTION public.create_income_recurrences(
  base_income_data jsonb, 
  recurrence_type text, 
  start_date date,
  max_occurrences integer DEFAULT 12
)
RETURNS uuid[]
LANGUAGE plpgsql
AS $$
DECLARE
  income_ids uuid[] := '{}';
  income_id uuid;
  i integer;
  due_date_calc date;
  interval_value interval;
BEGIN
  -- Definir intervalo baseado no tipo de recorrência
  CASE recurrence_type
    WHEN 'Semanal' THEN interval_value := '1 week'::interval;
    WHEN 'Quinzenal' THEN interval_value := '2 weeks'::interval;
    WHEN 'Mensal' THEN interval_value := '1 month'::interval;
    WHEN 'Bimestral' THEN interval_value := '2 months'::interval;
    WHEN 'Trimestral' THEN interval_value := '3 months'::interval;
    WHEN 'Anual' THEN interval_value := '1 year'::interval;
    ELSE interval_value := '1 month'::interval;
  END CASE;

  FOR i IN 0..max_occurrences-1 LOOP
    income_id := gen_random_uuid();
    due_date_calc := start_date + (i * interval_value);
    
    INSERT INTO public.incomes (
      id,
      user_id,
      description,
      amount,
      due_date,
      category_id,
      account_id,
      recurrence,
      notes,
      recurrence_parent_id
    ) VALUES (
      income_id,
      (base_income_data->>'user_id')::uuid,
      base_income_data->>'description',
      (base_income_data->>'amount')::numeric,
      due_date_calc,
      NULLIF(base_income_data->>'category_id', '')::uuid,
      NULLIF(base_income_data->>'account_id', '')::uuid,
      recurrence_type,
      base_income_data->>'notes',
      CASE WHEN i = 0 THEN NULL ELSE income_ids[1] END
    );
    
    income_ids := array_append(income_ids, income_id);
  END LOOP;
  
  -- Atualizar o primeiro registro com seu próprio ID como parent
  UPDATE public.incomes 
  SET recurrence_parent_id = income_ids[1]
  WHERE id = income_ids[1];
  
  RETURN income_ids;
END;
$$;