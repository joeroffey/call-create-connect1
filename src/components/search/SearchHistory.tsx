
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Star, Search, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface SearchHistoryProps {
  searchHistory: SearchQuery[];
  favorites: SearchResult[];
  onSearch: (query: SearchQuery) => void;
  onToggleFavorite: (result: SearchResult) => void;
}

const SearchHistory = ({ searchHistory, favorites, onSearch, onToggleFavorite }: SearchHistoryProps) => {
  const formatSearchQuery = (query: SearchQuery) => {
    let formatted = query.text;
    const filters = [];
    
    if (query.part) filters.push(`Part: ${query.part}`);
    if (query.buildingType) filters.push(`Type: ${query.buildingType}`);
    if (query.topic) filters.push(`Topic: ${query.topic}`);
    
    if (filters.length > 0) {
      formatted += ` (${filters.join(', ')})`;
    }
    
    return formatted;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-6">
          <TabsTrigger value="history" className="data-[state=active]:bg-gray-700">Search History</TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-gray-700">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <History className="w-5 h-5 mr-2 text-blue-400" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No recent searches</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {searchHistory.map((query, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700 hover:bg-gray-900/70 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">
                            {formatSearchQuery(query)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSearch(query)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                          >
                            <Search className="w-4 h-4 mr-1" />
                            Search Again
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Favorite Regulations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No favorite regulations yet</p>
                  <p className="text-gray-500 text-sm mt-1">Star regulations in search results to save them here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {favorites.map((favorite) => (
                      <motion.div
                        key={favorite.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-medium">{favorite.title}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onToggleFavorite(favorite)}
                            className="text-yellow-500 hover:text-yellow-400"
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-gray-400 mb-2">
                          <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded">
                            {favorite.part}
                          </span>
                          <span>Section {favorite.section}</span>
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-2">
                          {favorite.content}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchHistory;
