import React from 'react';
import { Plus, FolderPlus, FileText, Calendar, Upload } from 'lucide-react';
import BaseWidget from '../BaseWidget';
import { BaseWidgetProps } from '../types';
import { Button } from '@/components/ui/button';

interface QuickCreateWidgetProps extends BaseWidgetProps {
  onCreateProject?: () => void;
  onCreateTask?: () => void;
  onCreateDocument?: () => void;
  onCreateMeeting?: () => void;
}

const QuickCreateWidget: React.FC<QuickCreateWidgetProps> = ({
  onCreateProject,
  onCreateTask,
  onCreateDocument,
  onCreateMeeting,
  ...props
}) => {
  const quickActions = [
    {
      label: 'New Project',
      icon: FolderPlus,
      action: onCreateProject,
      color: 'hover:bg-emerald-900/30 hover:border-emerald-500/50'
    },
    {
      label: 'Add Task',
      icon: FileText,
      action: onCreateTask,
      color: 'hover:bg-blue-900/30 hover:border-blue-500/50'
    },
    {
      label: 'Upload Doc',
      icon: Upload,
      action: onCreateDocument,
      color: 'hover:bg-purple-900/30 hover:border-purple-500/50'
    },
    {
      label: 'Schedule',
      icon: Calendar,
      action: onCreateMeeting,
      color: 'hover:bg-orange-900/30 hover:border-orange-500/50'
    }
  ];

  return (
    <BaseWidget
      {...props}
      title="Quick Create"
      icon={Plus}
    >
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant="ghost"
              onClick={action.action}
              className={`h-auto p-3 flex flex-col items-center gap-2 border border-gray-700 ${action.color} transition-all`}
            >
              <Icon className="w-5 h-5 text-gray-300" />
              <span className="text-xs text-gray-300">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </BaseWidget>
  );
};

export default QuickCreateWidget;