import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCategory: (categoryData: { name: string; color: string }) => void;
  isLoading?: boolean;
  defaultColor?: string;
  entityType?: 'receitas' | 'despesas';
}

export const CategoryDialog = ({
  open,
  onOpenChange,
  onCreateCategory,
  isLoading = false,
  defaultColor = '#16a34a',
  entityType = 'receitas'
}: CategoryDialogProps) => {
  const [categoryData, setCategoryData] = useState({
    name: '',
    color: defaultColor
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive"
      });
      return;
    }
    onCreateCategory({
      name: categoryData.name.trim(),
      color: categoryData.color
    });
  };

  const handleClose = () => {
    setCategoryData({ name: '', color: defaultColor });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>
            Crie uma nova categoria para organizar suas {entityType}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Nome da Categoria *</Label>
            <Input
              id="categoryName"
              value={categoryData.name}
              onChange={(e) => setCategoryData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={entityType === 'receitas' ? "Ex: Freelance" : "Ex: Alimentação"}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="categoryColor">Cor</Label>
            <Input
              id="categoryColor"
              type="color"
              value={categoryData.color}
              onChange={(e) => setCategoryData(prev => ({ ...prev, color: e.target.value }))}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Categoria'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};