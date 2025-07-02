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
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Input
              placeholder="Search projects..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400"
            />
          </div>

          {/* Context Filter */}
          {showContextFilter && (
            <Select value={filters.context} onValueChange={(value) => updateFilter('context', value)}>
              <SelectTrigger className="w-[180px] bg-gray-800/50 border-gray-700/50 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800/95 border border-gray-700/50 text-white">
                {PROJECT_CONTEXTS.map((context) => (
                  <SelectItem key={context.value} value={context.value}>
                    {context.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Project Type */}
          <Select value={filters.projectType} onValueChange={(value) => updateFilter('projectType', value)}>
            <SelectTrigger className="w-[150px] bg-gray-800/50 border-gray-700/50 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800/95 border border-gray-700/50 text-white">
              {PROJECT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
            <SelectTrigger className="w-[140px] bg-gray-800/50 border-gray-700/50 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800/95 border border-gray-700/50 text-white">
              {PROJECT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Button */}
          <Button variant="outline" onClick={clearFilters} className="text-white border-gray-700">
            Clear
          </Button>
        </div>

        {/* Results Count */}
        {projectCount !== undefined && (
          <div className="mt-3 pt-3 border-t border-gray-800/30">
            <p className="text-sm text-gray-400">
              {projectCount} project{projectCount !== 1 ? 's' : ''} found
            </p>
          </div>
        )}
      </div>
    );
};

export default ProjectFiltersComponent;