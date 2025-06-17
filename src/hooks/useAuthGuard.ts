
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export const useAuthGuard = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar esta funcionalidade.",
        variant: "destructive",
      });
    }
  }, [user, loading]);

  return { user, loading, isAuthenticated: !!user };
};
