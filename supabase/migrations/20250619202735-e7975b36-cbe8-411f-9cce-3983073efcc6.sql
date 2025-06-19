
-- 🔥 Ajuste na tabela bank_accounts para substituir o tipo de texto por inteiro no campo account_type

-- 1️⃣ Remover a constraint atual
ALTER TABLE public.bank_accounts
DROP CONSTRAINT IF EXISTS bank_accounts_account_type_check;

-- 2️⃣ Alterar o tipo da coluna account_type de texto para inteiro, convertendo os dados existentes
ALTER TABLE public.bank_accounts
ALTER COLUMN account_type TYPE integer USING 
    CASE 
        WHEN account_type = 'current' THEN 1
        WHEN account_type = 'Conta Corrente' THEN 1
        WHEN account_type = 'salary' THEN 2
        WHEN account_type = 'Conta Salário' THEN 2
        WHEN account_type = 'savings' THEN 3
        WHEN account_type = 'Poupança' THEN 3
        ELSE 1 -- Default para Conta Corrente
    END;

-- 3️⃣ Adicionar uma constraint CHECK para garantir que o valor seja 1, 2 ou 3
ALTER TABLE public.bank_accounts
ADD CONSTRAINT bank_accounts_account_type_check
CHECK (account_type IN (1, 2, 3));

-- 4️⃣ Definir valor padrão para novas contas
ALTER TABLE public.bank_accounts
ALTER COLUMN account_type SET DEFAULT 1;

-- 5️⃣ Adicionar um comentário na coluna para documentação
COMMENT ON COLUMN public.bank_accounts.account_type IS 
'1 = Conta Corrente, 2 = Conta Salário, 3 = Poupança';
