import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, ExternalLink, FileText, AlertCircle, Loader2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ImageGallery from '../chat/ImageGallery';

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

interface SearchQuery {
  text: string;
  part?: string;
  buildingType?: string;
  topic?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  isSearching: boolean;
  query: SearchQuery;
  favorites: SearchResult[];
  onToggleFavorite: (result: SearchResult) => void;
}

const SearchResults = ({ results, isSearching, query, favorites, onToggleFavorite }: SearchResultsProps) => {
  const isFavorite = (result: SearchResult) => {
    return favorites.some(fav => fav.id === result.id);
  };

  if (isSearching) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Searching UK Building Regulations...</p>
          <p className="text-sm text-gray-500 mt-2">Analyzing regulations and requirements</p>
        </motion.div>
      </div>
    );
  }

  if (!query.text && results.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Search Building Regulations</h3>
          <p className="text-gray-400">
            Use the search filters on the left to find specific UK Building Regulations requirements, 
            compliance information, and guidance.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Try searching for:</p>
            <ul className="mt-2 space-y-1">
              <li>• "fire safety requirements"</li>
              <li>• "structural calculations"</li>
              <li>• "accessibility compliance"</li>
              <li>• "energy efficiency standards"</li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  if (results.length === 0 && query.text) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
          <p className="text-gray-400 mb-4">
            No regulations found matching your search criteria. Try adjusting your search terms or filters.
          </p>
          <div className="text-sm text-gray-500">
            <p>Suggestions:</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• Use more general terms</li>
              <li>• Check spelling and try alternative words</li>
              <li>• Remove some filters to broaden the search</li>
              <li>• Try searching for specific Part letters (A, B, C, etc.)</li>
            </ul>
          </div>
        </motion.div>
      </div>
    );
  }

  // Check if there's an error result
  const hasError = results.some(result => result.part === 'System' && result.section === 'Error');

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6">
        {/* Results Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            Search Results ({results.length})
          </h2>
          {query.text && (
            <div className="text-gray-400">
              <p className="mb-1 break-words">
                Results for "<span className="text-emerald-400 font-medium">{query.text}</span>"
              </p>
              {(query.part || query.buildingType || query.topic) && (
                <div className="text-sm space-x-2 flex flex-wrap gap-1">
                  {query.part && (
                    <span className="inline-block px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded text-xs">
                      {query.part}
                    </span>
                  )}
                  {query.buildingType && (
                    <span className="inline-block px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                      {query.buildingType}
                    </span>
                  )}
                  {query.topic && (
                    <span className="inline-block px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs">
                      {query.topic}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Alert */}
        {hasError && (
          <Alert className="mb-6 border-red-600 bg-red-600/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-300">
              {results.find(r => r.part === 'System')?.content || 
               'There was an issue performing the search. Please try again or contact support if the problem persists.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Results List */}
        <div className="space-y-4">
          <AnimatePresence>
            {results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${
                  hasError && result.part === 'System' 
                    ? 'bg-red-900/20 border-red-600' 
                    : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70'
                } transition-colors overflow-hidden`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <CardTitle className="text-white text-lg mb-2 break-words hyphens-auto leading-relaxed">
                          {result.title}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 flex-wrap gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            hasError && result.part === 'System' 
                              ? 'bg-red-600/20 text-red-400' 
                              : 'bg-emerald-600/20 text-emerald-400'
                          }`}>
                            {result.part}
                          </span>
                          {result.section !== 'Error' && (
                            <>
                              <span className="text-gray-500">Section {result.section}</span>
                              <span className="text-gray-500">
                                Relevance: {Math.round(result.relevanceScore * 100)}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {!hasError && result.part !== 'System' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleFavorite(result)}
                          className={`flex-shrink-0 ${
                            isFavorite(result) ? 'text-yellow-500' : 'text-gray-400'
                          } hover:text-yellow-500 transition-colors`}
                        >
                          <Star className={`w-5 h-5 ${isFavorite(result) ? 'fill-current' : ''}`} />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="prose prose-sm prose-invert max-w-none">
                      <div className="text-gray-300 leading-relaxed break-words hyphens-auto overflow-wrap-anywhere">
                        {result.content}
                      </div>
                    </div>
                    
                    {/* Display images if available */}
                    {result.images && result.images.length > 0 && (
                      <div className="mt-4">
                        <ImageGallery images={result.images} />
                      </div>
                    )}
                    
                    {!hasError && result.part !== 'System' && (
                      <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Full Regulation
                        </Button>
                        
                        {result.images && result.images.length > 0 && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Image className="w-3 h-3 mr-1" />
                            {result.images.length} image{result.images.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
