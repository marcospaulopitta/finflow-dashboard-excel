import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Edit, TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { incomesService } from "@/services/incomesService";
import { expensesService } from "@/services/expensesService";
import { bankAccountsService } from "@/services/bankAccountsService";
import ExpenseForm from '@/components/financial/forms/ExpenseForm';
import IncomeForm from '@/components/financial/forms/IncomeForm';

const Extrato = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editingIncome, setEditingIncome] = useState<any>(null);

  // Fetch data
  const { data: incomes = [], isLoading: incomesLoading } = useQuery({
    queryKey: ['incomes'],
    queryFn: incomesService.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesService.getAll,
    staleTime: 5 * 60 * 1000,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['bank_accounts'],
    queryFn: bankAccountsService.getAll,
    staleTime: 1 * 60 * 1000,
  });

  // Filter by selected month and year
  const filteredIncomes = incomes.filter(income => {
    const incomeDate = new Date(income.due_date);
    return incomeDate.getMonth() === selectedMonth && 
           incomeDate.getFullYear() === selectedYear;
  });

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.due_date);
    return expenseDate.getMonth() === selectedMonth && 
           expenseDate.getFullYear() === selectedYear;
  });

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setExpenseFormOpen(true);
  };

  const handleEditIncome = (income: any) => {
    setEditingIncome(income);
    setIncomeFormOpen(true);
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i;
    return year;
  });

  // Loading state
  if (incomesLoading || expensesLoading) {
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
          <h2 className="text-3xl font-bold text-gray-900">Extrato</h2>
          <p className="text-gray-600">Registros detalhados de despesas e receitas</p>
        </div>
        
        <div className="flex gap-2 items-center">
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
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Registros do Mês Vigente</CardTitle>
          <CardDescription>
            Receitas e despesas de {months[selectedMonth]} de {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Incomes */}
            <div>
              <h4 className="text-lg font-semibold text-green-600 mb-3">Receitas</h4>
              {filteredIncomes.length > 0 ? (
                <div className="space-y-2">
                  {filteredIncomes.map((income) => (
                    <div key={income.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">{income.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(income.due_date).toLocaleDateString('pt-BR')}
                          {income.account_id && (
                            <span className="ml-2 text-blue-600">
                              • {accounts.find(acc => acc.id === income.account_id)?.name || 'Conta'}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-green-600">
                          R$ {Number(income.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditIncome(income)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma receita este mês</p>
              )}
            </div>

            {/* Expenses */}
            <div>
              <h4 className="text-lg font-semibold text-red-600 mb-3">Despesas</h4>
              {filteredExpenses.length > 0 ? (
                <div className="space-y-2">
                  {filteredExpenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(expense.due_date).toLocaleDateString('pt-BR')}
                          {expense.account_id && (
                            <span className="ml-2 text-blue-600">
                              • {accounts.find(acc => acc.id === expense.account_id)?.name || 'Conta'}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-red-600">
                          R$ {Number(expense.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditExpense(expense)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {expense.is_paid && (
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                            Pago
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma despesa este mês</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Form */}
      <ExpenseForm 
        open={expenseFormOpen} 
        onOpenChange={setExpenseFormOpen}
        editingExpense={editingExpense}
      />

      {/* Income Form */}
      <IncomeForm 
        open={incomeFormOpen} 
        onOpenChange={setIncomeFormOpen}
        editingIncome={editingIncome}
      />
    </div>
  );
};

export default Extrato;