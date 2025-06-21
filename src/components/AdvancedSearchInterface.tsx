
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SearchFilters from './search/SearchFilters';
import SearchResults from './search/SearchResults';
import QuickReferenceTools from './search/QuickReferenceTools';
import SearchHistory from './search/SearchHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { supabase } from '@/integrations/supabase/client';

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

      // Build search message incorporating filters
      let searchMessage = query.text;
      const filters = [];
      
      if (query.part) {
        filters.push(`focusing on ${query.part}`);
      }
      if (query.buildingType) {
        filters.push(`for ${query.buildingType} buildings`);
      }
      if (query.topic) {
        filters.push(`related to ${query.topic}`);
      }
      
      if (filters.length > 0) {
        searchMessage += ` (${filters.join(', ')})`;
      }

      console.log('Searching with message:', searchMessage);

      // Call the building regulations chat function
      const { data, error } = await supabase.functions.invoke('building-regulations-chat', {
        body: { 
          message: searchMessage,
          projectContext: null // No specific project context for search
        }
      });

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      console.log('Search response:', data);

      // Parse the AI response into search results
      const aiResponse = data.response;
      const mockResults = parseResponseToResults(aiResponse, query);
      
      setSearchResults(mockResults);
      setIsSearching(false);
    } catch (error) {
      console.error('Search error:', error);
      setIsSearching(false);
      
      // Show error results
      setSearchResults([{
        id: 'error-1',
        title: 'Search Error',
        content: 'Unable to perform search at this time. Please check your connection and try again.',
        part: 'System',
        section: 'Error',
        relevanceScore: 0
      }]);
    }
  };

  // Helper function to parse AI response into structured results
  const parseResponseToResults = (response: string, query: SearchQuery): SearchResult[] => {
    // For now, create a single comprehensive result from the AI response
    // In a real implementation, you might want to parse the response more intelligently
    const results: SearchResult[] = [];
    
    // Split response into sections if it contains multiple parts
    const sections = response.split(/Part [A-P]/g);
    
    if (sections.length > 1) {
      // Multiple parts mentioned
      sections.forEach((section, index) => {
        if (section.trim() && index > 0) {
          const partLetter = response.match(new RegExp(`Part [A-P]`, 'g'))?.[index - 1];
          results.push({
            id: `result-${index}`,
            title: partLetter || `Building Regulations Information ${index}`,
            content: section.trim().substring(0, 200) + '...',
            part: partLetter || 'Building Regulations',
            section: '1.0',
            relevanceScore: Math.max(0.7, 1 - (index * 0.1))
          });
        }
      });
    } else {
      // Single comprehensive result
      results.push({
        id: 'result-1',
        title: `Building Regulations: ${query.text}`,
        content: response.substring(0, 300) + (response.length > 300 ? '...' : ''),
        part: query.part || 'Building Regulations',
        section: '1.0',
        relevanceScore: 0.95
      });
    }

    return results;
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
