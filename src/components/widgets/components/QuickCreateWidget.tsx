import React from 'react';
import { Plus, FileText, CheckSquare, Upload, FolderPlus } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { Button } from '@/components/ui/button';

const QuickCreateWidget: React.FC<BaseWidgetProps> = (props) => {
  const quickActions = [
    {
      icon: FileText,
      label: 'New Project',
      color: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
      action: () => {
        // Navigate to create project
        window.location.hash = '#create-project';
      }
    },
    {
      icon: CheckSquare,
      label: 'Quick Task',
      color: 'bg-green-500/20 text-green-400 hover:bg-green-500/30',
      action: () => {
        // Quick task creation
        console.log('Create quick task');
      }
    },
    {
      icon: Upload,
      label: 'Upload Doc',
      color: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
      action: () => {
        // Document upload
        console.log('Upload document');
      }
    },
    {
      icon: FolderPlus,
      label: 'New Folder',
      color: 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30',
      action: () => {
        // Create folder
        console.log('Create folder');
      }
    }
  ];

  return (
    <BaseWidget {...props} title="Quick Create" icon={Plus}>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className={`h-auto p-3 flex flex-col gap-2 transition-all ${action.color}`}
            onClick={action.action}
          >
            <action.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs border-gray-600 hover:border-gray-500"
        >
          <Plus className="w-3 h-3 mr-1" />
          More Actions
        </Button>
      </div>
    </BaseWidget>
  );
};

export default QuickCreateWidget;