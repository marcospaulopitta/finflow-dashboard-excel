import { supabase } from "@/integrations/supabase/client";

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