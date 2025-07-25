import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface ProjectFilters {
  context: 'all' | 'personal' | 'team';
  projectType: string;
  status: string;
  search: string;
}

interface ProjectFiltersComponentProps {
  filters: ProjectFilters;
  onFiltersChange: (filters: ProjectFilters) => void;
  showContextFilter?: boolean;
  projectCount?: number;
}

const PROJECT_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'Residential', label: 'Residential' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Industrial', label: 'Industrial' },
  { value: 'Infrastructure', label: 'Infrastructure' },
];

const PROJECT_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'setup', label: 'Set-up' },
  { value: 'planning', label: 'Planning' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
];

const PROJECT_CONTEXTS = [
  { value: 'all', label: 'All Projects' },
  { value: 'personal', label: 'Personal Projects' },
  { value: 'team', label: 'Team Projects' },
];

const ProjectFiltersComponent = ({ 
  filters, 
  onFiltersChange, 
  showContextFilter = false,
  projectCount 
}: ProjectFiltersComponentProps) => {
  const updateFilter = (key: keyof ProjectFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    onFiltersChange({
      context: 'all',
      projectType: 'all',
      status: 'all',
      search: ''
    });
  };
    
    return (
      <div className="space-y-3 sm:space-y-4 w-full">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
          {showContextFilter && (
            <Select value={filters.context} onValueChange={(value) => updateFilter('context', value)}>
              <SelectTrigger className="bg-background border-border text-foreground h-12 sm:h-10 w-full sm:w-40 touch-manipulation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {PROJECT_CONTEXTS.map((context) => (
                  <SelectItem key={context.value} value={context.value} className="min-h-[44px] sm:min-h-auto">
                    {context.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={filters.projectType} onValueChange={(value) => updateFilter('projectType', value)}>
            <SelectTrigger className="bg-background border-border text-foreground h-12 sm:h-10 w-full sm:w-36 touch-manipulation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
              {PROJECT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value} className="min-h-[44px] sm:min-h-auto">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger className="bg-background border-border text-foreground h-12 sm:h-10 w-full sm:w-36 touch-manipulation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
              {PROJECT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value} className="min-h-[44px] sm:min-h-auto">
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={clearFilters} 
            className="bg-background border-border text-foreground hover:bg-muted h-12 sm:h-10 w-full sm:w-auto touch-manipulation"
          >
            Clear
          </Button>
        </div>

        {/* Results Count */}
        {projectCount !== undefined && (
          <p className="text-sm text-muted-foreground px-1">
            {projectCount} project{projectCount !== 1 ? 's' : ''} found
          </p>
        )}
      </div>
    );
};

export default ProjectFiltersComponent;