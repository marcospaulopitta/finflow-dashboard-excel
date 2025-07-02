import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { incomesService } from "@/services/incomesService";
import { bankAccountsService } from "@/services/bankAccountsService";
import { categoriesService } from "@/services/categoriesService";

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
    notes: ''
  });

  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    color: '#16a34a'
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
      setNewCategoryData({ name: '', color: '#16a34a' });
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

  // Check if recurrence allows installments
  const allowsInstallments = formData.recurrence !== 'Única';

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
        notes: editingIncome.notes || ''
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
    const installments = formData.installments;

    // Para parcelas ou recorrências, usar a nova lógica corrigida
    const incomeData = {
      description: formData.description.trim(),
      amount: installmentAmount, // Agora é o valor da parcela individual
      installment_amount: installmentAmount,
      installments: installments,
      due_date: formData.due_date.toISOString().split('T')[0],
      category_id: formData.category_id === 'none' ? null : formData.category_id || null,
      account_id: formData.account_id === 'none' ? null : formData.account_id || null,
      recurrence: formData.recurrence,
      notes: formData.notes?.trim() || null
    };

    console.log('Enviando dados da receita:', incomeData);

    if (editingIncome) {
      updateIncomeMutation.mutate({ id: editingIncome.id, updates: incomeData });
    } else {
      createIncomeMutation.mutate(incomeData);
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
    createCategoryMutation.mutate({
      name: newCategoryData.name.trim(),
      color: newCategoryData.color
    });
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
      notes: ''
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
            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Ex: Salário"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="installmentAmount">Valor da Parcela *</Label>
                <Input
                  id="installmentAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.installmentAmount}
                  onChange={(e) => setFormData({...formData, installmentAmount: e.target.value})}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="installments">Parcelas</Label>
                <Input
                  id="installments"
                  type="number"
                  min="1"
                  max="48"
                  value={formData.installments}
                  onChange={(e) => setFormData({...formData, installments: parseInt(e.target.value) || 1})}
                  disabled={!allowsInstallments}
                  className={!allowsInstallments ? 'bg-gray-100' : ''}
                />
              </div>
            </div>

            {/* Show total amount if installments > 1 or value entered */}
            {(formData.installments > 1 || formData.installmentAmount) && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Valor Total:</strong> R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                {formData.installments > 1 && (
                  <p className="text-sm text-green-600">
                    {formData.installments}x de R$ {parseFloat(formData.installmentAmount || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Data de Recebimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.due_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.due_date ? format(formData.due_date, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.due_date}
                    onSelect={(date) => date && setFormData({...formData, due_date: date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recurrence">Recorrência</Label>
              <Select value={formData.recurrence} onValueChange={(value) => setFormData({...formData, recurrence: value, installments: value === 'Única' ? 1 : formData.installments})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Única">Única</SelectItem>
                  <SelectItem value="Semanal">Semanal</SelectItem>
                  <SelectItem value="Quinzenal">Quinzenal</SelectItem>
                  <SelectItem value="Mensal">Mensal</SelectItem>
                  <SelectItem value="Bimestral">Bimestral</SelectItem>
                  <SelectItem value="Trimestral">Trimestral</SelectItem>
                  <SelectItem value="Anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Conta Bancária</Label>
                <Select value={formData.account_id} onValueChange={(value) => setFormData({...formData, account_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma conta</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} - {account.bank_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {accounts.length === 0 && (
                  <p className="text-sm text-orange-600">Nenhuma conta cadastrada. Cadastre uma conta para melhor organização.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <div className="flex gap-2">
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem categoria</SelectItem>
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
                {categories.length === 0 && (
                  <p className="text-sm text-orange-600">Nenhuma categoria cadastrada. Crie uma categoria para melhor organização.</p>
                )}
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

      {/* New Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Crie uma nova categoria para organizar suas receitas.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Nome da Categoria *</Label>
              <Input
                id="categoryName"
                value={newCategoryData.name}
                onChange={(e) => setNewCategoryData({...newCategoryData, name: e.target.value})}
                placeholder="Ex: Freelance"
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
                {createCategoryMutation.isPending ? 'Criando...' : 'Criar Categoria'}
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

export default IncomeForm;