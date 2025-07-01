import { supabase } from "@/integrations/supabase/client";

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