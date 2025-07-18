
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Plus, X, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWidgetData } from './hooks/useWidgetData';
import { widgetRegistry, getWidgetIcon } from './registry';
import { WorkspaceType, WidgetLayout, WidgetType } from './types';
import BaseWidget from './BaseWidget';

interface DashboardProps {
  userId: string;
  teamId?: string;
  workspaceType: WorkspaceType;
  onCreateProject?: () => void;
  onViewProject?: (projectId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  userId, 
  teamId, 
  workspaceType,
  onCreateProject,
  onViewProject 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showWidgetGallery, setShowWidgetGallery] = useState(false);
  const { widgets, loading, addWidget, removeWidget, updateWidget, refetch } = useWidgetData(
    userId, 
    teamId, 
    workspaceType
  );

  // Refetch widgets when component becomes visible (user navigates back to overview)
  useEffect(() => {
    if (userId) {
      refetch();
    }
  }, [userId, teamId, workspaceType, refetch]);

  const handleAddWidget = async (type: WidgetType) => {
    const widgetInfo = widgetRegistry[type];
    const newWidget: WidgetLayout = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 0, y: widgets.length },
      size: widgetInfo.defaultSize,
      config: { 
        refreshRate: 'hour',
        dataRange: 'week'
      }
    };
    
    try {
      await addWidget(newWidget);
      setShowWidgetGallery(false);
    } catch (error) {
      // Error handling is done in addWidget
    }
  };

  const renderWidget = (widget: WidgetLayout) => {
    const WidgetComponent = widgetRegistry[widget.type]?.component;
    
    if (!WidgetComponent) {
      return (
        <BaseWidget
          key={widget.id}
          id={widget.id}
          title={`Unknown Widget: ${widget.type}`}
          size={widget.size}
          config={widget.config}
          isEditing={isEditing}
          onRemove={() => removeWidget(widget.id)}
        >
          <div className="text-center py-8 text-gray-400">
            Widget not found
          </div>
        </BaseWidget>
      );
    }

    return (
      <WidgetComponent
        key={widget.id}
        id={widget.id}
        size={widget.size}
        config={widget.config}
        isEditing={isEditing}
        onConfigChange={(config) => updateWidget(widget.id, { config })}
        onRemove={() => removeWidget(widget.id)}
      />
    );
  };

  const getWidgetsByCategory = () => {
    const categories = {
      statistics: [] as WidgetType[],
      calendar: [] as WidgetType[],
      actions: [] as WidgetType[],
      progress: [] as WidgetType[],
      team: [] as WidgetType[],
      personal: [] as WidgetType[]
    };

    Object.entries(widgetRegistry).forEach(([type, info]) => {
      // Filter out team widgets for personal workspace
      if (workspaceType === 'personal' && info.category === 'team') return;
      categories[info.category].push(type as WidgetType);
    });

    return categories;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          {workspaceType === 'personal' ? 'Personal' : 'Team'} Dashboard
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto self-start sm:self-auto">
          <div className="flex gap-2">
            <Button
              onClick={refetch}
              variant="outline"
              className="text-gray-400 hover:text-white flex-1 sm:flex-initial"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "default" : "outline"}
              className={`flex-1 sm:flex-initial ${isEditing ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Done
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                </>
              )}
            </Button>
          </div>
          
          {isEditing && (
            <Button
              onClick={() => setShowWidgetGallery(true)}
              className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Widget
            </Button>
          )}
        </div>
      </div>

      {/* Widgets Grid - Responsive grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max pb-24 md:pb-6">
        <AnimatePresence>
          {widgets.map(renderWidget)}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="text-center py-16">
          <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No widgets added</h3>
          <p className="text-gray-400 mb-6">
            Customize your dashboard by adding widgets that matter to you
          </p>
          <Button 
            onClick={() => {
              setIsEditing(true);
              setShowWidgetGallery(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Widget
          </Button>
        </div>
      )}

      {/* Widget Gallery Modal */}
      <AnimatePresence>
        {showWidgetGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWidgetGallery(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Add Widget</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWidgetGallery(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {Object.entries(getWidgetsByCategory()).map(([category, widgetTypes]) => {
                if (widgetTypes.length === 0) return null;
                
                return (
                  <div key={category} className="mb-8">
                    <h4 className="text-lg font-medium text-white mb-4 capitalize">
                      {category} Widgets
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {widgetTypes.map((type) => {
                        const info = widgetRegistry[type];
                        const Icon = getWidgetIcon(type);
                        
                        return (
                          <motion.div
                            key={type}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-4 bg-gray-800/50 border border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-all"
                            onClick={() => handleAddWidget(type)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Icon className="w-5 h-5 text-emerald-400" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-white mb-1">{info.name}</h5>
                                <p className="text-sm text-gray-400">{info.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
