
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Tags, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Categories = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([
    { id: 1, name: 'Alimentação', type: 'Despesa', color: '#ef4444', transactionCount: 15 },
    { id: 2, name: 'Transporte', type: 'Despesa', color: '#3b82f6', transactionCount: 8 },
    { id: 3, name: 'Moradia', type: 'Despesa', color: '#8b5cf6', transactionCount: 3 },
    { id: 4, name: 'Salário', type: 'Receita', color: '#10b981', transactionCount: 1 },
    { id: 5, name: 'Freelance', type: 'Receita', color: '#f59e0b', transactionCount: 5 },
    { id: 6, name: 'Lazer', type: 'Despesa', color: '#ec4899', transactionCount: 12 },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Despesa',
    color: '#3b82f6'
  });

  const predefinedColors = [
    '#ef4444', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', 
    '#ec4899', '#6b7280', '#14b8a6', '#f97316', '#84cc16'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Verificar se já existe uma categoria com o mesmo nome
    const existingCategory = categories.find(cat => 
      cat.name.toLowerCase() === formData.name.toLowerCase() && 
      cat.id !== (editingCategory?.id || 0)
    );

    if (existingCategory) {
      toast({
        title: "Erro",
        description: "Já existe uma categoria com este nome",
        variant: "destructive"
      });
      return;
    }

    const newCategory = {
      id: editingCategory ? editingCategory.id : Date.now(),
      name: formData.name,
      type: formData.type,
      color: formData.color,
      transactionCount: editingCategory ? editingCategory.transactionCount : 0
    };

    if (editingCategory) {
      setCategories(categories.map(cat => cat.id === editingCategory.id ? newCategory : cat));
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!"
      });
    } else {
      setCategories([...categories, newCategory]);
      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!"
      });
    }

    setFormData({ name: '', type: 'Despesa', color: '#3b82f6' });
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id) => {
    const category = categories.find(cat => cat.id === id);
    
    if (category && category.transactionCount > 0) {
      toast({
        title: "Erro",
        description: "Não é possível excluir uma categoria que possui transações associadas",
        variant: "destructive"
      });
      return;
    }

    setCategories(categories.filter(cat => cat.id !== id));
    toast({
      title: "Sucesso",
      description: "Categoria removida com sucesso!"
    });
  };

  const expenseCategories = categories.filter(cat => cat.type === 'Despesa');
  const incomeCategories = categories.filter(cat => cat.type === 'Receita');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Categorias</h2>
          <p className="text-gray-600">Organize suas receitas e despesas</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => {
                setEditingCategory(null);
                setFormData({ name: '', type: 'Despesa', color: '#3b82f6' });
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory ? 'Atualize os dados da categoria.' : 'Crie uma nova categoria para organizar suas transações.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Categoria *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Alimentação"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Receita">Receita</SelectItem>
                    <SelectItem value="Despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({...formData, color})}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-20 h-10"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCategory ? 'Atualizar' : 'Criar Categoria'}
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
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Categorias</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <Tags className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categorias de Receita</p>
                <p className="text-2xl font-bold text-green-600">{incomeCategories.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categorias de Despesa</p>
                <p className="text-2xl font-bold text-red-600">{expenseCategories.length}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income Categories */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Categorias de Receita
          </h3>
          
          <div className="space-y-3">
            {incomeCategories.map((category) => (
              <Card key={category.id} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-500">
                          {category.transactionCount} transação(ões)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(category)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(category.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        disabled={category.transactionCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {incomeCategories.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Nenhuma categoria de receita cadastrada</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Categorias de Despesa
          </h3>
          
          <div className="space-y-3">
            {expenseCategories.map((category) => (
              <Card key={category.id} className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-500">
                          {category.transactionCount} transação(ões)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(category)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(category.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        disabled={category.transactionCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {expenseCategories.length === 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-8 text-center">
                  <TrendingDown className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Nenhuma categoria de despesa cadastrada</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {categories.length === 0 && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Tags className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma categoria cadastrada
            </h3>
            <p className="text-gray-600 mb-4">
              Comece criando categorias para organizar melhor suas receitas e despesas.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Criar Primeira Categoria
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Categories;
