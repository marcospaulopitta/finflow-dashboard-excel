import { supabase } from "@/integrations/supabase/client";

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