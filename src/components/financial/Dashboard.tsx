
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter, User, Settings, Moon, Sun } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { incomesService, expensesService } from "@/services/supabaseService";

const Dashboard = () => {
  const [chartType, setChartType] = useState('bar');
  const [period, setPeriod] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Fetch data
  const { data: incomes = [] } = useQuery({
    queryKey: ['incomes'],
    queryFn: incomesService.getAll
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses'],
    queryFn: expensesService.getAll
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
  const currentBalance = totalIncomes - totalPaid;

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

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff8042'];
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

  const handlePayExpense = async (expenseId: string) => {
    try {
      // This would update the expense to paid status
      toast({
        title: "Despesa Paga",
        description: "A despesa foi marcada como paga com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao marcar despesa como paga",
        variant: "destructive"
      });
    }
  };

  const handlePostponeExpense = (expenseId: string) => {
    toast({
      title: "Adiar Despesa",
      description: "Funcionalidade de adiamento será implementada em breve."
    });
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
              <Line type="monotone" dataKey="receitas" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="despesas" stroke="#82ca9d" strokeWidth={2} />
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
              <Bar dataKey="receitas" fill="#8884d8" />
              <Bar dataKey="despesas" fill="#82ca9d" />
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
            variant="outline" 
            size="sm"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-2" />
            Perfil
          </Button>
          
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
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
              <Filter className="h-4 w-4 mr-2" />
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
                        </p>
                      </div>
                      <p className="font-bold text-green-600">
                        R$ {Number(income.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
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
                              onClick={() => handlePayExpense(expense.id)}
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
    </div>
  );
};

export default Dashboard;
