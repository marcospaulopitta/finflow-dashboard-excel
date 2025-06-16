
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Calendar, Filter } from 'lucide-react';

const Dashboard = () => {
  const [chartType, setChartType] = useState('bar');
  const [period, setPeriod] = useState('month');

  // Mock data - em um app real, viria do backend
  const expenseData = [
    { name: 'Jan', despesas: 2400, receitas: 3200 },
    { name: 'Fev', despesas: 1398, receitas: 2800 },
    { name: 'Mar', despesas: 2800, receitas: 3500 },
    { name: 'Abr', despesas: 3908, receitas: 4200 },
    { name: 'Mai', despesas: 4800, receitas: 5100 },
    { name: 'Jun', despesas: 3800, receitas: 4300 },
  ];

  const categoryData = [
    { name: 'Alimentação', value: 1200, color: '#8884d8' },
    { name: 'Transporte', value: 800, color: '#82ca9d' },
    { name: 'Moradia', value: 2000, color: '#ffc658' },
    { name: 'Lazer', value: 600, color: '#ff7300' },
    { name: 'Saúde', value: 400, color: '#00ff00' },
  ];

  const stats = [
    {
      title: 'Receitas do Mês',
      value: 'R$ 5.240,00',
      change: '+12%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Despesas do Mês',
      value: 'R$ 3.680,00',
      change: '-5%',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Saldo Atual',
      value: 'R$ 12.560,00',
      change: '+8%',
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Gastos no Cartão',
      value: 'R$ 1.280,00',
      change: '+3%',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const renderChart = () => {
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
            <LineChart data={expenseData}>
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
            <BarChart data={expenseData}>
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Financeiro</h2>
          <p className="text-gray-600">Visão geral das suas finanças</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
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
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.color} flex items-center mt-1`}>
                      {stat.change}
                      <span className="text-gray-600 ml-1">vs último período</span>
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
          <CardTitle>Análise Financeira</CardTitle>
          <CardDescription>
            Comparativo de receitas e despesas por período
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <TrendingDown className="h-4 w-4 mr-2" />
              Nova Despesa
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Nova Receita
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Novo Cartão
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Próximos Vencimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-red-900">Cartão Visa</p>
                  <p className="text-sm text-red-600">Vencimento em 3 dias</p>
                </div>
                <p className="font-bold text-red-600">R$ 1.280,00</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-900">Aluguel</p>
                  <p className="text-sm text-yellow-600">Vencimento em 5 dias</p>
                </div>
                <p className="font-bold text-yellow-600">R$ 1.500,00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
