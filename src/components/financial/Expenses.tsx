
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, TrendingDown, Calendar, Edit, Trash2, Repeat } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Expenses = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState([
    { 
      id: 1, 
      description: 'Supermercado Pão de Açúcar', 
      amount: 280.50, 
      dueDate: '2024-06-20',
      account: 'Conta Corrente Principal',
      category: 'Alimentação',
      recurrence: 'Única',
      notes: 'Compras da semana'
    },
    { 
      id: 2, 
      description: 'Aluguel Apartamento', 
      amount: 1500.00, 
      dueDate: '2024-06-25',
      account: 'Conta Corrente Principal',
      category: 'Moradia',
      recurrence: 'Mensal',
      notes: 'Aluguel + taxas'
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    dueDate: '',
    account: '',
    category: '',
    recurrence: 'Única',
    notes: ''
  });

  // Mock data - em um app real, viria do estado global ou API
  const accounts = ['Conta Corrente Principal', 'Conta Poupança', 'Visa Gold', 'Mastercard Black'];
  const categories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Educação', 'Vestuário'];
  const recurrenceOptions = ['Única', 'Semanal', 'Quinzenal', 'Mensal', 'Anual'];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.description.trim() || !formData.amount || !formData.dueDate) {
      toast({
        title: "Erro",
        description: "Descrição, valor e data de vencimento são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const newExpense = {
      id: editingExpense ? editingExpense.id : Date.now(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      account: formData.account,
      category: formData.category,
      recurrence: formData.recurrence,
      notes: formData.notes
    };

    if (editingExpense) {
      setExpenses(expenses.map(exp => exp.id === editingExpense.id ? newExpense : exp));
      toast({
        title: "Sucesso",
        description: "Despesa atualizada com sucesso!"
      });
    } else {
      setExpenses([...expenses, newExpense]);
      toast({
        title: "Sucesso",
        description: "Despesa criada com sucesso!"
      });
    }

    setFormData({ 
      description: '', 
      amount: '', 
      dueDate: '', 
      account: '', 
      category: '', 
      recurrence: 'Única', 
      notes: '' 
    });
    setEditingExpense(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      dueDate: expense.dueDate,
      account: expense.account,
      category: expense.category,
      recurrence: expense.recurrence,
      notes: expense.notes
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
    toast({
      title: "Sucesso",
      description: "Despesa removida com sucesso!"
    });
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const thisMonthExpenses = expenses.filter(exp => {
    const expenseDate = new Date(exp.dueDate);
    const currentDate = new Date();
    return expenseDate.getMonth() === currentDate.getMonth() && 
           expenseDate.getFullYear() === currentDate.getFullYear();
  }).reduce((sum, exp) => sum + exp.amount, 0);

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
                  dueDate: '', 
                  account: '', 
                  category: '', 
                  recurrence: 'Única', 
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
                  <Label htmlFor="dueDate">Data de Vencimento *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account">Conta/Cartão</Label>
                  <Select value={formData.account} onValueChange={(value) => setFormData({...formData, account: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account} value={account}>{account}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
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
                <Button type="submit" className="flex-1">
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
                <p className="text-orange-100 mt-1">Junho 2024</p>
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
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(expense.dueDate).toLocaleDateString('pt-BR')}
                    </Badge>
                    {expense.recurrence !== 'Única' && (
                      <Badge className={`text-sm ${getRecurrenceColor(expense.recurrence)}`}>
                        <Repeat className="h-3 w-3 mr-1" />
                        {expense.recurrence}
                      </Badge>
                    )}
                    {expense.category && (
                      <Badge variant="secondary" className="text-sm">
                        {expense.category}
                      </Badge>
                    )}
                    {expense.account && (
                      <Badge variant="outline" className="text-sm">
                        {expense.account}
                      </Badge>
                    )}
                  </div>
                  
                  {expense.notes && (
                    <p className="text-sm text-gray-600">{expense.notes}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">
                    R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
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
