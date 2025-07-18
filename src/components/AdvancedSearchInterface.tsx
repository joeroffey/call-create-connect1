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

      // Build enhanced search message incorporating filters for better Pinecone matching
      let searchMessage = query.text;
      const filters = [];
      const contextKeywords = [];

      if (query.part) {
        const partMapping = {
          'part-a': 'Part A Structure structural requirements load bearing walls foundations',
          'part-b': 'Part B Fire Safety fire protection escape routes fire doors fire resistance',
          'part-c': 'Part C Site Preparation ground conditions contaminated land',
          'part-d': 'Part D Toxic Substances cavity insulation materials',
          'part-e': 'Part E Sound acoustic insulation noise control party walls',
          'part-f': 'Part F Ventilation air quality mechanical natural ventilation',
          'part-g': 'Part G Sanitation water supply drainage hot water storage',
          'part-h': 'Part H Drainage surface water foul water sewers',
          'part-j': 'Part J Combustion Appliances heating flues chimneys gas appliances',
          'part-k': 'Part K Protection from Falls stairs handrails barriers',
          'part-l': 'Part L Conservation of Fuel energy efficiency thermal insulation',
          'part-m': 'Part M Access and Facilities disabled access wheelchair accessibility',
          'part-n': 'Part N Glazing Safety safety glass impact resistance',
          'part-p': 'Part P Electrical Safety electrical installations circuits'
        };
        const partContext = partMapping[query.part] || query.part;
        filters.push(`focusing on ${partContext}`);
        contextKeywords.push(partContext);
      }
      
      if (query.buildingType) {
        const typeContext = `${query.buildingType} buildings construction requirements`;
        filters.push(`for ${typeContext}`);
        contextKeywords.push(typeContext);
      }
      
      if (query.topic) {
        const topicMapping = {
          'fire-safety': 'fire safety protection systems escape routes detection',
          'structural': 'structural engineering foundations load bearing elements',
          'accessibility': 'accessibility disabled access wheelchair provisions',
          'energy-efficiency': 'energy efficiency thermal performance insulation',
          'ventilation': 'ventilation air quality mechanical natural systems',
          'drainage': 'drainage water systems surface foul sewerage',
          'electrical': 'electrical safety installations circuits protection',
          'glazing': 'glazing safety glass windows impact resistance'
        };
        const topicContext = topicMapping[query.topic] || query.topic;
        filters.push(`related to ${topicContext}`);
        contextKeywords.push(topicContext);
      }

      // Enhanced search message with context keywords for better vector matching
      if (filters.length > 0) {
        searchMessage += ` (${filters.join(', ')})`;
      }
      
      // Add context keywords to improve Pinecone search relevance
      if (contextKeywords.length > 0) {
        searchMessage += ` ${contextKeywords.join(' ')}`;
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
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass border-b border-white/10 px-6 py-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
                Advanced Search
              </h1>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                Search through UK Building Regulations with advanced filters and tools
              </p>
            </div>

            {!showFilters && searchResults.length > 0 && (
              <Button
                variant="outline"
                onClick={handleBackToFilters}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white w-full md:w-auto"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="search" className="h-full flex flex-col">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass border-b border-white/10"
            >
              <TabsList className="bg-transparent border-none rounded-none w-full px-6 py-2 overflow-x-auto flex gap-1 scrollbar-hide justify-start">
                <TabsTrigger 
                  value="search" 
                  className="flex-shrink-0 px-6 py-3 rounded-xl bg-transparent text-gray-400 hover:text-emerald-300 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30 transition-all duration-200"
                >
                  Search
                </TabsTrigger>
                <TabsTrigger 
                  value="tools" 
                  className="flex-shrink-0 px-6 py-3 rounded-xl bg-transparent text-gray-400 hover:text-emerald-300 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30 transition-all duration-200"
                >
                  Quick Tools
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="flex-shrink-0 px-6 py-3 rounded-xl bg-transparent text-gray-400 hover:text-emerald-300 data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-300 data-[state=active]:border data-[state=active]:border-emerald-500/30 transition-all duration-200"
                >
                  History & Favorites
                </TabsTrigger>
              </TabsList>
            </motion.div>


            <TabsContent value="search" className="flex-1 m-0">
              {showFilters ? (
                <div className="h-full">
                  <div className="md:hidden h-full flex flex-col">
                    {/* Mobile stacked layout */}
                    <div className="h-[40%] border-b border-gray-800 bg-gray-900/50 overflow-auto">
                      <SearchFilters
                        onSearch={handleSearch}
                        isSearching={isSearching}
                      />
                    </div>
                    <div className="flex-1 overflow-auto">
                      <SearchResults
                        results={searchResults}
                        isSearching={isSearching}
                        query={searchQuery}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                      />
                    </div>
                  </div>

                  <div className="hidden md:block h-full">
                    {/* Desktop side-by-side layout */}
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                      <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                        <div className="h-full border-r border-gray-800 bg-gray-900/50">
                          <SearchFilters
                            onSearch={handleSearch}
                            isSearching={isSearching}
                          />
                        </div>
                      </ResizablePanel>
                      <ResizableHandle withHandle />
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
                  </div>
                </div>
              ) : (
                // Fullscreen results
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
