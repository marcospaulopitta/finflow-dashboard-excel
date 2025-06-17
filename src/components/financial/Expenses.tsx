import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, TrendingDown, Calendar, Edit, Trash2, Repeat } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesService, bankAccountsService, creditCardsService, categoriesService } from "@/services/supabaseService";

const Expenses = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    due_date: '',
    account_id: '',
    credit_card_id: '',
    category_id: '',
    recurrence: 'Única',
    installments: '1',
    notes: ''
  });

  // Fetch data
  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesService.getAll
  });

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

  const recurrenceOptions = ['Única', 'Semanal', 'Quinzenal', 'Mensal', 'Anual'];

  // Mutations
  const createMutation = useMutation({
    mutationFn: expensesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Sucesso",
        description: "Despesa criada com sucesso!"
      });
      setFormData({ 
        description: '', 
        amount: '', 
        due_date: '',
        account_id: '',
        credit_card_id: '',
        category_id: '', 
        recurrence: 'Única',
        installments: '1',
        notes: '' 
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao criar despesa: " + error.message,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => 
      expensesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Sucesso",
        description: "Despesa atualizada com sucesso!"
      });
      setFormData({ 
        description: '', 
        amount: '', 
        due_date: '',
        account_id: '',
        credit_card_id: '',
        category_id: '', 
        recurrence: 'Única',
        installments: '1',
        notes: '' 
      });
      setEditingExpense(null);
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar despesa: " + error.message,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: expensesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Sucesso",
        description: "Despesa removida com sucesso!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao remover despesa: " + error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim() || !formData.amount || !formData.due_date) {
      toast({
        title: "Erro",
        description: "Descrição, valor e data de vencimento são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const installments = parseInt(formData.installments) || 1;
    const totalAmount = parseFloat(formData.amount);
    const installmentAmount = installments > 1 ? totalAmount / installments : totalAmount;

    const expenseData = {
      description: formData.description,
      amount: totalAmount,
      due_date: formData.due_date,
      account_id: formData.account_id || null,
      credit_card_id: formData.credit_card_id || null,
      category_id: formData.category_id || null,
      recurrence: formData.recurrence,
      installments: installments,
      current_installment: 1,
      installment_amount: installmentAmount,
      total_amount: totalAmount,
      notes: formData.notes || null
    };

    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.id, updates: expenseData });
    } else {
      createMutation.mutate(expenseData);
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      due_date: expense.due_date,
      account_id: expense.account_id || '',
      credit_card_id: expense.credit_card_id || '',
      category_id: expense.category_id || '',
      recurrence: expense.recurrence || 'Única',
      installments: expense.installments?.toString() || '1',
      notes: expense.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const thisMonthExpenses = expenses.filter(exp => {
    const expenseDate = new Date(exp.due_date);
    const currentDate = new Date();
    return expenseDate.getMonth() === currentDate.getMonth() && 
           expenseDate.getFullYear() === currentDate.getFullYear();
  }).reduce((sum, exp) => sum + Number(exp.amount), 0);

  const getRecurrenceColor = (recurrence: string) => {
    switch (recurrence) {
      case 'Única': return 'bg-gray-100 text-gray-800';
      case 'Semanal': return 'bg-blue-100 text-blue-800';
      case 'Quinzenal': return 'bg-purple-100 text-purple-800';
      case 'Mensal': return 'bg-green-100 text-green-800';
      case 'Anual': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : '';
  };

  const getCreditCardName = (cardId: string) => {
    const card = creditCards.find(c => c.id === cardId);
    return card ? card.name : '';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  };

  if (expensesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Despesas</h2>
          <p className="text-gray-600">Gerencie suas despesas e gastos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                setEditingExpense(null);
                setFormData({ 
                  description: '', 
                  amount: '', 
                  due_date: '',
                  account_id: '',
                  credit_card_id: '',
                  category_id: '', 
                  recurrence: 'Única',
                  installments: '1',
                  notes: '' 
                });
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Nova Despesa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
              </DialogTitle>
              <DialogDescription>
                {editingExpense ? 'Atualize os dados da despesa.' : 'Cadastre uma nova despesa.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ex: Supermercado Pão de Açúcar"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor Total (R$) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Data de Vencimento *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account_id">Conta Bancária</Label>
                  <Select value={formData.account_id} onValueChange={(value) => setFormData({...formData, account_id: value, credit_card_id: ''})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credit_card_id">Cartão de Crédito</Label>
                  <Select value={formData.credit_card_id} onValueChange={(value) => setFormData({...formData, credit_card_id: value, account_id: ''})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar cartão" />
                    </SelectTrigger>
                    <SelectContent>
                      {creditCards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>{card.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Categoria</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="installments">Parcelas</Label>
                  <Input
                    id="installments"
                    type="number"
                    min="1"
                    max="48"
                    value={formData.installments}
                    onChange={(e) => setFormData({...formData, installments: e.target.value})}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recurrence">Tipo de Recorrência</Label>
                <Select value={formData.recurrence} onValueChange={(value) => setFormData({...formData, recurrence: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recurrenceOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Observações adicionais (opcional)"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingExpense ? 'Atualizar' : 'Criar Despesa'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Total de Despesas</p>
                <p className="text-3xl font-bold">
                  R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-red-100 mt-1">{expenses.length} despesa(s)</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <TrendingDown className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Despesas do Mês</p>
                <p className="text-3xl font-bold">
                  R$ {thisMonthExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-orange-100 mt-1">{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Calendar className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <div className="space-y-4">
        {expenses.map((expense) => (
          <Card key={expense.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{expense.description}</h3>
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(expense)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(expense.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(expense.due_date).toLocaleDateString('pt-BR')}
                    </Badge>
                    {expense.recurrence !== 'Única' && (
                      <Badge className={`text-sm ${getRecurrenceColor(expense.recurrence)}`}>
                        <Repeat className="h-3 w-3 mr-1" />
                        {expense.recurrence}
                      </Badge>
                    )}
                    {expense.category_id && (
                      <Badge variant="secondary" className="text-sm">
                        {getCategoryName(expense.category_id)}
                      </Badge>
                    )}
                    {expense.account_id && (
                      <Badge variant="outline" className="text-sm">
                        {getAccountName(expense.account_id)}
                      </Badge>
                    )}
                    {expense.credit_card_id && (
                      <Badge variant="outline" className="text-sm">
                        {getCreditCardName(expense.credit_card_id)}
                      </Badge>
                    )}
                    {expense.installments > 1 && (
                      <Badge variant="secondary" className="text-sm">
                        {expense.current_installment}/{expense.installments}x
                      </Badge>
                    )}
                    {expense.is_paid && (
                      <Badge className="text-sm bg-green-100 text-green-800">
                        Pago
                      </Badge>
                    )}
                  </div>
                  
                  {expense.notes && (
                    <p className="text-sm text-gray-600">{expense.notes}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">
                    R$ {Number(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  {expense.installments > 1 && (
                    <p className="text-sm text-gray-500">
                      {expense.installments}x de R$ {Number(expense.installment_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {expenses.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <TrendingDown className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma despesa cadastrada
            </h3>
            <p className="text-gray-600 mb-4">
              Comece cadastrando sua primeira despesa para controlar melhor seus gastos.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Cadastrar Primeira Despesa
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Expenses;
