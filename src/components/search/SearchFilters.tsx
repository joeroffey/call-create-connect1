import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchQuery {
  text: string;
  part?: string;
  buildingType?: string;
  topic?: string;
}

interface SearchFiltersProps {
  onSearch: (query: SearchQuery) => void;
  isSearching: boolean;
}

const SearchFilters = ({ onSearch, isSearching }: SearchFiltersProps) => {
  const [query, setQuery] = useState<SearchQuery>({ text: '' });

  const buildingRegulationParts = [
    { value: 'part-a', label: 'Part A - Structure' },
    { value: 'part-b', label: 'Part B - Fire Safety' },
    { value: 'part-c', label: 'Part C - Site Preparation' },
    { value: 'part-d', label: 'Part D - Toxic Substances' },
    { value: 'part-e', label: 'Part E - Sound' },
    { value: 'part-f', label: 'Part F - Ventilation' },
    { value: 'part-g', label: 'Part G - Sanitation' },
    { value: 'part-h', label: 'Part H - Drainage' },
    { value: 'part-j', label: 'Part J - Combustion Appliances' },
    { value: 'part-k', label: 'Part K - Protection from Falls' },
    { value: 'part-l', label: 'Part L - Conservation of Fuel' },
    { value: 'part-m', label: 'Part M - Access & Facilities' },
    { value: 'part-n', label: 'Part N - Glazing Safety' },
    { value: 'part-p', label: 'Part P - Electrical Safety' },
  ];

  const buildingTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'educational', label: 'Educational' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'retail', label: 'Retail' },
  ];

  const topics = [
    { value: 'fire-safety', label: 'Fire Safety' },
    { value: 'structural', label: 'Structural Requirements' },
    { value: 'accessibility', label: 'Accessibility' },
    { value: 'energy-efficiency', label: 'Energy Efficiency' },
    { value: 'ventilation', label: 'Ventilation' },
    { value: 'drainage', label: 'Drainage & Plumbing' },
    { value: 'electrical', label: 'Electrical Safety' },
    { value: 'glazing', label: 'Glazing & Windows' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const clearFilters = () => {
    setQuery({ text: '' });
  };

  const handlePartChange = (value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      part: value === 'all-parts' ? undefined : value 
    }));
  };

  const handleBuildingTypeChange = (value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      buildingType: value === 'all-types' ? undefined : value 
    }));
  };

  const handleTopicChange = (value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      topic: value === 'all-topics' ? undefined : value 
    }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 h-full overflow-y-auto glass"
    >
      <motion.div 
        className="flex items-center space-x-3 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <Filter className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
          Search Filters
        </h2>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Text */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label htmlFor="search-text" className="text-emerald-100 font-medium">Search Query</Label>
          <Input
            id="search-text"
            type="text"
            placeholder="Enter keywords, regulation numbers, or requirements..."
            value={query.text}
            onChange={(e) => setQuery(prev => ({ ...prev, text: e.target.value }))}
            className="bg-black/30 border-emerald-500/30 text-white placeholder:text-gray-400 focus:border-emerald-400 focus:ring-emerald-400/20 backdrop-blur-sm"
          />
        </motion.div>

        {/* Regulation Part */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Label className="text-emerald-100 font-medium">Regulation Part</Label>
          <Select value={query.part || 'all-parts'} onValueChange={handlePartChange}>
            <SelectTrigger className="bg-black/30 border-emerald-500/30 text-white backdrop-blur-sm focus:border-emerald-400">
              <SelectValue placeholder="Select regulation part" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-emerald-500/30 backdrop-blur-xl">
              <SelectItem value="all-parts" className="text-white hover:bg-emerald-500/20 focus:bg-emerald-500/20">
                All Parts
              </SelectItem>
              {buildingRegulationParts.map(part => (
                <SelectItem key={part.value} value={part.value} className="text-white hover:bg-emerald-500/20 focus:bg-emerald-500/20">
                  {part.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Building Type */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Label className="text-emerald-100 font-medium">Building Type</Label>
          <Select value={query.buildingType || 'all-types'} onValueChange={handleBuildingTypeChange}>
            <SelectTrigger className="bg-black/30 border-emerald-500/30 text-white backdrop-blur-sm focus:border-emerald-400">
              <SelectValue placeholder="Select building type" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-emerald-500/30 backdrop-blur-xl">
              <SelectItem value="all-types" className="text-white hover:bg-emerald-500/20 focus:bg-emerald-500/20">
                All Types
              </SelectItem>
              {buildingTypes.map(type => (
                <SelectItem key={type.value} value={type.value} className="text-white hover:bg-emerald-500/20 focus:bg-emerald-500/20">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Topic */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Label className="text-emerald-100 font-medium">Topic</Label>
          <Select value={query.topic || 'all-topics'} onValueChange={handleTopicChange}>
            <SelectTrigger className="bg-black/30 border-emerald-500/30 text-white backdrop-blur-sm focus:border-emerald-400">
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-emerald-500/30 backdrop-blur-xl">
              <SelectItem value="all-topics" className="text-white hover:bg-emerald-500/20 focus:bg-emerald-500/20">
                All Topics
              </SelectItem>
              {topics.map(topic => (
                <SelectItem key={topic.value} value={topic.value} className="text-white hover:bg-emerald-500/20 focus:bg-emerald-500/20">
                  {topic.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="space-y-3 pt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            type="submit"
            disabled={isSearching || !query.text.trim()}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium shadow-lg shadow-emerald-500/25 transition-all duration-300"
          >
            {isSearching ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" 
              />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Search Regulations
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            className="w-full border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-400 backdrop-blur-sm"
          >
            Clear Filters
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default SearchFilters;
