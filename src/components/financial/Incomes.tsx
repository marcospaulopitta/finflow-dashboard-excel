
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, TrendingUp, Calendar, Edit, Trash2, Repeat } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incomesService } from "@/services/incomesService";
import { bankAccountsService } from "@/services/bankAccountsService";
import { categoriesService } from "@/services/categoriesService";
import IncomeForm from './forms/IncomeForm';

const Incomes = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  // Filter incomes by selected month/year
  const filteredIncomes = incomes.filter(income => {
    const incomeDate = new Date(income.due_date);
    return incomeDate.getMonth() === selectedMonth && 
           incomeDate.getFullYear() === selectedYear;
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: incomesService.delete,
    onSuccess: () => {
      // Invalidate all related queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['incomes'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      toast({
        title: "Receita removida",
        description: "A receita foi removida com sucesso e o saldo da conta foi recalculado!"
      });
    },
    onError: (error: any) => {
      console.error('Erro ao remover receita:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover receita. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handleEdit = (income: any) => {
    setEditingIncome(income);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta receita?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleNewIncome = () => {
    setEditingIncome(null);
    setIsFormOpen(true);
  };

  const totalIncomes = filteredIncomes.reduce((sum, inc) => sum + Number(inc.amount), 0);

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

  // Safe methods to get account and category names with null/undefined/empty validation
  const getAccountName = (accountId: string | null | undefined) => {
    if (!accountId || accountId.trim() === '') {
      return 'Conta não especificada';
    }
    const account = accounts.find(acc => acc.id === accountId);
    return account ? `${account.name} - ${account.bank_name}` : 'Conta não encontrada';
  };

  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId || categoryId.trim() === '') {
      return 'Categoria não especificada';
    }
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria não encontrada';
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return year;
  });

  if (incomesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
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
            className="bg-green-600 hover:bg-green-700"
            onClick={handleNewIncome}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Receita
          </Button>
        </div>
      </div>

      {/* Warning message if no accounts or categories */}
      {(accounts.length === 0 || categories.length === 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-orange-800 font-medium">Atenção: Configuração incompleta</p>
                <p className="text-orange-700 text-sm">
                  {accounts.length === 0 && "É recomendado cadastrar ao menos uma conta bancária. "}
                  {categories.length === 0 && "É recomendado cadastrar ao menos uma categoria. "}
                  Isso permitirá uma melhor organização das suas receitas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total de Receitas - {months[selectedMonth]} {selectedYear}</p>
              <p className="text-3xl font-bold">
                R$ {totalIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-green-100 mt-1">{filteredIncomes.length} receita(s)</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <TrendingUp className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Incomes List */}
      <div className="space-y-4">
        {filteredIncomes.map((income) => (
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
                    {income.category_id && income.category_id.trim() !== '' && (
                      <Badge variant="secondary" className="text-sm">
                        {getCategoryName(income.category_id)}
                      </Badge>
                    )}
                    {income.account_id && income.account_id.trim() !== '' && (
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
                    R$ {Number(income.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIncomes.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma receita encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              Não há receitas cadastradas para {months[selectedMonth]} de {selectedYear}.
            </p>
            <Button onClick={handleNewIncome}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Cadastrar Receita
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Income Form */}
      <IncomeForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        editingIncome={editingIncome}
      />
    </div>  
  );
};

export default Incomes;
