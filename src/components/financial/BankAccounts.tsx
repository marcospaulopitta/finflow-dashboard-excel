import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Building2, DollarSign, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { bankAccountsService } from '@/services/supabaseService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const BankAccounts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    bank_name: '',
    balance: '',
    account_type: ''
  });

  // Fetch bank accounts
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['bankAccounts'],
    queryFn: bankAccountsService.getAll,
  });

  // Create bank account mutation
  const createMutation = useMutation({
    mutationFn: bankAccountsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso!"
      });
      setFormData({ name: '', bank_name: '', balance: '', account_type: '' });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error creating bank account:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar conta. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Update bank account mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => bankAccountsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso!"
      });
      setFormData({ name: '', bank_name: '', balance: '', account_type: '' });
      setEditingAccount(null);
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error updating bank account:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar conta. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Delete bank account mutation
  const deleteMutation = useMutation({
    mutationFn: bankAccountsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast({
        title: "Sucesso",
        description: "Conta removida com sucesso!"
      });
    },
    onError: (error) => {
      console.error('Error deleting bank account:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover conta. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da conta é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const accountData = {
      name: formData.name,
      bank_name: formData.bank_name,
      balance: parseFloat(formData.balance) || 0,
      account_type: formData.account_type || 'Conta Corrente'
    };

    if (editingAccount) {
      updateMutation.mutate({
        id: editingAccount.id,
        updates: accountData
      });
    } else {
      createMutation.mutate(accountData);
    }
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      bank_name: account.bank_name || '',
      balance: account.balance?.toString() || '',
      account_type: account.account_type || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover esta conta?')) {
      deleteMutation.mutate(id);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Carregando contas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Contas Bancárias</h2>
          <p className="text-gray-600">Gerencie suas contas bancárias</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setEditingAccount(null);
                setFormData({ name: '', bank_name: '', balance: '', account_type: '' });
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Editar Conta' : 'Nova Conta Bancária'}
              </DialogTitle>
              <DialogDescription>
                {editingAccount ? 'Atualize os dados da conta bancária.' : 'Cadastre uma nova conta bancária.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Conta *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Conta Corrente Principal"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_name">Banco</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
                  placeholder="Ex: Banco do Brasil"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account_type">Tipo de Conta</Label>
                <Input
                  id="account_type"
                  value={formData.account_type}
                  onChange={(e) => setFormData({...formData, account_type: e.target.value})}
                  placeholder="Ex: Conta Corrente, Poupança"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">Saldo Atual (R$)</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({...formData, balance: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? 'Salvando...' 
                    : editingAccount ? 'Atualizar' : 'Criar Conta'
                  }
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Saldo Total</p>
              <p className="text-3xl font-bold">
                R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-blue-100 mt-1">{accounts.length} conta(s) cadastrada(s)</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <DollarSign className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <Card key={account.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{account.name}</CardTitle>
                  {account.bank_name && (
                    <CardDescription className="flex items-center mt-1">
                      <Building2 className="h-4 w-4 mr-1" />
                      {account.bank_name}
                    </CardDescription>
                  )}
                  {account.account_type && (
                    <CardDescription className="mt-1">
                      {account.account_type}
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(account)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(account.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Saldo Atual</span>
                  <Badge 
                    variant={parseFloat(account.balance) >= 0 ? "default" : "destructive"}
                    className="text-base font-semibold px-3 py-1"
                  >
                    R$ {parseFloat(account.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma conta cadastrada
            </h3>
            <p className="text-gray-600 mb-4">
              Comece cadastrando sua primeira conta bancária para controlar melhor suas finanças.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Cadastrar Primeira Conta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BankAccounts;
