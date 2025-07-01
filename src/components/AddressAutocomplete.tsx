
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, AlertCircle, Edit3, Search } from 'lucide-react';

interface AddressSuggestion {
  display_name: string;
  place_id: string;
  lat: string;
  lon: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const AddressAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Start typing your address...", 
  className = "",
  autoFocus = false 
}: AddressAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Try multiple APIs for better coverage
      const apis = [
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&countrycodes=gb&q=${encodeURIComponent(query)}`,
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(query + ' UK')}`
      ];

      let allSuggestions: AddressSuggestion[] = [];
      
      for (const apiUrl of apis) {
        try {
          const response = await fetch(apiUrl);
          if (response.ok) {
            const data = await response.json();
            const formattedSuggestions = data.map((item: any) => ({
              display_name: item.display_name,
              place_id: item.place_id,
              lat: item.lat,
              lon: item.lon
            }));
            allSuggestions = [...allSuggestions, ...formattedSuggestions];
          }
        } catch (apiError) {
          console.warn('API failed:', apiError);
        }
      }

      // Remove duplicates and limit results
      const uniqueSuggestions = allSuggestions.filter((item, index, self) => 
        index === self.findIndex(t => t.place_id === item.place_id)
      ).slice(0, 8);
      
      setSuggestions(uniqueSuggestions);
      setShowSuggestions(uniqueSuggestions.length > 0);
      setActiveSuggestion(-1);
      
      if (uniqueSuggestions.length === 0 && query.length >= 3) {
        setError('No addresses found. Please try a different search or enter your address manually below.');
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setError('Unable to search addresses. Please enter your address manually below.');
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (value.trim() && !showManualEntry) {
        fetchSuggestions(value);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, showManualEntry]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    onChange(suggestion.display_name);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestion >= 0) {
          handleSuggestionClick(suggestions[activeSuggestion]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestion(-1);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    setTimeout(() => {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }, 200);
  };

  const toggleManualEntry = () => {
    setShowManualEntry(!showManualEntry);
    setShowSuggestions(false);
    setError(null);
    if (!showManualEntry) {
      onChange(''); // Clear the field when switching to manual
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => !showManualEntry && suggestions.length > 0 && setShowSuggestions(true)}
          className={className}
          placeholder={showManualEntry ? "Enter your full address manually..." : placeholder}
          autoComplete="off"
          autoFocus={autoFocus}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <motion.div
              className="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : showManualEntry ? (
            <Edit3 className="w-4 h-4 text-emerald-400/60" />
          ) : (
            <Search className="w-4 h-4 text-emerald-400/60" />
          )}
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        type="button"
        variant="ghost"
        onClick={toggleManualEntry}
        className="w-full text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10 text-sm h-8"
      >
        {showManualEntry ? (
          <>
            <Search className="w-4 h-4 mr-2" />
            Switch to address lookup
          </>
        ) : (
          <>
            <Edit3 className="w-4 h-4 mr-2" />
            Can't find your address? Enter manually
          </>
        )}
      </Button>
      
      {/* Error message */}
      {error && !showManualEntry && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start space-x-2 text-amber-400 text-sm bg-amber-400/10 p-3 rounded-lg border border-amber-400/20"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}
      
      <AnimatePresence>
        {showSuggestions && !showManualEntry && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full bg-gray-800 border border-emerald-500/30 rounded-lg shadow-xl max-h-64 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.place_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
                className={`p-3 cursor-pointer text-sm transition-all duration-150 ${
                  index === activeSuggestion
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700/50'
                } ${index === 0 ? 'rounded-t-lg' : ''} ${
                  index === suggestions.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-700/50'
                }`}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{suggestion.display_name}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddressAutocomplete;
