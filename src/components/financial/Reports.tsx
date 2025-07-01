
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, Download, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { incomesService } from "@/services/incomesService";
import { expensesService } from "@/services/expensesService";

const Reports = () => {
  const [filters, setFilters] = useState({
    name: '',
    minValue: '',
    maxValue: '',
    month: 'all',
    year: new Date().getFullYear().toString()
  });

  // Fetch data
  const { data: incomes = [] } = useQuery({
    queryKey: ['incomes'],
    queryFn: incomesService.getAll
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesService.getAll
  });

  // Filter data based on current filters
  const filteredIncomes = React.useMemo(() => {
    return incomes.filter(income => {
      const incomeDate = new Date(income.due_date);
      
      // Name filter
      if (filters.name && !income.description.toLowerCase().includes(filters.name.toLowerCase())) return false;
      
      // Value filter
      if (filters.minValue && Number(income.amount) < Number(filters.minValue)) return false;
      if (filters.maxValue && Number(income.amount) > Number(filters.maxValue)) return false;
      
      // Month filter - adjusted to handle "all" value
      if (filters.month !== 'all' && incomeDate.getMonth() !== Number(filters.month) - 1) return false;
      
      // Year filter
      if (filters.year && incomeDate.getFullYear() !== Number(filters.year)) return false;
      
      return true;
    }).sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
  }, [incomes, filters]);

  const filteredExpenses = React.useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.due_date);
      
      // Name filter
      if (filters.name && !expense.description.toLowerCase().includes(filters.name.toLowerCase())) return false;
      
      // Value filter
      if (filters.minValue && Number(expense.amount) < Number(filters.minValue)) return false;
      if (filters.maxValue && Number(expense.amount) > Number(filters.maxValue)) return false;
      
      // Month filter - adjusted to handle "all" value
      if (filters.month !== 'all' && expenseDate.getMonth() !== Number(filters.month) - 1) return false;
      
      // Year filter
      if (filters.year && expenseDate.getFullYear() !== Number(filters.year)) return false;
      
      return true;
    }).sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
  }, [expenses, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      minValue: '',
      maxValue: '',
      month: 'all',
      year: new Date().getFullYear().toString()
    });
  };

  const exportReport = () => {
    console.log('Exporting report...');
  };

  // Calculate totals
  const totalIncomes = filteredIncomes.reduce((sum, income) => sum + Number(income.amount), 0);
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const monthBalance = totalIncomes - totalExpenses;

  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Relatórios</h2>
          <p className="text-gray-600">Análise detalhada das suas transações financeiras</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={clearFilters}>
            Limpar Filtros
          </Button>
          <Button onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome/Descrição</Label>
              <Input
                id="name"
                placeholder="Buscar por nome..."
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minValue">Valor Mínimo</Label>
              <Input
                id="minValue"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.minValue}
                onChange={(e) => handleFilterChange('minValue', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxValue">Valor Máximo</Label>
              <Input
                id="maxValue"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={filters.maxValue}
                onChange={(e) => handleFilterChange('maxValue', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Mês</Label>
              <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os meses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os meses</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ano</Label>
              <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table with Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses Column */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="h-5 w-5" />
              Despesas ({filteredExpenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredExpenses.map((expense) => (
                <div 
                  key={expense.id}
                  className="p-3 rounded-lg border-l-4 border-red-500 bg-red-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{expense.description}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(expense.due_date).toLocaleDateString('pt-BR')}
                      </p>
                      {expense.notes && (
                        <p className="text-sm text-gray-500 mt-1">{expense.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        -R$ {Number(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredExpenses.length === 0 && (
                <div className="text-center py-8">
                  <TrendingDown className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Nenhuma despesa encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Incomes Column */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Receitas ({filteredIncomes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredIncomes.map((income) => (
                <div 
                  key={income.id}
                  className="p-3 rounded-lg border-l-4 border-green-500 bg-green-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{income.description}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(income.due_date).toLocaleDateString('pt-BR')}
                      </p>
                      {income.notes && (
                        <p className="text-sm text-gray-500 mt-1">{income.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        +R$ {Number(income.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredIncomes.length === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Nenhuma receita encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer with Totals */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total de Débitos</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total de Receitas</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Saldo do Mês</p>
              <p className={`text-2xl font-bold ${monthBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthBalance >= 0 ? '+' : ''}R$ {Math.abs(monthBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
