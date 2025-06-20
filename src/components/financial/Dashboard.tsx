
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus, Minus, Edit } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { incomesService, expensesService, bankAccountsService } from "@/services/supabaseService";
import ExpenseForm from './forms/ExpenseForm';
import IncomeForm from './forms/IncomeForm';

const Dashboard = () => {
  const [chartType, setChartType] = useState('bar');
  const [period, setPeriod] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [incomeFormOpen, setIncomeFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [editingIncome, setEditingIncome] = useState<any>(null);

  const queryClient = useQueryClient();

  // Fetch data
  const { data: incomes = [] } = useQuery({
    queryKey: ['incomes'],
    queryFn: incomesService.getAll
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesService.getAll
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['bank_accounts'],
    queryFn: bankAccountsService.getAll
  });

  // Update expense mutation
  const updateExpenseMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => 
      expensesService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
      toast({
        title: "Despesa Paga",
        description: "A despesa foi marcada como paga e o valor foi deduzido da conta!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao pagar despesa: " + error.message,
        variant: "destructive"
      });
    }
  });

  // Update account balance mutation
  const updateAccountMutation = useMutation({
    mutationFn: ({ id, newBalance }: { id: string, newBalance: number }) => 
      bankAccountsService.update(id, { balance: newBalance }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank_accounts'] });
    }
  });

  // Calculate current month metrics
  const currentDate = new Date();
  const currentMonthIncomes = incomes.filter(income => {
    const incomeDate = new Date(income.due_date);
    return incomeDate.getMonth() === currentDate.getMonth() && 
           incomeDate.getFullYear() === currentDate.getFullYear();
  });

  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.due_date);
    return expenseDate.getMonth() === currentDate.getMonth() && 
           expenseDate.getFullYear() === currentDate.getFullYear();
  });

  const totalIncomes = currentMonthIncomes.reduce((sum, income) => sum + Number(income.amount), 0);
  const totalDebits = currentMonthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const totalPaid = currentMonthExpenses
    .filter(expense => expense.is_paid)
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  // Calculate adjusted bank account balances with income values added
  const adjustedAccountsBalance = useMemo(() => {
    const baseBalance = accounts.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0);
    
    // Add income values to their respective accounts
    const incomesByAccount = currentMonthIncomes.reduce((acc, income) => {
      if (income.account_id) {
        acc[income.account_id] = (acc[income.account_id] || 0) + Number(income.amount);
      }
      return acc;
    }, {} as Record<string, number>);

    // Calculate total income allocated to accounts
    const allocatedIncome = Object.values(incomesByAccount).reduce((sum, amount) => sum + amount, 0);
    
    // Add non-allocated income (incomes without account_id) to base balance
    const nonAllocatedIncome = totalIncomes - allocatedIncome;
    
    return baseBalance + totalIncomes;
  }, [accounts, currentMonthIncomes, totalIncomes]);

  const currentBalance = adjustedAccountsBalance;

  // Generate chart data for different periods
  const generateChartData = () => {
    const data = [];
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    for (let i = 0; i < 12; i++) {
      const monthIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.due_date);
        return incomeDate.getMonth() === i && incomeDate.getFullYear() === currentDate.getFullYear();
      }).reduce((sum, income) => sum + Number(income.amount), 0);

      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.due_date);
        return expenseDate.getMonth() === i && expenseDate.getFullYear() === currentDate.getFullYear();
      }).reduce((sum, expense) => sum + Number(expense.amount), 0);

      data.push({
        name: months[i],
        month: i,
        receitas: monthIncomes,
        despesas: monthExpenses
      });
    }
    return data;
  };

  const chartData = generateChartData();

  const categoryData = useMemo(() => {
    const categoryMap = new Map();
    currentMonthExpenses.forEach(expense => {
      const category = expense.category_id || 'Sem categoria';
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + Number(expense.amount));
    });

    const colors = ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d', '#fca5a5'];
    return Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  }, [currentMonthExpenses]);

  const handleChartClick = (data: any) => {
    if (data && data.month !== undefined) {
      setSelectedMonth(data.name);
      setReportDialogOpen(true);
    }
  };

  const handlePayExpense = async (expense: any) => {
    try {
      // Find the account to deduct from
      let targetAccount = null;
      if (expense.account_id) {
        targetAccount = accounts.find(acc => acc.id === expense.account_id);
      } else if (expense.credit_card_id) {
        // For credit card, we could implement different logic
        // For now, let's just mark as paid without account deduction
      }

      // Update expense as paid
      await updateExpenseMutation.mutateAsync({ 
        id: expense.id, 
        updates: { 
          is_paid: true, 
          paid_at: new Date().toISOString() 
        } 
      });

      // Deduct from account balance if applicable
      if (targetAccount) {
        const newBalance = Number(targetAccount.balance) - Number(expense.amount);
        await updateAccountMutation.mutateAsync({
          id: targetAccount.id,
          newBalance: newBalance
        });
      }

    } catch (error) {
      // Error handled by mutation
    }
  };

  const handlePostponeExpense = (expenseId: string) => {
    toast({
      title: "Adiar Despesa",
      description: "Funcionalidade de adiamento será implementada em breve."
    });
  };

  const handleEditExpense = (expense: any) => {
    setEditingExpense(expense);
    setExpenseFormOpen(true);
  };

  const handleEditIncome = (income: any) => {
    setEditingIncome(income);
    setIncomeFormOpen(true);
  };

  const openExpensesReport = () => {
    toast({
      title: "Relatório de Despesas",
      description: "Abrindo relatório de despesas do mês vigente..."
    });
  };

  const renderChart = () => {
    const chartProps = {
      data: chartData,
      onClick: handleChartClick,
      style: { cursor: 'pointer' }
    };

    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`R$ ${value}`, 'Valor']} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value}`, '']} />
              <Line type="monotone" dataKey="receitas" stroke="#16a34a" strokeWidth={2} />
              <Line type="monotone" dataKey="despesas" stroke="#dc2626" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value}`, '']} />
              <Bar dataKey="receitas" fill="#16a34a" />
              <Bar dataKey="despesas" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const stats = [
    {
      title: 'Total de Débitos',
      value: `R$ ${totalDebits.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: `${currentMonthExpenses.length} despesa(s)`,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      clickable: true,
      onClick: openExpensesReport
    },
    {
      title: 'Total Pago',
      value: `R$ ${totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: `${currentMonthExpenses.filter(e => e.is_paid).length} paga(s)`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      clickable: false
    },
    {
      title: 'Saldo Atual',
      value: `R$ ${currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: currentBalance >= 0 ? '+Positivo' : '-Negativo',
      icon: DollarSign,
      color: currentBalance >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: currentBalance >= 0 ? 'bg-blue-50' : 'bg-red-50',
      clickable: false
    },
    {
      title: 'Receitas do Mês',
      value: `R$ ${totalIncomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: `${currentMonthIncomes.length} receita(s)`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      clickable: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h2>
          <p className="text-gray-600">Visão geral das suas finanças</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Button 
            onClick={() => {
              setEditingExpense(null);
              setExpenseFormOpen(true);
            }}
            variant="outline"
            size="sm"
            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
          >
            <Minus className="h-4 w-4 mr-2" />
            Nova Despesa
          </Button>
          
          <Button 
            onClick={() => {
              setEditingIncome(null);
              setIncomeFormOpen(true);
            }}
            variant="outline"
            size="sm"
            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Receita
          </Button>
          
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="quinzenal">Quinzenal</SelectItem>
              <SelectItem value="bimestral">Bimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={chartType} onValueChange={setChartType}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Colunas</SelectItem>
              <SelectItem value="pie">Pizza</SelectItem>
              <SelectItem value="line">Linhas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card 
              key={index} 
              className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                stat.clickable ? 'cursor-pointer hover:bg-gray-50' : ''
              }`}
              onClick={stat.clickable ? stat.onClick : undefined}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.color} flex items-center mt-1`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-full`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Análise Financeira Personalizável</CardTitle>
          <CardDescription>
            Comparativo de receitas e despesas - Clique em um mês para ver detalhes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Current Month Records */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Registros do Mês Vigente</CardTitle>
          <CardDescription>
            Receitas e despesas de {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Incomes */}
            <div>
              <h4 className="text-lg font-semibold text-green-600 mb-3">Receitas</h4>
              {currentMonthIncomes.length > 0 ? (
                <div className="space-y-2">
                  {currentMonthIncomes.map((income) => (
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
                          R$ {Number(income.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
              {currentMonthExpenses.length > 0 ? (
                <div className="space-y-2">
                  {currentMonthExpenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{expense.description}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(expense.due_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-red-600">
                          R$ {Number(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        {!expense.is_paid && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handlePayExpense(expense)}
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

      {/* Month Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Relatório - {selectedMonth}</DialogTitle>
            <DialogDescription>
              Detalhes de receitas e despesas do mês selecionado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>Relatório detalhado do mês {selectedMonth} será exibido aqui.</p>
          </div>
        </DialogContent>
      </Dialog>

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

export default Dashboard;
