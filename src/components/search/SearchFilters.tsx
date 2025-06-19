
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
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center space-x-2 mb-6">
        <Filter className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Search Filters</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Text */}
        <div className="space-y-2">
          <Label htmlFor="search-text" className="text-white">Search Query</Label>
          <Input
            id="search-text"
            type="text"
            placeholder="Enter keywords, regulation numbers, or requirements..."
            value={query.text}
            onChange={(e) => setQuery(prev => ({ ...prev, text: e.target.value }))}
            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Regulation Part */}
        <div className="space-y-2">
          <Label className="text-white">Regulation Part</Label>
          <Select value={query.part || 'all-parts'} onValueChange={handlePartChange}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select regulation part" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all-parts" className="text-white hover:bg-gray-700">
                All Parts
              </SelectItem>
              {buildingRegulationParts.map(part => (
                <SelectItem key={part.value} value={part.value} className="text-white hover:bg-gray-700">
                  {part.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Building Type */}
        <div className="space-y-2">
          <Label className="text-white">Building Type</Label>
          <Select value={query.buildingType || 'all-types'} onValueChange={handleBuildingTypeChange}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select building type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all-types" className="text-white hover:bg-gray-700">
                All Types
              </SelectItem>
              {buildingTypes.map(type => (
                <SelectItem key={type.value} value={type.value} className="text-white hover:bg-gray-700">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Topic */}
        <div className="space-y-2">
          <Label className="text-white">Topic</Label>
          <Select value={query.topic || 'all-topics'} onValueChange={handleTopicChange}>
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all-topics" className="text-white hover:bg-gray-700">
                All Topics
              </SelectItem>
              {topics.map(topic => (
                <SelectItem key={topic.value} value={topic.value} className="text-white hover:bg-gray-700">
                  {topic.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            type="submit"
            disabled={isSearching || !query.text.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Search Regulations
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Clear Filters
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SearchFilters;
