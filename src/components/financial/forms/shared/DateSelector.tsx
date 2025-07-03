import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
  label: string;
  required?: boolean;
}

export const DateSelector = ({ date, onDateChange, label, required = false }: DateSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label>
        {label} {required && '*'}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd/MM/yyyy") : "Selecionar"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => selectedDate && onDateChange(selectedDate)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};