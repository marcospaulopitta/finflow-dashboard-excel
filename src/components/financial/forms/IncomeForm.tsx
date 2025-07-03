import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { incomesService } from "@/services/incomesService";
import { bankAccountsService } from "@/services/bankAccountsService";
import { categoriesService } from "@/services/categoriesService";
import { FormField } from "./shared/FormField";
import { InstallmentSection } from "./shared/InstallmentSection";
import { RecurrenceSection } from "./shared/RecurrenceSection";
import { DateSelector } from "./shared/DateSelector";
import { AccountCategorySelection } from "./shared/AccountCategorySelection";
import { CategoryDialog } from "./shared/CategoryDialog";
import { useFormValidation } from "@/hooks/useFormValidation";

interface IncomeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingIncome?: any;
}

const IncomeForm = ({ open, onOpenChange, editingIncome }: IncomeFormProps) => {
  const [formData, setFormData] = useState({
    description: '',
    installmentAmount: '',
    installments: 1,
    due_date: new Date(),
    category_id: '',
    account_id: '',
    recurrence: 'Única',
    notes: '',
    isInstallment: false,
    isRecurring: false
  });

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch related data
  const { data: accounts = [] } = useQuery({
    queryKey: ['bank_accounts'],
    queryFn: bankAccountsService.getAll
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll
  });

  const createIncomeMutation = useMutation({
    mutationFn: incomesService.create,
    onSuccess: (response: any) => {
      // Invalidate all related queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      
      // Handle response message for installments/recurrences
      const message = response?.message || "A receita foi adicionada com sucesso!";
      
      toast({
        title: "Receita criada",
        description: message
      });
      handleClose();
    },
    onError: (error) => {
      console.error('Erro ao criar receita:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar receita. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    }
  });

  const updateIncomeMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => 
      incomesService.update(id, updates),
    onSuccess: () => {
      // Invalidate all related queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      toast({
        title: "Receita atualizada",
        description: "A receita foi atualizada com sucesso e o saldo da conta foi recalculado!"
      });
      handleClose();
    },
    onError: (error) => {
      console.error('Erro ao atualizar receita:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar receita. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: categoriesService.create,
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setFormData(prev => ({ ...prev, category_id: newCategory.id }));
      setIsCategoryDialogOpen(false);
      toast({
        title: "Categoria criada",
        description: "Nova categoria adicionada com sucesso!"
      });
    },
    onError: (error: any) => {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar categoria. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Calculate total amount
  const totalAmount = formData.installmentAmount && formData.installments > 0 
    ? parseFloat(formData.installmentAmount) * formData.installments 
    : 0;

  useEffect(() => {
    if (editingIncome) {
      setFormData({
        description: editingIncome.description || '',
        installmentAmount: editingIncome.installment_amount?.toString() || editingIncome.amount?.toString() || '',
        installments: editingIncome.installments || 1,
        due_date: editingIncome.due_date ? new Date(editingIncome.due_date) : new Date(),
        category_id: editingIncome.category_id || '',
        account_id: editingIncome.account_id || '',
        recurrence: editingIncome.recurrence || 'Única',
        notes: editingIncome.notes || '',
        isInstallment: editingIncome.installments > 1 || editingIncome.installment_amount !== null,
        isRecurring: editingIncome.recurrence !== 'Única'
      });
    }
  }, [editingIncome]);

  const validateForm = () => {
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
        description: "Valor da parcela deve ser maior que zero",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.due_date) {
      toast({
        title: "Erro de validação",
        description: "Data de recebimento é obrigatória",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const installmentAmount = parseFloat(formData.installmentAmount);
    const installments = formData.isInstallment ? formData.installments : 1;

    const incomeData = {
      description: formData.description.trim(),
      amount: installmentAmount,
      installment_amount: formData.isInstallment ? installmentAmount : null,
      installments: installments,
      due_date: formData.due_date.toISOString().split('T')[0],
      category_id: formData.category_id === 'none' ? null : formData.category_id || null,
      account_id: formData.account_id === 'none' ? null : formData.account_id || null,
      recurrence: formData.isRecurring ? formData.recurrence : 'Única',
      notes: formData.notes?.trim() || null
    };

    console.log('Enviando dados da receita:', incomeData);

    if (editingIncome) {
      updateIncomeMutation.mutate({ id: editingIncome.id, updates: incomeData });
    } else {
      createIncomeMutation.mutate(incomeData);
    }
  };


  const handleClose = () => {
    setFormData({
      description: '',
      installmentAmount: '',
      installments: 1,
      due_date: new Date(),
      category_id: '',
      account_id: '',
      recurrence: 'Única',
      notes: '',
      isInstallment: false,
      isRecurring: false
    });
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIncome ? 'Editar Receita' : 'Nova Receita'}
            </DialogTitle>
            <DialogDescription>
              {editingIncome ? 'Atualize os dados da receita' : 'Adicione uma nova receita ao seu controle financeiro'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Descrição"
              id="description"
              value={formData.description}
              onChange={(value) => setFormData({...formData, description: value})}
              placeholder="Ex: Salário"
              required
            />

            <RecurrenceSection
              isRecurring={formData.isRecurring}
              onRecurringChange={(checked) => setFormData({...formData, isRecurring: checked, recurrence: checked ? formData.recurrence : 'Única'})}
              recurrence={formData.recurrence}
              onRecurrenceChange={(value) => setFormData({...formData, recurrence: value})}
              entityType="receita"
            />

            <InstallmentSection
              isInstallment={formData.isInstallment}
              onInstallmentChange={(checked) => setFormData({...formData, isInstallment: checked, installments: checked ? formData.installments : 1})}
              installmentAmount={formData.installmentAmount}
              onInstallmentAmountChange={(value) => setFormData({...formData, installmentAmount: value})}
              installments={formData.installments}
              onInstallmentsChange={(value) => setFormData({...formData, installments: value})}
              totalAmount={totalAmount}
              amountLabel="Receita"
              colorScheme="green"
            />

            <DateSelector
              date={formData.due_date}
              onDateChange={(date) => setFormData({...formData, due_date: date})}
              label="Data de Recebimento"
              required
            />

            <AccountCategorySelection
              accountId={formData.account_id}
              onAccountChange={(value) => setFormData({...formData, account_id: value})}
              accounts={accounts}
              categoryId={formData.category_id}
              onCategoryChange={(value) => setFormData({...formData, category_id: value})}
              categories={categories}
              onCreateCategory={() => setIsCategoryDialogOpen(true)}
            />

            <FormField
              label="Observações"
              id="notes"
              value={formData.notes}
              onChange={(value) => setFormData({...formData, notes: value})}
              type="textarea"
              placeholder="Informações adicionais..."
            />

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createIncomeMutation.isPending || updateIncomeMutation.isPending}
              >
                {createIncomeMutation.isPending || updateIncomeMutation.isPending 
                  ? 'Processando...' 
                  : editingIncome ? 'Atualizar Receita' : 'Criar Receita'
                }
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <CategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        onCreateCategory={(categoryData) => createCategoryMutation.mutate(categoryData)}
        isLoading={createCategoryMutation.isPending}
        defaultColor="#16a34a"
        entityType="receitas"
      />
    </>
  );
};

export default IncomeForm;