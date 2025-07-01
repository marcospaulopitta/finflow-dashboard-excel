
import { supabase } from "@/integrations/supabase/client";

// Bank Accounts Service
export const bankAccountsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(accountData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('bank_accounts')
      .insert([{ ...accountData, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('bank_accounts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Card Brands Service
export const cardBrandsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('card_brands')
      .select('*')
      .order('display_name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }
};

// Credit Cards Service
export const creditCardsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('credit_cards')
      .select(`
        *,
        card_brands!credit_cards_brand_id_fkey (
          id,
          name,
          display_name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(cardData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('credit_cards')
      .insert([{ ...cardData, user_id: user.id }])
      .select(`
        *,
        card_brands!credit_cards_brand_id_fkey (
          id,
          name,
          display_name
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('credit_cards')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        card_brands!credit_cards_brand_id_fkey (
          id,
          name,
          display_name
        )
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('credit_cards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Categories Service
export const categoriesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(categoryData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('categories')
      .insert([{ ...categoryData, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Expenses Service
export const expensesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(expenseData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Se tem parcelas, usar função de criação de parcelas
    if (expenseData.installments && expenseData.installments > 1) {
      const { data, error } = await supabase.rpc('create_expense_installments', {
        base_expense_data: {
          user_id: user.id,
          description: expenseData.description,
          category_id: expenseData.category_id,
          account_id: expenseData.account_id,
          credit_card_id: expenseData.credit_card_id,
          recurrence: expenseData.recurrence || 'Única',
          notes: expenseData.notes
        },
        installment_count: expenseData.installments,
        installment_value: expenseData.installment_amount,
        start_date: expenseData.due_date
      });
      
      if (error) throw error;
      return { ids: data, message: `${expenseData.installments} parcelas criadas com sucesso` };
    }

    // Se tem recorrência (não única), usar função de recorrência
    if (expenseData.recurrence && expenseData.recurrence !== 'Única') {
      const { data, error } = await supabase.rpc('create_expense_recurrences', {
        base_expense_data: {
          user_id: user.id,
          description: expenseData.description,
          amount: expenseData.amount,
          category_id: expenseData.category_id,
          account_id: expenseData.account_id,
          credit_card_id: expenseData.credit_card_id,
          notes: expenseData.notes
        },
        recurrence_type: expenseData.recurrence,
        start_date: expenseData.due_date,
        max_occurrences: 12
      });
      
      if (error) throw error;
      return { ids: data, message: `12 ocorrências ${expenseData.recurrence.toLowerCase()} criadas` };
    }

    // Lançamento único normal
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expenseData, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Incomes Service
export const incomesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(incomeData: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Se tem parcelas, usar função de criação de parcelas
    if (incomeData.installments && incomeData.installments > 1) {
      const { data, error } = await supabase.rpc('create_income_installments', {
        base_income_data: {
          user_id: user.id,
          description: incomeData.description,
          category_id: incomeData.category_id,
          account_id: incomeData.account_id,
          recurrence: incomeData.recurrence || 'Única',
          notes: incomeData.notes
        },
        installment_count: incomeData.installments,
        installment_value: incomeData.installment_amount,
        start_date: incomeData.due_date
      });
      
      if (error) throw error;
      return { ids: data, message: `${incomeData.installments} parcelas criadas com sucesso` };
    }

    // Se tem recorrência (não única), usar função de recorrência
    if (incomeData.recurrence && incomeData.recurrence !== 'Única') {
      const { data, error } = await supabase.rpc('create_income_recurrences', {
        base_income_data: {
          user_id: user.id,
          description: incomeData.description,
          amount: incomeData.amount,
          category_id: incomeData.category_id,
          account_id: incomeData.account_id,
          notes: incomeData.notes
        },
        recurrence_type: incomeData.recurrence,
        start_date: incomeData.due_date,
        max_occurrences: 12
      });
      
      if (error) throw error;
      return { ids: data, message: `12 ocorrências ${incomeData.recurrence.toLowerCase()} criadas` };
    }

    // Lançamento único normal
    const { data, error } = await supabase
      .from('incomes')
      .insert([{ ...incomeData, user_id: user.id }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('incomes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
