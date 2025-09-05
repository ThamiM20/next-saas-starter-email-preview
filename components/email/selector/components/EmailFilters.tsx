import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmailFiltersProps } from '../types';

export function EmailFilters({
  searchQuery,
  onSearchChange,
  onFilterChange,
  activeFilter,
  availableFolders,
}: EmailFiltersProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search emails..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" className="ml-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              {activeFilter === 'all' ? 'All' : activeFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onFilterChange('filter', 'all')}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange('filter', 'unread')}>
              Unread
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange('filter', 'starred')}>
              Starred
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange('filter', 'important')}>
              Important
            </DropdownMenuItem>
            {availableFolders.map((folder) => (
              <DropdownMenuItem 
                key={folder.id}
                onClick={() => onFilterChange('folder', folder.id)}
              >
                {folder.name} ({folder.count})
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
