import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RecurrenceSectionProps {
  isRecurring: boolean;
  onRecurringChange: (checked: boolean) => void;
  recurrence: string;
  onRecurrenceChange: (value: string) => void;
  entityType?: 'receita' | 'despesa';
}

export const RecurrenceSection = ({
  isRecurring,
  onRecurringChange,
  recurrence,
  onRecurrenceChange,
  entityType = 'receita'
}: RecurrenceSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isRecurring"
          checked={isRecurring}
          onCheckedChange={(checked) => onRecurringChange(!!checked)}
        />
        <Label htmlFor="isRecurring">
          Esta {entityType} é recorrente
        </Label>
      </div>

      {isRecurring && (
        <div className="space-y-2">
          <Label htmlFor="recurrence">Recorrência</Label>
          <Select value={recurrence} onValueChange={onRecurrenceChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Semanal">Semanal</SelectItem>
              <SelectItem value="Quinzenal">Quinzenal</SelectItem>
              <SelectItem value="Mensal">Mensal</SelectItem>
              <SelectItem value="Bimestral">Bimestral</SelectItem>
              <SelectItem value="Trimestral">Trimestral</SelectItem>
              <SelectItem value="Anual">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};