
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Dashboard from '@/components/financial/Dashboard';
import BankAccounts from '@/components/financial/BankAccounts';
import CreditCards from '@/components/financial/CreditCards';
import Expenses from '@/components/financial/Expenses';
import Incomes from '@/components/financial/Incomes';
import Categories from '@/components/financial/Categories';
import { PieChart, CreditCard, Banknote, TrendingDown, TrendingUp, Tags, BarChart3 } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Resumo Geral', icon: BarChart3, component: Dashboard },
    { id: 'accounts', label: 'Contas Bancárias', icon: PieChart, component: BankAccounts },
    { id: 'cards', label: 'Cartões de Crédito', icon: CreditCard, component: CreditCards },
    { id: 'expenses', label: 'Despesas', icon: TrendingDown, component: Expenses },
    { id: 'incomes', label: 'Receitas', icon: TrendingUp, component: Incomes },
    { id: 'categories', label: 'Categorias', icon: Tags, component: Categories },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistema de Controle Financeiro
          </h1>
          <p className="text-lg text-gray-600">
            Gerencie suas finanças pessoais de forma inteligente e organizada
          </p>
        </div>

        {/* Main Content */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab Navigation */}
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 bg-gray-50/50 p-2 rounded-t-lg">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all duration-200 hover:bg-white/50"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Tab Content */}
              <div className="p-6">
                {tabs.map((tab) => {
                  const ComponentToRender = tab.component;
                  return (
                    <TabsContent key={tab.id} value={tab.id} className="mt-0">
                      <ComponentToRender />
                    </TabsContent>
                  );
                })}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
