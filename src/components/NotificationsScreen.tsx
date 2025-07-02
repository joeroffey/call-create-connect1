
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Calendar, 
  Tag, 
  Filter,
  Search,
  Clock,
  Building,
  Home,
  Factory,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BuildingRegulationUpdate {
  id: string;
  title: string;
  description: string;
  effectiveDate: string;
  publishedDate: string;
  categories: Array<'residential' | 'commercial' | 'industrial' | 'mixed-use'>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sections: string[];
  isRead: boolean;
}

// Mock data - in real app this would come from your database
const mockUpdates: BuildingRegulationUpdate[] = [
  {
    id: '1',
    title: 'Fire Safety Requirements Update - Part B',
    description: 'New requirements for fire safety systems in residential buildings over 18 metres. Enhanced sprinkler system specifications and evacuation route standards.',
    effectiveDate: '2024-04-01',
    publishedDate: '2024-01-15',
    categories: ['residential'],
    severity: 'high',
    sections: ['Part B - Fire Safety', 'Section 2.3 - Sprinkler Systems'],
    isRead: false
  },
  {
    id: '2',
    title: 'Accessibility Standards - Part M Amendment',
    description: 'Updated accessibility requirements for commercial buildings including new lift specifications and accessible parking provisions.',
    effectiveDate: '2024-03-15',
    publishedDate: '2024-01-10',
    categories: ['commercial', 'mixed-use'],
    severity: 'medium',
    sections: ['Part M - Access', 'Section 4.2 - Lifts'],
    isRead: true
  },
  {
    id: '3',
    title: 'Energy Efficiency Standards - Part L Updates',
    description: 'Revised thermal performance standards for new constructions. Updated U-values and air permeability requirements.',
    effectiveDate: '2024-05-01',
    publishedDate: '2024-02-01',
    categories: ['residential', 'commercial', 'industrial'],
    severity: 'medium',
    sections: ['Part L - Conservation of Fuel and Power'],
    isRead: false
  },
  {
    id: '4',
    title: 'Critical Safety Update - Structural Requirements',
    description: 'Emergency update to structural requirements following recent safety assessments. Immediate compliance required for all new applications.',
    effectiveDate: '2024-02-15',
    publishedDate: '2024-02-10',
    categories: ['residential', 'commercial', 'industrial', 'mixed-use'],
    severity: 'critical',
    sections: ['Part A - Structure', 'Part B - Fire Safety'],
    isRead: false
  }
];

const NotificationsScreen = () => {
  const [updates, setUpdates] = useState<BuildingRegulationUpdate[]>(mockUpdates);
  const [filteredUpdates, setFilteredUpdates] = useState<BuildingRegulationUpdate[]>(mockUpdates);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    let filtered = updates;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(update =>
        update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        update.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        update.sections.some(section => section.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(update =>
        update.categories.includes(categoryFilter as any)
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(update => update.severity === severityFilter);
    }

    // Unread filter
    if (showUnreadOnly) {
      filtered = filtered.filter(update => !update.isRead);
    }

    setFilteredUpdates(filtered);
  }, [updates, searchTerm, categoryFilter, severityFilter, showUnreadOnly]);

  const markAsRead = (id: string) => {
    setUpdates(prev => prev.map(update =>
      update.id === id ? { ...update, isRead: true } : update
    ));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'residential': return <Home className="w-3 h-3" />;
      case 'commercial': return <Building className="w-3 h-3" />;
      case 'industrial': return <Factory className="w-3 h-3" />;
      case 'mixed-use': return <Building className="w-3 h-3" />;
      default: return <Building className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'residential': return 'bg-green-100 text-green-800 border-green-200';
      case 'commercial': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'industrial': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'mixed-use': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'high': return 'bg-orange-50 border-orange-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const unreadCount = updates.filter(update => !update.isRead).length;

  return (
    <div className="flex-1 flex flex-col bg-transparent text-white">
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Building Regulation Updates</h1>
              <p className="text-gray-400">Stay informed about the latest regulatory changes</p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-300 text-sm">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                You have {unreadCount} unread regulation update{unreadCount !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-800 p-6 mb-6"
        >
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search updates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-gray-800/50 border-gray-700 text-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="mixed-use">Mixed Use</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-gray-800/50 border-gray-700 text-white">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className="w-full lg:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Unread Only
            </Button>
          </div>
        </motion.div>

        {/* Updates List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredUpdates.length === 0 ? (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Updates Found</h3>
                <p className="text-gray-400">Try adjusting your filters to see more updates.</p>
              </CardContent>
            </Card>
          ) : (
            filteredUpdates.map((update, index) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-all cursor-pointer ${
                  !update.isRead ? 'ring-2 ring-emerald-500/20' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getSeverityIcon(update.severity)}
                          <CardTitle className={`text-lg ${!update.isRead ? 'text-white' : 'text-gray-300'}`}>
                            {update.title}
                          </CardTitle>
                          {!update.isRead && (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {update.categories.map((category) => (
                            <Badge
                              key={category}
                              variant="outline"
                              className={`${getCategoryColor(category)} border text-xs`}
                            >
                              {getCategoryIcon(category)}
                              <span className="ml-1 capitalize">{category.replace('-', ' ')}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-gray-400 mb-4 line-clamp-2">{update.description}</p>
                    
                    <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:items-center lg:justify-between">
                      <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-6">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Effective: {formatDate(update.effectiveDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Published: {formatDate(update.publishedDate)}</span>
                        </div>
                      </div>
                      
                      {!update.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsRead(update.id)}
                          className="text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <div className="flex flex-wrap gap-1">
                          {update.sections.map((section, idx) => (
                            <span key={idx} className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NotificationsScreen;
