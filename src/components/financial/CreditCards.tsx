
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, CreditCard, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { creditCardsService } from "@/services/creditCardsService";
import CreditCardForm from "./forms/CreditCardForm";

const CreditCards = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  
  const queryClient = useQueryClient();

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['credit_cards'],
    queryFn: creditCardsService.getAll
  });

  const deleteCardMutation = useMutation({
    mutationFn: creditCardsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
      toast({
        title: "Sucesso",
        description: "Cartão removido com sucesso!"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao remover cartão: " + error.message,
        variant: "destructive"
      });
    }
  });

  const handleEdit = (card) => {
    setEditingCard(card);
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    deleteCardMutation.mutate(id);
  };

  const handleNewCard = () => {
    setEditingCard(null);
    setIsDialogOpen(true);
  };

  const totalLimit = cards.reduce((sum, card) => sum + (card.limit_amount || 0), 0);
  const totalSpent = cards.reduce((sum, card) => sum + (card.current_balance || 0), 0);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando cartões...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Cartões de Crédito</h2>
          <p className="text-gray-600">Gerencie seus cartões de crédito</p>
        </div>
        
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={handleNewCard}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Novo Cartão
        </Button>
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
          const usagePercentage = getUsagePercentage(card.current_balance || 0, card.limit_amount || 0);
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
                    <CardDescription className="mt-1">
                      {card.bank_name}
                      {card.card_brands && (
                        <span className="ml-2 text-sm font-medium">
                          • {card.card_brands.display_name}
                        </span>
                      )}
                    </CardDescription>
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
                      disabled={deleteCardMutation.isPending}
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
                      R$ {(card.current_balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / 
                      R$ {(card.limit_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  {card.due_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Vencimento</p>
                        <p className="font-medium">Dia {card.due_date}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <Badge 
                    variant={(card.limit_amount || 0) - (card.current_balance || 0) >= 0 ? "default" : "destructive"}
                    className="text-sm"
                  >
                    Disponível: R$ {((card.limit_amount || 0) - (card.current_balance || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
            <Button onClick={handleNewCard}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Cadastrar Primeiro Cartão
            </Button>
          </CardContent>
        </Card>
      )}

      <CreditCardForm 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingCard={editingCard}
      />
    </div>
  );
};

export default CreditCards;
