
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { expensesService } from "@/services/expensesService";
import { bankAccountsService } from "@/services/bankAccountsService";
import { creditCardsService } from "@/services/creditCardsService";
import { categoriesService } from "@/services/categoriesService";
import { FormField } from "./shared/FormField";
import { InstallmentSection } from "./shared/InstallmentSection";
import { RecurrenceSection } from "./shared/RecurrenceSection";
import { DateSelector } from "./shared/DateSelector";
import { CategoryDialog } from "./shared/CategoryDialog";

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingExpense?: any;
}

const ExpenseForm = ({ open, onOpenChange, editingExpense }: ExpenseFormProps) => {
  const [formData, setFormData] = useState({
    description: '',
    installmentAmount: '',
    installments: 1,
    due_date: new Date(),
    category_id: '',
    account_id: '',
    credit_card_id: '',
    recurrence: 'Única',
    notes: '',
    is_paid: false,
    isInstallment: false,
    isRecurring: false
  });

  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    color: '#8b5cf6'
  });

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch related data
  const { data: accounts = [] } = useQuery({
    queryKey: ['bank_accounts'],
    queryFn: bankAccountsService.getAll
  });

  const { data: creditCards = [] } = useQuery({
    queryKey: ['credit_cards'],
    queryFn: creditCardsService.getAll
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll
  });

  const createExpenseMutation = useMutation({
    mutationFn: expensesService.create,
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      
      // Handle response message for installments/recurrences
      const message = response?.message || "A despesa foi adicionada com sucesso!";
      
      toast({
        title: "Despesa criada",
        description: message
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar despesa. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => 
      expensesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Despesa atualizada",
        description: "A despesa foi atualizada com sucesso!"
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar despesa. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: categoriesService.create,
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setFormData(prev => ({ ...prev, category_id: newCategory.id }));
      setNewCategoryData({ name: '', color: '#8b5cf6' });
      setIsCategoryDialogOpen(false);
      toast({
        title: "Categoria criada",
        description: "Nova categoria adicionada com sucesso!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao criar categoria: " + error.message,
        variant: "destructive"
      });
    }
  });

  // Calculate total amount
  const totalAmount = formData.installmentAmount && formData.installments > 0 
    ? parseFloat(formData.installmentAmount) * formData.installments 
    : 0;

  // Check if installments or recurring is enabled
  const allowsInstallments = formData.isInstallment;
  const allowsRecurrence = formData.isRecurring;

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        description: editingExpense.description,
        installmentAmount: editingExpense.installment_amount?.toString() || editingExpense.amount?.toString() || '',
        installments: editingExpense.installments || 1,
        due_date: new Date(editingExpense.due_date),
        category_id: editingExpense.category_id || '',
        account_id: editingExpense.account_id || '',
        credit_card_id: editingExpense.credit_card_id || '',
        recurrence: editingExpense.recurrence || 'Única',
        notes: editingExpense.notes || '',
        is_paid: editingExpense.is_paid || false,
        isInstallment: editingExpense.installments > 1 || editingExpense.installment_amount !== null,
        isRecurring: editingExpense.recurrence !== 'Única'
      });
    }
  }, [editingExpense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.installmentAmount) {
      toast({
        title: "Erro",
        description: "Descrição e valor da parcela são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const installmentAmount = parseFloat(formData.installmentAmount);
    const installments = formData.isInstallment ? formData.installments : 1;

    const expenseData = {
      description: formData.description,
      amount: installmentAmount,
      installment_amount: formData.isInstallment ? installmentAmount : null,
      installments: installments,
      due_date: formData.due_date.toISOString().split('T')[0],
      category_id: formData.category_id || null,
      account_id: formData.account_id || null,
      credit_card_id: formData.credit_card_id || null,
      recurrence: formData.isRecurring ? formData.recurrence : 'Única',
      notes: formData.notes || null,
      is_paid: formData.is_paid
    };

    if (editingExpense) {
      updateExpenseMutation.mutate({ id: editingExpense.id, updates: expenseData });
    } else {
      createExpenseMutation.mutate(expenseData);
    }
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive"
      });
      return;
    }
    createCategoryMutation.mutate(newCategoryData);
  };

  const handleClose = () => {
    setFormData({
      description: '',
      installmentAmount: '',
      installments: 1,
      due_date: new Date(),
      category_id: '',
      account_id: '',
      credit_card_id: '',
      recurrence: 'Única',
      notes: '',
      is_paid: false,
      isInstallment: false,
      isRecurring: false
    });
    onOpenChange(false);
  };

  const handleAccountChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      account_id: value,
      credit_card_id: ''
    }));
  };

  const handleCreditCardChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      credit_card_id: value,
      account_id: ''
    }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
            </DialogTitle>
            <DialogDescription>
              {editingExpense ? 'Atualize os dados da despesa' : 'Adicione uma nova despesa ao seu controle financeiro'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Descrição"
              id="description"
              value={formData.description}
              onChange={(value) => setFormData({...formData, description: value})}
              placeholder="Ex: Celular"
              required
            />

            <RecurrenceSection
              isRecurring={formData.isRecurring}
              onRecurringChange={(checked) => setFormData({...formData, isRecurring: checked, recurrence: checked ? formData.recurrence : 'Única'})}
              recurrence={formData.recurrence}
              onRecurrenceChange={(value) => setFormData({...formData, recurrence: value})}
              entityType="despesa"
            />

            <InstallmentSection
              isInstallment={formData.isInstallment}
              onInstallmentChange={(checked) => setFormData({...formData, isInstallment: checked, installments: checked ? formData.installments : 1})}
              installmentAmount={formData.installmentAmount}
              onInstallmentAmountChange={(value) => setFormData({...formData, installmentAmount: value})}
              installments={formData.installments}
              onInstallmentsChange={(value) => setFormData({...formData, installments: value})}
              totalAmount={totalAmount}
              amountLabel="Despesa"
              colorScheme="blue"
            />

            <DateSelector
              date={formData.due_date}
              onDateChange={(date) => setFormData({...formData, due_date: date})}
              label="Data de Vencimento"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Conta Bancária</Label>
                <Select value={formData.account_id} onValueChange={handleAccountChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhuma conta</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - {account.bank_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cartão de Crédito</Label>
                <Select value={formData.credit_card_id} onValueChange={handleCreditCardChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar cartão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum cartão</SelectItem>
                    {creditCards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.name} - {card.bank_name}
                        {card.card_brands && ` (${card.card_brands.display_name})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <div className="flex gap-2">
                <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecionar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem categoria</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCategoryDialogOpen(true)}
                  className="px-3"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Informações adicionais..."
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_paid"
                checked={formData.is_paid}
                onCheckedChange={(checked) => setFormData({...formData, is_paid: checked})}
              />
              <Label htmlFor="is_paid">Marcar como pago</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createExpenseMutation.isPending || updateExpenseMutation.isPending}
              >
                {editingExpense ? 'Atualizar' : 'Criar'} Despesa
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para organizar suas despesas.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nome da Categoria *</Label>
              <Input
                id="categoryName"
                value={newCategoryData.name}
                onChange={(e) => setNewCategoryData({...newCategoryData, name: e.target.value})}
                placeholder="Ex: Alimentação"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoryColor">Cor</Label>
              <Input
                id="categoryColor"
                type="color"
                value={newCategoryData.color}
                onChange={(e) => setNewCategoryData({...newCategoryData, color: e.target.value})}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={createCategoryMutation.isPending}>
                Criar Categoria
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCategoryDialogOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpenseForm;
