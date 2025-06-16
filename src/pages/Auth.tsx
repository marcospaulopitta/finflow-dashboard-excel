
import React, { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

type AuthView = 'login' | 'register' | 'forgot-password';

const Auth = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const handleShowRegister = () => setCurrentView('register');
  const handleShowLogin = () => setCurrentView('login');
  const handleShowForgotPassword = () => setCurrentView('forgot-password');
  const handleAuthSuccess = () => {
    // A autenticação é gerenciada pelo useAuth hook
    // Não precisamos fazer nada aqui, o usuário será redirecionado automaticamente
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Controle Financeiro
          </h1>
          <p className="text-gray-600">
            Gerencie suas finanças de forma inteligente
          </p>
        </div>

        {/* Auth Forms */}
        {currentView === 'login' && (
          <LoginForm
            onShowRegister={handleShowRegister}
            onShowForgotPassword={handleShowForgotPassword}
            onLogin={handleAuthSuccess}
          />
        )}
        
        {currentView === 'register' && (
          <RegisterForm
            onShowLogin={handleShowLogin}
            onRegister={handleAuthSuccess}
          />
        )}
        
        {currentView === 'forgot-password' && (
          <ForgotPasswordForm
            onShowLogin={handleShowLogin}
          />
        )}
      </div>
    </div>
  );
};

export default Auth;
