import { supabase } from "@/integrations/supabase/client";

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