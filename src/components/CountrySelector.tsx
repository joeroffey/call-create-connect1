
import React, { useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const countries = [
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'CY', name: 'Cyprus', flag: '🇨🇾' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
].sort((a, b) => a.name.localeCompare(b.name));

interface CountrySelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const CountrySelector = ({ 
  value, 
  onChange, 
  className, 
  placeholder = "Select country" 
}: CountrySelectorProps) => {
  const [open, setOpen] = useState(false);
  
  const selectedCountry = countries.find(country => country.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-12 bg-gray-800/50 border-emerald-500/30 hover:bg-gray-700/50 hover:border-emerald-400/50 transition-all duration-200",
            !selectedCountry && "text-gray-400",
            selectedCountry && "text-white",
            className
          )}
        >
          <div className="flex items-center space-x-3">
            <Globe className="h-5 w-5 text-emerald-400" />
            {selectedCountry ? (
              <div className="flex items-center space-x-2">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="text-base">{selectedCountry.name}</span>
              </div>
            ) : (
              <span className="text-base">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-0 bg-gray-800 border-emerald-500/30 shadow-2xl" 
        align="start"
        sideOffset={8}
      >
        <Command className="bg-gray-800 border-none">
          <div className="p-3 border-b border-gray-700">
            <CommandInput 
              placeholder="Search countries..." 
              className="h-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:border-emerald-400"
            />
          </div>
          <CommandList className="max-h-80">
            <CommandEmpty className="p-4 text-center text-gray-400">
              No country found.
            </CommandEmpty>
            <CommandGroup className="p-0">
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={country.name}
                  onSelect={() => {
                    onChange(country.code);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700/50 text-white data-[selected]:bg-emerald-600 data-[selected]:text-white transition-colors duration-150"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg w-6 text-center">{country.flag}</span>
                    <span className="text-base">{country.name}</span>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 text-emerald-400",
                      selectedCountry?.code === country.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CountrySelector;
