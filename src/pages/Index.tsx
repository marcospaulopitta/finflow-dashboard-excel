
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Dashboard from '@/components/financial/Dashboard';
import BankAccounts from '@/components/financial/BankAccounts';
import CreditCards from '@/components/financial/CreditCards';
import Expenses from '@/components/financial/Expenses';
import Incomes from '@/components/financial/Incomes';
import Reports from '@/components/financial/Reports';
import Settings from '@/components/financial/Settings';
import Profile from '@/components/financial/Profile';
import { PieChart, CreditCard, Banknote, TrendingDown, TrendingUp, BarChart3, LogOut, FileText, Settings as SettingsIcon, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao fazer logout. Tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com sucesso.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    toast({
      title: "Tema alterado",
      description: `Tema ${!darkMode ? 'escuro' : 'claro'} ativado`,
    });
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, component: Dashboard },
    { id: 'reports', label: 'Relatórios', icon: FileText, component: Reports },
    { id: 'accounts', label: 'Contas Bancárias', icon: PieChart, component: BankAccounts },
    { id: 'cards', label: 'Cartões de Crédito', icon: CreditCard, component: CreditCards },
    { id: 'expenses', label: 'Despesas', icon: TrendingDown, component: Expenses },
    { id: 'incomes', label: 'Receitas', icon: TrendingUp, component: Incomes },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Sistema de Controle Financeiro
            </h1>
            <p className="text-lg text-gray-600">
              Gerencie suas finanças pessoais de forma inteligente e organizada
            </p>
          </div>
          
          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleTheme}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab('profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Perfil
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Configurações Gerais
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
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
                
                {/* Settings Tab */}
                <TabsContent value="settings" className="mt-0">
                  <Settings />
                </TabsContent>
                
                {/* Profile Tab */}
                <TabsContent value="profile" className="mt-0">
                  <Profile />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
