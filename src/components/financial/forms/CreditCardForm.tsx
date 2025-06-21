
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { creditCardsService, cardBrandsService } from "@/services/supabaseService";

interface CreditCardFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingCard?: any;
}

const CreditCardForm = ({ open, onOpenChange, editingCard }: CreditCardFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    bank_name: '',
    brand_id: '',
    limit_amount: '',
    due_date: ''
  });

  const queryClient = useQueryClient();

  const { data: cardBrands = [] } = useQuery({
    queryKey: ['card_brands'],
    queryFn: cardBrandsService.getAll
  });

  const createCardMutation = useMutation({
    mutationFn: creditCardsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
      toast({
        title: "Cartão criado",
        description: "O cartão foi adicionado com sucesso!"
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao criar cartão: " + error.message,
        variant: "destructive"
      });
    }
  });

  const updateCardMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string, updates: any }) => 
      creditCardsService.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credit_cards'] });
      toast({
        title: "Cartão atualizado",
        description: "O cartão foi atualizado com sucesso!"
      });
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar cartão: " + error.message,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    if (editingCard) {
      setFormData({
        name: editingCard.name,
        bank_name: editingCard.bank_name,
        brand_id: editingCard.brand_id?.toString() || '',
        limit_amount: editingCard.limit_amount?.toString() || '',
        due_date: editingCard.due_date?.toString() || ''
      });
    }
  }, [editingCard]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.bank_name || !formData.limit_amount || !formData.due_date) {
      toast({
        title: "Erro",
        description: "Nome, banco, limite e dia de vencimento são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const cardData = {
      name: formData.name,
      bank_name: formData.bank_name,
      brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
      limit_amount: parseFloat(formData.limit_amount),
      due_date: parseInt(formData.due_date)
    };

    if (editingCard) {
      updateCardMutation.mutate({ id: editingCard.id, updates: cardData });
    } else {
      createCardMutation.mutate(cardData);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      bank_name: '',
      brand_id: '',
      limit_amount: '',
      due_date: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Label htmlFor="bank_name">Banco *</Label>
            <Input
              id="bank_name"
              value={formData.bank_name}
              onChange={(e) => setFormData({...formData, bank_name: e.target.value})}
              placeholder="Ex: Nubank"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Bandeira</Label>
            <Select value={formData.brand_id} onValueChange={(value) => setFormData({...formData, brand_id: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar bandeira" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem bandeira</SelectItem>
                {cardBrands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id.toString()}>
                    {brand.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="limit_amount">Limite (R$) *</Label>
            <Input
              id="limit_amount"
              type="number"
              step="0.01"
              value={formData.limit_amount}
              onChange={(e) => setFormData({...formData, limit_amount: e.target.value})}
              placeholder="0.00"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="due_date">Dia Vencimento *</Label>
            <Input
              id="due_date"
              type="number"
              min="1"
              max="31"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              placeholder="10"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={createCardMutation.isPending || updateCardMutation.isPending}
            >
              {editingCard ? 'Atualizar' : 'Criar'} Cartão
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreditCardForm;
