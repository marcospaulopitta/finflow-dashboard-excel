import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, TrendingDown, Calendar, Edit, Trash2, Repeat, CreditCard } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesService } from "@/services/expensesService";
import { bankAccountsService } from "@/services/bankAccountsService";
import { creditCardsService } from "@/services/creditCardsService";
import { categoriesService } from "@/services/categoriesService";
import ExpenseForm from './forms/ExpenseForm';

const Expenses = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  // Filter expenses by selected month/year
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.due_date);
    return expenseDate.getMonth() === selectedMonth && 
           expenseDate.getFullYear() === selectedYear;
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => 
      expensesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Sucesso",
        description: "Despesa atualizada com sucesso!"
      });
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

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handlePayExpense = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ 
        id, 
        updates: { 
          is_paid: true, 
          paid_at: new Date().toISOString() 
        } 
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handlePostponeExpense = (id: string) => {
    // Implementation for postponing expense
    toast({
      title: "Adiar Despesa",
      description: "Funcionalidade de adiamento será implementada em breve."
    });
  };

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return year;
  });

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
        
        <div className="flex gap-2 items-center">
          {/* Month/Year Selector */}
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
              setEditingExpense(null);
              setIsFormOpen(true);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Despesa
          </Button>
        </div>
      </div>

      {/* Total Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-red-500 to-red-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Total de Despesas - {months[selectedMonth]} {selectedYear}</p>
              <p className="text-3xl font-bold">
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-red-100 mt-1">{filteredExpenses.length} despesa(s)</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <TrendingDown className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.map((expense) => (
          <Card key={expense.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{expense.description}</h3>
                    <div className="flex gap-1 ml-4">
                      {!expense.is_paid && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePayExpense(expense.id)}
                            className="text-green-600 hover:bg-green-50"
                          >
                            Pagar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePostponeExpense(expense.id)}
                          >
                            Adiar
                          </Button>
                        </>
                      )}
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

      {filteredExpenses.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <TrendingDown className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma despesa encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              Não há despesas cadastradas para {months[selectedMonth]} de {selectedYear}.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Cadastrar Despesa
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Expense Form */}
      <ExpenseForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        editingExpense={editingExpense}
      />
    </div>
  );
};

export default Expenses;
