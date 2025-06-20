
-- Criar função para atualizar saldo da conta bancária baseado nas receitas
CREATE OR REPLACE FUNCTION update_account_balance_from_incomes()
RETURNS TRIGGER AS $$
BEGIN
  -- Se é uma inserção ou atualização e há uma conta vinculada
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.account_id IS NOT NULL THEN
    -- Atualizar o saldo da conta com a soma de todas as receitas vinculadas a ela
    UPDATE bank_accounts 
    SET balance = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM incomes 
      WHERE account_id = NEW.account_id 
      AND user_id = NEW.user_id
    )
    WHERE id = NEW.account_id AND user_id = NEW.user_id;
  END IF;

  -- Se é uma atualização e a conta foi alterada, atualizar a conta anterior também
  IF TG_OP = 'UPDATE' AND OLD.account_id IS NOT NULL AND OLD.account_id != COALESCE(NEW.account_id, '') THEN
    UPDATE bank_accounts 
    SET balance = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM incomes 
      WHERE account_id = OLD.account_id 
      AND user_id = OLD.user_id
    )
    WHERE id = OLD.account_id AND user_id = OLD.user_id;
  END IF;

  -- Se é uma exclusão e havia uma conta vinculada
  IF TG_OP = 'DELETE' AND OLD.account_id IS NOT NULL THEN
    UPDATE bank_accounts 
    SET balance = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM incomes 
      WHERE account_id = OLD.account_id 
      AND user_id = OLD.user_id
    )
    WHERE id = OLD.account_id AND user_id = OLD.user_id;
    RETURN OLD;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para executar a função automaticamente
DROP TRIGGER IF EXISTS trigger_update_account_balance_from_incomes ON incomes;
CREATE TRIGGER trigger_update_account_balance_from_incomes
  AFTER INSERT OR UPDATE OR DELETE ON incomes
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance_from_incomes();

-- Criar função similar para despesas pagas
CREATE OR REPLACE FUNCTION update_account_balance_from_expenses()
RETURNS TRIGGER AS $$
BEGIN
  -- Se uma despesa foi marcada como paga
  IF TG_OP = 'UPDATE' AND NEW.is_paid = true AND OLD.is_paid = false AND NEW.account_id IS NOT NULL THEN
    -- Deduzir o valor da conta
    UPDATE bank_accounts 
    SET balance = balance - NEW.amount
    WHERE id = NEW.account_id AND user_id = NEW.user_id;
  END IF;

  -- Se uma despesa foi desmarcada como paga
  IF TG_OP = 'UPDATE' AND NEW.is_paid = false AND OLD.is_paid = true AND NEW.account_id IS NOT NULL THEN
    -- Adicionar o valor de volta à conta
    UPDATE bank_accounts 
    SET balance = balance + NEW.amount
    WHERE id = NEW.account_id AND user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para despesas
DROP TRIGGER IF EXISTS trigger_update_account_balance_from_expenses ON expenses;
CREATE TRIGGER trigger_update_account_balance_from_expenses
  AFTER UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance_from_expenses();
