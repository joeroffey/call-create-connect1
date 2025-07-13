import React from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface NameInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const NameInput = ({ value, onChange, className, ...props }: NameInputProps) => {
  const formatName = (name: string) => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => {
        if (word.length === 0) return word;
        // Handle common prefixes like "mc", "mac", "o'"
        if (word.startsWith('mc') && word.length > 2) {
          return 'Mc' + word.charAt(2).toUpperCase() + word.slice(3);
        }
        if (word.startsWith('mac') && word.length > 3) {
          return 'Mac' + word.charAt(3).toUpperCase() + word.slice(4);
        }
        if (word.startsWith("o'") && word.length > 2) {
          return "O'" + word.charAt(2).toUpperCase() + word.slice(3);
        }
        // Handle hyphenated names
        if (word.includes('-')) {
          return word.split('-').map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
          ).join('-');
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Only allow letters, spaces, hyphens, and apostrophes
    const filteredValue = rawValue.replace(/[^a-zA-Z\s\-']/g, '');
    onChange(filteredValue);
  };

  const handleBlur = () => {
    if (value.trim()) {
      onChange(formatName(value.trim()));
    }
  };

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      className={cn(className)}
      placeholder="Enter full name"
    />
  );
};

export { NameInput };