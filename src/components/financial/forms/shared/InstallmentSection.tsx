import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface InstallmentSectionProps {
  isInstallment: boolean;
  onInstallmentChange: (checked: boolean) => void;
  installmentAmount: string;
  onInstallmentAmountChange: (value: string) => void;
  installments: number;
  onInstallmentsChange: (value: number) => void;
  totalAmount: number;
  amountLabel?: string;
  colorScheme?: 'blue' | 'green';
}

export const InstallmentSection = ({
  isInstallment,
  onInstallmentChange,
  installmentAmount,
  onInstallmentAmountChange,
  installments,
  onInstallmentsChange,
  totalAmount,
  amountLabel = 'Valor',
  colorScheme = 'blue'
}: InstallmentSectionProps) => {
  const bgColorClass = colorScheme === 'green' ? 'bg-green-50' : 'bg-blue-50';
  const textColorClass = colorScheme === 'green' ? 'text-green-800' : 'text-blue-800';
  const subtextColorClass = colorScheme === 'green' ? 'text-green-600' : 'text-blue-600';

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isInstallment"
          checked={isInstallment}
          onCheckedChange={(checked) => onInstallmentChange(!!checked)}
        />
        <Label htmlFor="isInstallment">
          Esta {amountLabel.toLowerCase()} é parcelada
        </Label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="installmentAmount">
            {isInstallment ? `Valor da Parcela *` : `${amountLabel} *`}
          </Label>
          <Input
            id="installmentAmount"
            type="number"
            step="0.01"
            min="0.01"
            value={installmentAmount}
            onChange={(e) => onInstallmentAmountChange(e.target.value)}
            placeholder="0,00"
            required
          />
        </div>

        {isInstallment && (
          <div className="space-y-2">
            <Label htmlFor="installments">Parcelas</Label>
            <Input
              id="installments"
              type="number"
              min="1"
              max="48"
              value={installments}
              onChange={(e) => onInstallmentsChange(parseInt(e.target.value) || 1)}
            />
          </div>
        )}
      </div>

      {isInstallment && installments > 1 && installmentAmount && (
        <div className={`p-3 ${bgColorClass} rounded-lg`}>
          <p className={`text-sm ${textColorClass}`}>
            <strong>Valor Total:</strong> R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className={`text-sm ${subtextColorClass}`}>
            {installments}x de R$ {parseFloat(installmentAmount || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      )}
    </div>
  );
};