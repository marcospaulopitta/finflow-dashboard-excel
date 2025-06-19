
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
