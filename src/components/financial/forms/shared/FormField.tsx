import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormFieldProps {
  label: string;
  id: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string;
  rows?: number;
}

export const FormField = ({ 
  label, 
  id, 
  value, 
  onChange, 
  type = 'text', 
  placeholder, 
  required = false,
  min,
  max,
  step,
  rows = 3
}: FormFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && '*'}
      </Label>
      {type === 'textarea' ? (
        <Textarea
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="resize-none"
          rows={rows}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          step={step}
        />
      )}
    </div>
  );
};