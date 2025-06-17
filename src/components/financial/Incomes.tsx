
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, TrendingUp, Calendar, Edit, Trash2, Repeat } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incomesService, bankAccountsService, categoriesService } from "@/services/supabaseService";

const Incomes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    due_date: '',
    account_id: '',
    category_id: '',
    recurrence: 'Única',
    notes: ''
  });

  // Fetch data
  const { data: incomes = [], isLoading: incomesLoading } = useQuery({
    queryKey: ['incomes'],
    queryFn: incomesService.getAll
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['bank_accounts'],
    queryFn: bankAccountsService.getAll
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesService.getAll
  });

  const recurrenceOptions = ['Única', 'Semanal', 'Quinzenal', 'Mensal', 'Anual'];

  // Mutations
  const createMutation = useMutation({
    mutationFn: incomesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast({
        title: "Sucesso",
        description: "Receita criada com sucesso!"
      });
      setFormData({ 
        description: '', 
        amount: '', 
        due_date: '', 
        account_id: '', 
        category_id: '', 
        recurrence: 'Única', 
        notes: '' 
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar receita: " + error.message,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => 
      incomesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast({
        title: "Sucesso",
        description: "Receita atualizada com sucesso!"
      });
      setFormData({ 
        description: '', 
        amount: '', 
        due_date: '', 
        account_id: '', 
        category_id: '', 
        recurrence: 'Única', 
        notes: '' 
      });
      setEditingIncome(null);
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar receita: " + error.message,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: incomesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      toast({
        title: "Sucesso",
        description: "Receita removida com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao remover receita: " + error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description.trim() || !formData.amount || !formData.due_date) {
      toast({
        title: "Erro",
        description: "Descrição, valor e data de vencimento são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const incomeData = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date,
      account_id: formData.account_id || null,
      category_id: formData.category_id || null,
      recurrence: formData.recurrence,
      notes: formData.notes || null
    };

    if (editingIncome) {
      updateMutation.mutate({ id: editingIncome.id, updates: incomeData });
    } else {
      createMutation.mutate(incomeData);
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setFormData({
      description: income.description,
      amount: income.amount.toString(),
      due_date: income.due_date,
      account_id: income.account_id || '',
      category_id: income.category_id || '',
      recurrence: income.recurrence || 'Única',
      notes: income.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id);
  };

  const totalIncomes = incomes.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
  const thisMonthIncomes = incomes.filter(inc => {
    const incomeDate = new Date(inc.due_date);
    const currentDate = new Date();
    return incomeDate.getMonth() === currentDate.getMonth() && 
           incomeDate.getFullYear() === currentDate.getFullYear();
  }).reduce((sum, inc) => sum + parseFloat(inc.amount), 0);

  const getRecurrenceColor = (recurrence) => {
    switch (recurrence) {
      case 'Única': return 'bg-gray-100 text-gray-800';
      case 'Semanal': return 'bg-blue-100 text-blue-800';
      case 'Quinzenal': return 'bg-purple-100 text-purple-800';
      case 'Mensal': return 'bg-green-100 text-green-800';
      case 'Anual': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : '';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  };

  if (incomesLoading) {
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
          <h2 className="text-3xl font-bold text-gray-900">Receitas</h2>
          <p className="text-gray-600">Gerencie suas receitas e ganhos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                setEditingIncome(null);
                setFormData({ 
                  description: '', 
                  amount: '', 
                  due_date: '', 
                  account_id: '', 
                  category_id: '', 
                  recurrence: 'Única', 
                  notes: '' 
                });
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingIncome ? 'Editar Receita' : 'Nova Receita'}
              </DialogTitle>
              <DialogDescription>
                {editingIncome ? 'Atualize os dados da receita.' : 'Cadastre uma nova receita.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ex: Salário Empresa XYZ"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$) *</Label>
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
                  <Label htmlFor="due_date">Data de Recebimento *</Label>
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
                  <Label htmlFor="account_id">Conta</Label>
                  <Select value={formData.account_id} onValueChange={(value) => setFormData({...formData, account_id: value})}>
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
                  {editingIncome ? 'Atualizar' : 'Criar Receita'}
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
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total de Receitas</p>
                <p className="text-3xl font-bold">
                  R$ {totalIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-green-100 mt-1">{incomes.length} receita(s)</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Receitas do Mês</p>
                <p className="text-3xl font-bold">
                  R$ {thisMonthIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-blue-100 mt-1">{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Calendar className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incomes List */}
      <div className="space-y-4">
        {incomes.map((income) => (
          <Card key={income.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{income.description}</h3>
                    <div className="flex gap-1 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(income)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(income.id)}
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
                      {new Date(income.due_date).toLocaleDateString('pt-BR')}
                    </Badge>
                    {income.recurrence !== 'Única' && (
                      <Badge className={`text-sm ${getRecurrenceColor(income.recurrence)}`}>
                        <Repeat className="h-3 w-3 mr-1" />
                        {income.recurrence}
                      </Badge>
                    )}
                    {income.category_id && (
                      <Badge variant="secondary" className="text-sm">
                        {getCategoryName(income.category_id)}
                      </Badge>
                    )}
                    {income.account_id && (
                      <Badge variant="outline" className="text-sm">
                        {getAccountName(income.account_id)}
                      </Badge>
                    )}
                  </div>
                  
                  {income.notes && (
                    <p className="text-sm text-gray-600">{income.notes}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    R$ {parseFloat(income.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {incomes.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma receita cadastrada
            </h3>
            <p className="text-gray-600 mb-4">
              Comece cadastrando sua primeira receita para controlar melhor seus ganhos.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Cadastrar Primeira Receita
            </Button>
          </CardContent>
        </Card>
      )}
    </div>  
  );
};

export default Incomes;
