
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, ExternalLink, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  part: string;
  section: string;
  relevanceScore: number;
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
          <div className="w-12 h-12 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Searching UK Building Regulations...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
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
          className="text-center"
        >
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Search Building Regulations</h3>
          <p className="text-gray-400 max-w-md">
            Use the filters on the left to search through UK Building Regulations. 
            Find specific requirements, compliance information, and guidance.
          </p>
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
          className="text-center"
        >
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
          <p className="text-gray-400 max-w-md">
            No regulations found matching your search criteria. Try adjusting your filters or search terms.
          </p>
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
            <p className="text-gray-400">
              Results for "{query.text}"
              {query.part && ` in ${query.part}`}
              {query.buildingType && ` for ${query.buildingType} buildings`}
              {query.topic && ` related to ${query.topic}`}
            </p>
          )}
        </div>

        {/* Error Alert */}
        {hasError && (
          <Alert className="mb-6 border-red-600 bg-red-600/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-300">
              There was an issue performing the search. Please try again or contact support if the problem persists.
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
                <Card className={`${hasError && result.part === 'System' ? 'bg-red-900/20 border-red-600' : 'bg-gray-800/50 border-gray-700'} hover:bg-gray-800/70 transition-colors`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-1">
                          {result.title}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className={`px-2 py-1 rounded ${hasError && result.part === 'System' ? 'bg-red-600/20 text-red-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
                            {result.part}
                          </span>
                          {result.section !== 'Error' && (
                            <>
                              <span>Section {result.section}</span>
                              <span>Relevance: {Math.round(result.relevanceScore * 100)}%</span>
                            </>
                          )}
                        </div>
                      </div>
                      {!hasError && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleFavorite(result)}
                          className={`${isFavorite(result) ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500`}
                        >
                          <Star className={`w-5 h-5 ${isFavorite(result) ? 'fill-current' : ''}`} />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-300 mb-4">
                      {result.content}
                    </p>
                    {!hasError && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Full Regulation
                      </Button>
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
