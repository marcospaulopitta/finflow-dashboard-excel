import { toast } from "@/hooks/use-toast";

export interface FormData {
  description: string;
  installmentAmount: string;
  due_date: Date;
}

export const useFormValidation = () => {
  const validateForm = (formData: FormData): boolean => {
    if (!formData.description.trim()) {
      toast({
        title: "Erro de validação",
        description: "Descrição é obrigatória",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.installmentAmount || parseFloat(formData.installmentAmount) <= 0) {
      toast({
        title: "Erro de validação", 
        description: "Valor deve ser maior que zero",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.due_date) {
      toast({
        title: "Erro de validação",
        description: "Data é obrigatória",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return { validateForm };
};