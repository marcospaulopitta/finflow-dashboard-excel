
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Tables = Database['public']['Tables'];
type Category = Tables['categories']['Row'];
type BankAccount = Tables['bank_accounts']['Row'];
type CreditCard = Tables['credit_cards']['Row'];
type Income = Tables['incomes']['Row'];
type Expense = Tables['expenses']['Row'];

export type CategoryInsert = Tables['categories']['Insert'];
export type BankAccountInsert = Tables['bank_accounts']['Insert'];
export type CreditCardInsert = Tables['credit_cards']['Insert'];
export type IncomeInsert = Tables['incomes']['Insert'];
export type ExpenseInsert = Tables['expenses']['Insert'];

// Helper function to get authenticated user
const getAuthenticatedUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('User not authenticated');
  }
  return user;
};

// Categories
export const categoriesService = {
  async getAll(): Promise<Category[]> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async create(category: Omit<CategoryInsert, 'user_id'>): Promise<Category> {
    const user = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from('categories')
      .insert({ ...category, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Omit<CategoryInsert, 'user_id'>>): Promise<Category> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Bank Accounts
export const bankAccountsService = {
  async getAll(): Promise<BankAccount[]> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async create(account: Omit<BankAccountInsert, 'user_id'>): Promise<BankAccount> {
    const user = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert({ ...account, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Omit<BankAccountInsert, 'user_id'>>): Promise<BankAccount> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { data, error } = await supabase
      .from('bank_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Credit Cards
export const creditCardsService = {
  async getAll(): Promise<CreditCard[]> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async create(card: Omit<CreditCardInsert, 'user_id'>): Promise<CreditCard> {
    const user = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from('credit_cards')
      .insert({ ...card, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Omit<CreditCardInsert, 'user_id'>>): Promise<CreditCard> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { data, error } = await supabase
      .from('credit_cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { error } = await supabase
      .from('credit_cards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Incomes
export const incomesService = {
  async getAll(): Promise<Income[]> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .order('due_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(income: Omit<IncomeInsert, 'user_id'>): Promise<Income> {
    const user = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from('incomes')
      .insert({ ...income, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Omit<IncomeInsert, 'user_id'>>): Promise<Income> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { data, error } = await supabase
      .from('incomes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Expenses
export const expensesService = {
  async getAll(): Promise<Expense[]> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('due_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(expense: Omit<ExpenseInsert, 'user_id'>): Promise<Expense> {
    const user = await getAuthenticatedUser();

    const { data, error } = await supabase
      .from('expenses')
      .insert({ ...expense, user_id: user.id })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Omit<ExpenseInsert, 'user_id'>>): Promise<Expense> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async postponeUnpaid(): Promise<void> {
    await getAuthenticatedUser(); // Ensure user is authenticated
    
    const { error } = await supabase.rpc('postpone_unpaid_expenses');
    if (error) throw error;
  }
};
