import React, { useState } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const PhoneInput = ({ value, onChange, className, ...props }: PhoneInputProps) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Handle UK numbers
    if (digits.startsWith('44')) {
      // International format starting with 44
      const number = digits.slice(2);
      if (number.length === 10) {
        return `+44 ${number.slice(0, 4)} ${number.slice(4, 7)} ${number.slice(7)}`;
      }
    } else if (digits.startsWith('0')) {
      // UK national format starting with 0
      if (digits.length === 11) {
        return `${digits.slice(0, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
      }
    } else if (digits.length === 10) {
      // Assume UK mobile without leading 0
      return `0${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
    
    return phone;
  };

  const validatePhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    
    // UK mobile: 07xxx xxxxxx (11 digits starting with 07)
    if (digits.startsWith('07') && digits.length === 11) return true;
    
    // UK landline: 01xxx xxxxxx or 02x xxxx xxxx (11 digits starting with 01 or 02)
    if ((digits.startsWith('01') || digits.startsWith('02')) && digits.length === 11) return true;
    
    // International UK: +44 xxxx xxx xxx
    if (digits.startsWith('44') && digits.length === 12) return true;
    
    return false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Allow digits, spaces, hyphens, parentheses, and plus sign
    const filteredValue = rawValue.replace(/[^\d\s\-\(\)\+]/g, '');
    onChange(filteredValue);
    
    if (filteredValue.trim()) {
      setIsValid(validatePhoneNumber(filteredValue));
    } else {
      setIsValid(null);
    }
  };

  const handleBlur = () => {
    if (value.trim()) {
      const formatted = formatPhoneNumber(value);
      onChange(formatted);
    }
  };

  return (
    <div className="relative">
      <Input
        {...props}
        type="tel"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className={cn(
          className,
          isValid === true && 'border-green-500/60 focus:border-green-500',
          isValid === false && 'border-red-500/60 focus:border-red-500'
        )}
        placeholder="Enter UK phone number"
      />
      {isValid !== null && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isValid ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-red-500" />
          )}
        </div>
      )}
    </div>
  );
};

export { PhoneInput };