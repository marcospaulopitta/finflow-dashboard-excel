
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, CreditCard, Banknote, TrendingDown, TrendingUp, BarChart3, LogOut, FileText, User, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/hooks/use-toast";
import Dashboard from '@/components/financial/Dashboard';
import BankAccounts from '@/components/financial/BankAccounts';
import CreditCards from '@/components/financial/CreditCards';
import Expenses from '@/components/financial/Expenses';
import Incomes from '@/components/financial/Incomes';
import Reports from '@/components/financial/Reports';
import Settings from '@/components/financial/Settings';
import Profile from '@/components/financial/Profile';
import Extrato from '@/pages/Extrato';

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
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Apply theme to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast({
      title: "Tema alterado",
      description: `Tema ${newDarkMode ? 'escuro' : 'claro'} ativado`,
    });
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, component: Dashboard },
    { id: 'extrato', label: 'Extrato', icon: FileText, component: Extrato },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, component: Reports },
    { id: 'accounts', label: 'Contas Bancárias', icon: PieChart, component: BankAccounts },
    { id: 'cards', label: 'Cartões de Crédito', icon: CreditCard, component: CreditCards },
    { id: 'expenses', label: 'Despesas', icon: TrendingDown, component: Expenses },
    { id: 'incomes', label: 'Receitas', icon: TrendingUp, component: Incomes },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Sistema de Controle Financeiro
            </h1>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Gerencie suas finanças pessoais de forma inteligente e organizada
            </p>
          </div>
          
          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleTheme}
              className={darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : ''}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab('profile')}
              className={darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : ''}
            >
              <User className="h-4 w-4 mr-2" />
              Perfil
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setActiveTab('settings')}
              className={darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : ''}
            >
              Configurações
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className={`flex items-center gap-2 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : ''}`}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Card className={`shadow-2xl border-0 backdrop-blur-sm ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'}`}>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Tab Navigation */}
              <TabsList className={`grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-7 p-2 rounded-t-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50/50'}`}>
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive 
                          ? `${darkMode ? 'bg-gray-600 shadow-sm text-white' : 'bg-white shadow-sm text-gray-900'} data-[state=active]:${darkMode ? 'bg-gray-600' : 'bg-white'}` 
                          : `${darkMode ? 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200' : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'}`
                      }`}
                    >
                      <IconComponent className={`h-4 w-4 ${isActive ? (darkMode ? 'text-blue-400' : 'text-blue-600') : (darkMode ? 'text-gray-400' : 'text-gray-500')}`} />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* Tab Content */}
              <div className={`p-6 ${darkMode ? 'bg-gray-800 text-white' : ''}`}>
                {tabs.map((tab) => {
                  const ComponentToRender = tab.component;
                  return (
                    <TabsContent key={tab.id} value={tab.id} className="mt-0">
                      {tab.id === 'dashboard' ? (
                        <ComponentToRender setActiveTab={setActiveTab} />
                      ) : (
                        <ComponentToRender />
                      )}
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
