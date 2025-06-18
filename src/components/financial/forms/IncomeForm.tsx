
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
import { incomesService, bankAccountsService, categoriesService } from "@/services/supabaseService";

interface IncomeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingIncome?: any;
}

const IncomeForm = ({ open, onOpenChange, editingIncome }: IncomeFormProps) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast({
        title: "Receita criada",
        description: "A receita foi adicionada com sucesso!"
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar receita. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const updateIncomeMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => 
      incomesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast({
        title: "Receita atualizada",
        description: "A receita foi atualizada com sucesso!"
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar receita. Tente novamente.",
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
      toast({
        title: "Erro",
        description: "Erro ao criar categoria: " + error.message,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (editingIncome) {
      setFormData({
        description: editingIncome.description,
        amount: editingIncome.amount.toString(),
        due_date: new Date(editingIncome.due_date),
        category_id: editingIncome.category_id || '',
        account_id: editingIncome.account_id || '',
        recurrence: editingIncome.recurrence || 'Única',
        notes: editingIncome.notes || ''
      });
    }
  }, [editingIncome]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      toast({
        title: "Erro",
        description: "Descrição e valor são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const incomeData = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date.toISOString().split('T')[0],
      category_id: formData.category_id || null,
      account_id: formData.account_id || null,
      recurrence: formData.recurrence,
      notes: formData.notes || null
    };

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
    createCategoryMutation.mutate(newCategoryData);
  };

  const handleClose = () => {
    setFormData({
      description: '',
      amount: '',
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
        <DialogContent className="sm:max-w-[500px]">
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
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Recorrência</Label>
                <Select value={formData.recurrence} onValueChange={(value) => setFormData({...formData, recurrence: value})}>
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
            </div>

            <div className="space-y-2">
              <Label>Data de Recebimento</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Conta Bancária</Label>
                <Select value={formData.account_id} onValueChange={(value) => setFormData({...formData, account_id: value})}>
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
                {editingIncome ? 'Atualizar' : 'Criar'} Receita
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

export default IncomeForm;
