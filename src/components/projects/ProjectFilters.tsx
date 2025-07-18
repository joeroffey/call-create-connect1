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
      <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/30 rounded-2xl p-6">
        {/* Search - Full Width */}
        <div className="mb-6">
          <Input
            placeholder="Search projects..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="bg-gray-800/40 border-gray-700/40 text-white placeholder-gray-400 h-12 text-lg rounded-xl"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Filter Selects */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Context Filter */}
            {showContextFilter && (
              <Select value={filters.context} onValueChange={(value) => updateFilter('context', value)}>
                <SelectTrigger className="bg-gray-800/40 border-gray-700/40 text-white h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800/95 border border-gray-700/50 text-white rounded-xl">
                  {PROJECT_CONTEXTS.map((context) => (
                    <SelectItem key={context.value} value={context.value}>
                      {context.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Project Type & Status */}
            <div className="flex gap-4 flex-1">
              <Select value={filters.projectType} onValueChange={(value) => updateFilter('projectType', value)}>
                <SelectTrigger className="bg-gray-800/40 border-gray-700/40 text-white h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800/95 border border-gray-700/50 text-white rounded-xl">
                  {PROJECT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger className="bg-gray-800/40 border-gray-700/40 text-white h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800/95 border border-gray-700/50 text-white rounded-xl">
                  {PROJECT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clear Button */}
          <Button 
            variant="outline" 
            onClick={clearFilters} 
            className="bg-gray-800/40 border-gray-700/40 text-white hover:bg-gray-700/40 h-12 px-8 rounded-xl font-medium shrink-0"
          >
            Clear
          </Button>
        </div>

        {/* Results Count */}
        {projectCount !== undefined && (
          <div className="mt-6 pt-4 border-t border-gray-800/20">
            <p className="text-gray-400 font-medium">
              {projectCount} project{projectCount !== 1 ? 's' : ''} found
            </p>
          </div>
        )}
      </div>
    );
};

export default ProjectFiltersComponent;