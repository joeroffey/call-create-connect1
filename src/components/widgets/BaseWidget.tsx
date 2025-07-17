import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Settings, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { WidgetSize, WidgetConfig } from './types';

interface BaseWidgetProps {
  id: string;
  title: string;
  size: WidgetSize;
  config: WidgetConfig;
  onConfigChange?: (config: WidgetConfig) => void;
  onRemove?: () => void;
  isEditing?: boolean;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}

const sizeClasses = {
  small: 'col-span-1 row-span-1',
  medium: 'col-span-2 row-span-1',
  large: 'col-span-2 row-span-2',
  wide: 'col-span-3 row-span-1',
};

const BaseWidget: React.FC<BaseWidgetProps> = ({
  id,
  title,
  size,
  config,
  onConfigChange,
  onRemove,
  isEditing = false,
  children,
  icon: Icon
}) => {
  const getGridSpan = () => {
    switch (size) {
      case 'small': return 'col-span-3';
      case 'medium': return 'col-span-6';
      case 'large': return 'col-span-6 row-span-2';
      case 'wide': return 'col-span-12';
      default: return 'col-span-6';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`${getGridSpan()} min-h-[200px]`}
    >
      <Card className="h-full bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700 hover:border-gray-600 transition-all">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-white flex items-center gap-2 text-sm font-medium">
            {Icon && <Icon className="w-4 h-4" />}
            {title}
          </CardTitle>
          
          {isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                <DropdownMenuItem 
                  onClick={() => onConfigChange?.(config)}
                  className="text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onRemove}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 p-4 pt-0">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BaseWidget;