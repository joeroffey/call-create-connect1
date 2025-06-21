import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SearchFilters from './search/SearchFilters';
import SearchResults from './search/SearchResults';
import QuickReferenceTools from './search/QuickReferenceTools';
import SearchHistory from './search/SearchHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  images?: Array<{
    url: string;
    title: string;
    source: string;
  }>;
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
  const [showFilters, setShowFilters] = useState(true);
  const { toast } = useToast();

  const handleSearch = async (query: SearchQuery) => {
    console.log('Starting search with query:', query);
    
    if (!query.text.trim()) {
      toast({
        title: "Search Error",
        description: "Please enter a search term",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);
    setShowFilters(false); // Hide filters when search starts

    try {
      // Check if user is authenticated
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error');
      }

      if (!session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use the search feature",
          variant: "destructive"
        });
        setIsSearching(false);
        return;
      }

      console.log('User authenticated, proceeding with search');

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

      console.log('Calling building-regulations-chat with message:', searchMessage);

      // Call the building regulations chat function
      const { data, error } = await supabase.functions.invoke('building-regulations-chat', {
        body: { 
          message: searchMessage,
          projectContext: null // No specific project context for search
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('Search response received:', data);

      // Check if we got a valid response
      if (!data || !data.response) {
        throw new Error('No response received from search service');
      }

      // Parse the AI response into search results, including images
      const aiResponse = data.response;
      const images = data.images || []; // Get images from response
      const mockResults = parseResponseToResults(aiResponse, query, images);
      
      console.log('Parsed results with images:', mockResults);
      setSearchResults(mockResults);
      
      toast({
        title: "Search Complete",
        description: `Found ${mockResults.length} result${mockResults.length !== 1 ? 's' : ''} ${images.length > 0 ? `with ${images.length} image${images.length > 1 ? 's' : ''}` : ''}`,
      });

    } catch (error) {
      console.error('Search error:', error);
      
      let errorMessage = 'Unable to perform search at this time.';
      
      if (error.message?.includes('fetch')) {
        errorMessage = 'Network error - please check your connection and try again.';
      } else if (error.message?.includes('auth')) {
        errorMessage = 'Authentication error - please sign in again.';
      } else if (error.message?.includes('function')) {
        errorMessage = 'Search service unavailable - please try again later.';
      }
      
      toast({
        title: "Search Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Show error results
      setSearchResults([{
        id: 'error-1',
        title: 'Search Error',
        content: errorMessage + ' Please check your connection and try again, or contact support if the problem persists.',
        part: 'System',
        section: 'Error',
        relevanceScore: 0
      }]);
    } finally {
      setIsSearching(false);
    }
  };

  // Helper function to parse AI response into structured results
  const parseResponseToResults = (response: string, query: SearchQuery, images: any[] = []): SearchResult[] => {
    console.log('Parsing response for query:', query, 'with images:', images);
    
    const results: SearchResult[] = [];
    
    // Convert images to the expected format
    const formattedImages = images.map((img, index) => ({
      url: img.url || img.image_url || img.src || '',
      title: img.title || img.alt || `Building Regulation Image ${index + 1}`,
      source: img.source || 'UK Building Regulations'
    })).filter(img => img.url); // Only include images with valid URLs
    
    // Try to identify different parts or sections in the response
    const sections = response.split(/(?:Part [A-P]|Section \d+|(?:\d+\.){1,2}\d+)/g);
    const matches = response.match(/Part [A-P]|Section \d+|(?:\d+\.){1,2}\d+/g) || [];
    
    if (sections.length > 1 && matches.length > 0) {
      // Multiple parts/sections mentioned
      sections.forEach((section, index) => {
        if (section.trim() && index > 0) {
          const partOrSection = matches[index - 1];
          const content = section.trim();
          
          if (content.length > 50) { // Only include substantial content
            results.push({
              id: `result-${index}`,
              title: `Building Regulations - ${partOrSection}`,
              content: content.length > 300 ? content.substring(0, 300) + '...' : content,
              part: partOrSection.includes('Part') ? partOrSection : query.part || 'Building Regulations',
              section: partOrSection.includes('Section') ? partOrSection.replace('Section ', '') : '1.0',
              relevanceScore: Math.max(0.7, 1 - (index * 0.1)),
              images: index === 1 ? formattedImages : [] // Attach images to first result
            });
          }
        }
      });
    }
    
    // If no structured sections found, create a single comprehensive result
    if (results.length === 0) {
      const title = query.part ? 
        `Building Regulations - ${query.part}` : 
        `Building Regulations: ${query.text}`;
        
      results.push({
        id: 'result-1',
        title: title,
        content: response.length > 400 ? response.substring(0, 400) + '...' : response,
        part: query.part || 'Building Regulations',
        section: '1.0',
        relevanceScore: 0.95,
        images: formattedImages
      });
    }

    console.log('Generated results with images:', results);
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

  const handleBackToFilters = () => {
    setShowFilters(true);
    setSearchResults([]);
    setSearchQuery({ text: '' });
  };

  return (
    <div className="flex-1 bg-black text-white">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Advanced Search</h1>
              <p className="text-gray-400">Search through UK Building Regulations with advanced filters and tools</p>
            </div>
            {!showFilters && searchResults.length > 0 && (
              <Button
                variant="outline"
                onClick={handleBackToFilters}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Filters
              </Button>
            )}
          </div>
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
              {showFilters ? (
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
              ) : (
                // Full screen results
                <SearchResults
                  results={searchResults}
                  isSearching={isSearching}
                  query={searchQuery}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              )}
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
