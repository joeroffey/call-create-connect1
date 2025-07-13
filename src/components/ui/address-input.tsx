import React from 'react';
import { cn } from '@/lib/utils';

interface AddressInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

const AddressInput = ({ value, onChange, className, ...props }: AddressInputProps) => {
  const formatAddress = (address: string) => {
    // Split into lines and clean up each line
    const lines = address.split('\n').map(line => {
      // Remove extra spaces and clean up
      const cleaned = line.trim().replace(/\s+/g, ' ');
      
      // Basic formatting for common patterns
      if (cleaned.length === 0) return cleaned;
      
      // Check if it looks like a postcode (basic UK postcode pattern)
      const postcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
      if (postcodePattern.test(cleaned.replace(/\s/g, ''))) {
        // Format postcode properly (e.g., "SW1A1AA" -> "SW1A 1AA")
        const pc = cleaned.replace(/\s/g, '').toUpperCase();
        return pc.slice(0, -3) + ' ' + pc.slice(-3);
      }
      
      // Capitalize first letter of each word for address lines
      return cleaned.split(' ').map(word => {
        if (word.length === 0) return word;
        // Don't capitalize common prepositions and conjunctions
        const lowerCaseWords = ['of', 'the', 'and', 'at', 'in', 'on', 'for', 'to', 'by'];
        if (lowerCaseWords.includes(word.toLowerCase())) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(' ');
    });
    
    // Remove empty lines and join
    return lines.filter(line => line.trim().length > 0).join('\n');
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    if (value.trim()) {
      onChange(formatAddress(value.trim()));
    }
  };

  return (
    <textarea
      {...props}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      rows={3}
      className={cn(
        "w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none",
        className
      )}
      placeholder="Enter full address including postcode..."
    />
  );
};

export { AddressInput };