
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SearchFilters from './search/SearchFilters';
import SearchResults from './search/SearchResults';
import QuickReferenceTools from './search/QuickReferenceTools';
import SearchHistory from './search/SearchHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

interface SearchQuery {
  text: string;
  part?: string;
  buildingType?: string;
  topic?: string;
}

interface SearchResult {
  id: string;
  title: string;
  content: string;
  part: string;
  section: string;
  relevanceScore: number;
}

interface AdvancedSearchInterfaceProps {
  user: any;
}

const AdvancedSearchInterface = ({ user }: AdvancedSearchInterfaceProps) => {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({ text: '' });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchQuery[]>([]);
  const [favorites, setFavorites] = useState<SearchResult[]>([]);

  const handleSearch = async (query: SearchQuery) => {
    setIsSearching(true);
    setSearchQuery(query);

    try {
      // Add to search history
      setSearchHistory(prev => [query, ...prev.slice(0, 9)]);

      // Simulate search results for now - in a real implementation, this would call your search API
      setTimeout(() => {
        const mockResults: SearchResult[] = [
          {
            id: '1',
            title: 'Part A - Structure',
            content: 'Requirements for structural safety and stability of buildings...',
            part: 'Part A',
            section: '1.1',
            relevanceScore: 0.95
          },
          {
            id: '2',
            title: 'Part B - Fire Safety',
            content: 'Fire safety provisions for buildings including escape routes...',
            part: 'Part B',
            section: '2.1',
            relevanceScore: 0.87
          }
        ];
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 1000);
    } catch (error) {
      console.error('Search error:', error);
      setIsSearching(false);
    }
  };

  const toggleFavorite = (result: SearchResult) => {
    setFavorites(prev => {
      const exists = prev.find(fav => fav.id === result.id);
      if (exists) {
        return prev.filter(fav => fav.id !== result.id);
      } else {
        return [...prev, result];
      }
    });
  };

  return (
    <div className="flex-1 bg-black text-white">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-800 p-4">
          <h1 className="text-2xl font-bold text-white mb-2">Advanced Search</h1>
          <p className="text-gray-400">Search through UK Building Regulations with advanced filters and tools</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="search" className="h-full flex flex-col">
            <TabsList className="bg-gray-900 border-b border-gray-800 rounded-none w-full justify-start px-4">
              <TabsTrigger value="search" className="data-[state=active]:bg-gray-800">Search</TabsTrigger>
              <TabsTrigger value="tools" className="data-[state=active]:bg-gray-800">Quick Tools</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-gray-800">History & Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="flex-1 m-0">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* Search Filters Sidebar */}
                <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                  <div className="h-full border-r border-gray-800 bg-gray-900/50">
                    <SearchFilters 
                      onSearch={handleSearch}
                      isSearching={isSearching}
                    />
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Search Results */}
                <ResizablePanel defaultSize={50} minSize={30}>
                  <SearchResults
                    results={searchResults}
                    isSearching={isSearching}
                    query={searchQuery}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </TabsContent>

            <TabsContent value="tools" className="flex-1 m-0">
              <QuickReferenceTools />
            </TabsContent>

            <TabsContent value="history" className="flex-1 m-0">
              <SearchHistory
                searchHistory={searchHistory}
                favorites={favorites}
                onSearch={handleSearch}
                onToggleFavorite={toggleFavorite}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchInterface;
