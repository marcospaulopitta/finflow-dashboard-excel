
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Building2, DollarSign, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const BankAccounts = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Conta Corrente Principal', bank: 'Banco do Brasil', balance: 5240.50 },
    { id: 2, name: 'Conta Poupança', bank: 'Caixa Econômica', balance: 12560.00 },
    { id: 3, name: 'Conta Salário', bank: 'Itaú', balance: 3200.00 },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    balance: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da conta é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const newAccount = {
      id: editingAccount ? editingAccount.id : Date.now(),
      name: formData.name,
      bank: formData.bank,
      balance: parseFloat(formData.balance) || 0
    };

    if (editingAccount) {
      setAccounts(accounts.map(acc => acc.id === editingAccount.id ? newAccount : acc));
      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso!"
      });
    } else {
      setAccounts([...accounts, newAccount]);
      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso!"
      });
    }

    setFormData({ name: '', bank: '', balance: '' });
    setEditingAccount(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      bank: account.bank,
      balance: account.balance.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    setAccounts(accounts.filter(acc => acc.id !== id));
    toast({
      title: "Sucesso",
      description: "Conta removida com sucesso!"
    });
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

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
                setFormData({ name: '', bank: '', balance: '' });
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
                <Label htmlFor="bank">Banco</Label>
                <Input
                  id="bank"
                  value={formData.bank}
                  onChange={(e) => setFormData({...formData, bank: e.target.value})}
                  placeholder="Ex: Banco do Brasil"
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
                <Button type="submit" className="flex-1">
                  {editingAccount ? 'Atualizar' : 'Criar Conta'}
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
                  {account.bank && (
                    <CardDescription className="flex items-center mt-1">
                      <Building2 className="h-4 w-4 mr-1" />
                      {account.bank}
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
                    variant={account.balance >= 0 ? "default" : "destructive"}
                    className="text-base font-semibold px-3 py-1"
                  >
                    R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
