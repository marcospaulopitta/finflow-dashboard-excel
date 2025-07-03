import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  bank_name: string;
}

interface Category {
  id: string;
  name: string;
}

interface AccountCategorySectionProps {
  // Account props
  accountId: string;
  onAccountChange: (value: string) => void;
  accounts: Account[];
  
  // Category props
  categoryId: string;
  onCategoryChange: (value: string) => void;
  categories: Category[];
  onCreateCategory: () => void;
  
  // Layout props
  showBothColumns?: boolean;
}

export const AccountCategorySelection = ({
  accountId,
  onAccountChange,
  accounts,
  categoryId,
  onCategoryChange,
  categories,
  onCreateCategory,
  showBothColumns = true
}: AccountCategorySectionProps) => {
  if (showBothColumns) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <AccountSelect 
          accountId={accountId} 
          onAccountChange={onAccountChange} 
          accounts={accounts} 
        />
        <CategorySelect 
          categoryId={categoryId}
          onCategoryChange={onCategoryChange}
          categories={categories}
          onCreateCategory={onCreateCategory}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AccountSelect 
        accountId={accountId} 
        onAccountChange={onAccountChange} 
        accounts={accounts} 
      />
      <CategorySelect 
        categoryId={categoryId}
        onCategoryChange={onCategoryChange}
        categories={categories}
        onCreateCategory={onCreateCategory}
      />
    </div>
  );
};

const AccountSelect = ({ 
  accountId, 
  onAccountChange, 
  accounts 
}: { 
  accountId: string; 
  onAccountChange: (value: string) => void; 
  accounts: Account[]; 
}) => (
  <div className="space-y-2">
    <Label>Conta Bancária</Label>
    <Select value={accountId} onValueChange={onAccountChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecionar conta" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Nenhuma conta</SelectItem>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name} - {account.bank_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {accounts.length === 0 && (
      <p className="text-sm text-orange-600">
        Nenhuma conta cadastrada. Cadastre uma conta para melhor organização.
      </p>
    )}
  </div>
);

const CategorySelect = ({ 
  categoryId, 
  onCategoryChange, 
  categories, 
  onCreateCategory 
}: { 
  categoryId: string; 
  onCategoryChange: (value: string) => void; 
  categories: Category[]; 
  onCreateCategory: () => void; 
}) => (
  <div className="space-y-2">
    <Label>Categoria</Label>
    <div className="flex gap-2">
      <Select value={categoryId} onValueChange={onCategoryChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Selecionar categoria" />
        </SelectTrigger>
        <SelectContent>
        <SelectItem value="none">Sem categoria</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        type="button" 
        variant="outline" 
        onClick={onCreateCategory}
        className="px-3"
      >
        <PlusCircle className="h-4 w-4" />
      </Button>
    </div>
    {categories.length === 0 && (
      <p className="text-sm text-orange-600">
        Nenhuma categoria cadastrada. Crie uma categoria para melhor organização.
      </p>
    )}
  </div>
);