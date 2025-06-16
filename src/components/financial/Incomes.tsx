
import React, { useState } from 'react';
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

const Incomes = () => {
  const { toast } = useToast();
  const [incomes, setIncomes] = useState([
    { 
      id: 1, 
      description: 'Salário Empresa XYZ', 
      amount: 5000.00, 
      dueDate: '2024-06-30',
      account: 'Conta Corrente Principal',
      category: 'Salário',
      recurrence: 'Mensal',
      notes: 'Salário líquido'
    },
    { 
      id: 2, 
      description: 'Freelance Design', 
      amount: 800.00, 
      dueDate: '2024-06-15',
      account: 'Conta Corrente Principal',
      category: 'Freelance',
      recurrence: 'Única',
      notes: 'Projeto de identidade visual'
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
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
  const accounts = ['Conta Corrente Principal', 'Conta Poupança', 'Conta Salário'];
  const categories = ['Salário', 'Freelance', 'Investimentos', 'Vendas', 'Aluguéis',  'Outros'];
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

    const newIncome = {
      id: editingIncome ? editingIncome.id : Date.now(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      account: formData.account,
      category: formData.category,
      recurrence: formData.recurrence,
      notes: formData.notes
    };

    if (editingIncome) {
      setIncomes(incomes.map(inc => inc.id === editingIncome.id ? newIncome : inc));
      toast({
        title: "Sucesso",
        description: "Receita atualizada com sucesso!"
      });
    } else {
      setIncomes([...incomes, newIncome]);
      toast({
        title: "Sucesso",
        description: "Receita criada com sucesso!"
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
    setEditingIncome(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setFormData({
      description: income.description,
      amount: income.amount.toString(),
      dueDate: income.dueDate,
      account: income.account,
      category: income.category,
      recurrence: income.recurrence,
      notes: income.notes
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    setIncomes(incomes.filter(inc => inc.id !== id));
    toast({
      title: "Sucesso",
      description: "Receita removida com sucesso!"
    });
  };

  const totalIncomes = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const thisMonthIncomes = incomes.filter(inc => {
    const incomeDate = new Date(inc.dueDate);
    const currentDate = new Date();
    return incomeDate.getMonth() === currentDate.getMonth() && 
           incomeDate.getFullYear() === currentDate.getFullYear();
  }).reduce((sum, inc) => sum + inc.amount, 0);

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
                  dueDate: '', 
                  account: '', 
                  category: '', 
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
                  <Label htmlFor="dueDate">Data de Recebimento *</Label>
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
                  <Label htmlFor="account">Conta</Label>
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
                <p className="text-blue-100 mt-1">Junho 2024</p>
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
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="outline" className="text-sm">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(income.dueDate).toLocaleDateString('pt-BR')}
                    </Badge>
                    {income.recurrence !== 'Única' && (
                      <Badge className={`text-sm ${getRecurrenceColor(income.recurrence)}`}>
                        <Repeat className="h-3 w-3 mr-1" />
                        {income.recurrence}
                      </Badge>
                    )}
                    {income.category && (
                      <Badge variant="secondary" className="text-sm">
                        {income.category}
                      </Badge>
                    )}
                    {income.account && (
                      <Badge variant="outline" className="text-sm">
                        {income.account}
                      </Badge>
                    )}
                  </div>
                  
                  {income.notes && (
                    <p className="text-sm text-gray-600">{income.notes}</p>
                  )}
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    R$ {income.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
