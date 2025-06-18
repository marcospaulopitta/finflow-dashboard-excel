
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, Download, Search } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { incomesService, expensesService } from "@/services/supabaseService";

const Reports = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    name: '',
    minValue: '',
    maxValue: '',
    month: '',
    year: new Date().getFullYear().toString(),
    type: 'all'
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
  const filteredData = React.useMemo(() => {
    let allData = [];
    
    if (filters.type === 'all' || filters.type === 'incomes') {
      const filteredIncomes = incomes.map(income => ({
        ...income,
        type: 'income',
        typeName: 'Receita'
      }));
      allData.push(...filteredIncomes);
    }
    
    if (filters.type === 'all' || filters.type === 'expenses') {
      const filteredExpenses = expenses.map(expense => ({
        ...expense,
        type: 'expense',
        typeName: 'Despesa'
      }));
      allData.push(...filteredExpenses);
    }

    return allData.filter(item => {
      const itemDate = new Date(item.due_date);
      
      // Date filter
      if (filters.startDate && itemDate < new Date(filters.startDate)) return false;
      if (filters.endDate && itemDate > new Date(filters.endDate)) return false;
      
      // Name filter
      if (filters.name && !item.description.toLowerCase().includes(filters.name.toLowerCase())) return false;
      
      // Value filter
      if (filters.minValue && Number(item.amount) < Number(filters.minValue)) return false;
      if (filters.maxValue && Number(item.amount) > Number(filters.maxValue)) return false;
      
      // Month filter
      if (filters.month && itemDate.getMonth() !== Number(filters.month) - 1) return false;
      
      // Year filter
      if (filters.year && itemDate.getFullYear() !== Number(filters.year)) return false;
      
      return true;
    }).sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());
  }, [incomes, expenses, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      name: '',
      minValue: '',
      maxValue: '',
      month: '',
      year: new Date().getFullYear().toString(),
      type: 'all'
    });
  };

  const exportReport = () => {
    // Here you would implement the export functionality
    console.log('Exporting report...', filteredData);
  };

  const totalValue = filteredData.reduce((sum, item) => {
    return sum + (item.type === 'income' ? Number(item.amount) : -Number(item.amount));
  }, 0);

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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            {/* Name Filter */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome/Descrição</Label>
              <Input
                id="name"
                placeholder="Buscar por nome..."
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
            </div>

            {/* Value Range */}
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

            {/* Month and Year */}
            <div className="space-y-2">
              <Label>Mês</Label>
              <Select value={filters.month} onValueChange={(value) => handleFilterChange('month', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os meses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os meses</SelectItem>
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

            {/* Type Filter */}
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="incomes">Receitas</SelectItem>
                  <SelectItem value="expenses">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total de Registros</p>
              <p className="text-2xl font-bold">{filteredData.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Saldo do Período</p>
              <p className={`text-2xl font-bold ${totalValue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {Math.abs(totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Receitas vs Despesas</p>
              <p className="text-lg">
                <span className="text-green-600">
                  {filteredData.filter(item => item.type === 'income').length}
                </span>
                {' / '}
                <span className="text-red-600">
                  {filteredData.filter(item => item.type === 'expense').length}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Resultados ({filteredData.length} registros)</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length > 0 ? (
            <div className="space-y-3">
              {filteredData.map((item) => (
                <div 
                  key={`${item.type}-${item.id}`} 
                  className={`p-4 rounded-lg border-l-4 ${
                    item.type === 'income' 
                      ? 'bg-green-50 border-green-500' 
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.typeName}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(item.due_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{item.description}</h4>
                      {item.notes && (
                        <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        item.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.type === 'expense' ? '-' : '+'}R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-gray-600">
                Tente ajustar os filtros para encontrar os dados desejados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
