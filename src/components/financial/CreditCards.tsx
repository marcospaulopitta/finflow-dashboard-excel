
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, CreditCard, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const CreditCards = () => {
  const { toast } = useToast();
  const [cards, setCards] = useState([
    { 
      id: 1, 
      name: 'Visa Gold', 
      brand: 'Visa', 
      limit: 5000, 
      closingDay: 15, 
      dueDay: 10,
      currentSpent: 1280.50
    },
    { 
      id: 2, 
      name: 'Mastercard Black', 
      brand: 'Mastercard', 
      limit: 10000, 
      closingDay: 20, 
      dueDay: 5,
      currentSpent: 2450.00
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    limit: '',
    closingDay: '',
    dueDay: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do cartão é obrigatório",
        variant: "destructive"
      });
      return;
    }

    const newCard = {
      id: editingCard ? editingCard.id : Date.now(),
      name: formData.name,
      brand: formData.brand,
      limit: parseFloat(formData.limit) || 0,
      closingDay: parseInt(formData.closingDay) || null,
      dueDay: parseInt(formData.dueDay) || null,
      currentSpent: editingCard ? editingCard.currentSpent : 0
    };

    if (editingCard) {
      setCards(cards.map(card => card.id === editingCard.id ? newCard : card));
      toast({
        title: "Sucesso",
        description: "Cartão atualizado com sucesso!"
      });
    } else {
      setCards([...cards, newCard]);
      toast({
        title: "Sucesso",
        description: "Cartão criado com sucesso!"
      });
    }

    setFormData({ name: '', brand: '', limit: '', closingDay: '', dueDay: '' });
    setEditingCard(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      brand: card.brand,
      limit: card.limit.toString(),
      closingDay: card.closingDay?.toString() || '',
      dueDay: card.dueDay?.toString() || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    setCards(cards.filter(card => card.id !== id));
    toast({
      title: "Sucesso",
      description: "Cartão removido com sucesso!"
    });
  };

  const totalLimit = cards.reduce((sum, card) => sum + card.limit, 0);
  const totalSpent = cards.reduce((sum, card) => sum + card.currentSpent, 0);
  const availableLimit = totalLimit - totalSpent;

  const getUsagePercentage = (spent, limit) => {
    if (limit === 0) return 0;
    return Math.min((spent / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Cartões de Crédito</h2>
          <p className="text-gray-600">Gerencie seus cartões de crédito</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                setEditingCard(null);
                setFormData({ name: '', brand: '', limit: '', closingDay: '', dueDay: '' });
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Novo Cartão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? 'Editar Cartão' : 'Novo Cartão de Crédito'}
              </DialogTitle>
              <DialogDescription>
                {editingCard ? 'Atualize os dados do cartão.' : 'Cadastre um novo cartão de crédito.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Cartão *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Visa Gold"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Bandeira</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  placeholder="Ex: Visa, Mastercard, Elo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit">Limite (R$)</Label>
                <Input
                  id="limit"
                  type="number"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) => setFormData({...formData, limit: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="closingDay">Dia Fechamento</Label>
                  <Input
                    id="closingDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.closingDay}
                    onChange={(e) => setFormData({...formData, closingDay: e.target.value})}
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDay">Dia Vencimento</Label>
                  <Input
                    id="dueDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dueDay}
                    onChange={(e) => setFormData({...formData, dueDay: e.target.value})}
                    placeholder="10"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCard ? 'Atualizar' : 'Criar Cartão'}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Limite Total</p>
                <p className="text-2xl font-bold">
                  R$ {totalLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Total Gasto</p>
                <p className="text-2xl font-bold">
                  R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-100" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Limite Disponível</p>
                <p className="text-2xl font-bold">
                  R$ {availableLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => {
          const usagePercentage = getUsagePercentage(card.currentSpent, card.limit);
          const usageColor = getUsageColor(usagePercentage);
          
          return (
            <Card key={card.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      {card.name}
                    </CardTitle>
                    {card.brand && (
                      <CardDescription className="mt-1">
                        {card.brand}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(card)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(card.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Limite Utilizado</span>
                    <span className="font-medium">
                      R$ {card.currentSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / 
                      R$ {card.limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${usageColor}`}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-right">
                    {usagePercentage.toFixed(1)}% utilizado
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {card.closingDay && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Fechamento</p>
                        <p className="font-medium">Dia {card.closingDay}</p>
                      </div>
                    </div>
                  )}
                  {card.dueDay && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Vencimento</p>
                        <p className="font-medium">Dia {card.dueDay}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Badge 
                    variant={card.limit - card.currentSpent >= 0 ? "default" : "destructive"}
                    className="text-sm"
                  >
                    Disponível: R$ {(card.limit - card.currentSpent).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {cards.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum cartão cadastrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece cadastrando seu primeiro cartão de crédito para controlar melhor seus gastos.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Cartão
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreditCards;
