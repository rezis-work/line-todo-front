'use client';

import { TodoFilters as TodoFiltersType, TodoStatus, TodoPriority } from '@/types/api';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface TodoFiltersProps {
  filters: TodoFiltersType;
  onFiltersChange: (filters: TodoFiltersType) => void;
  onReset: () => void;
}

export function TodoFilters({
  filters,
  onFiltersChange,
  onReset,
}: TodoFiltersProps) {
  const updateFilter = <K extends keyof TodoFiltersType>(
    key: K,
    value: TodoFiltersType[K] | 'none' | boolean
  ) => {
    if (value === 'none') {
      onFiltersChange({ ...filters, [key]: undefined });
    } else {
      onFiltersChange({ ...filters, [key]: value as TodoFiltersType[K] });
    }
  };

  const hasActiveFilters =
    filters.status ||
    filters.priority ||
    filters.assignedToId ||
    filters.search ||
    filters.overdue !== undefined;

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search todos..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value || undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filters.status || 'none'}
            onValueChange={(value) =>
              updateFilter('status', value as TodoStatus | 'none')
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All statuses</SelectItem>
              <SelectItem value={TodoStatus.TODO}>Todo</SelectItem>
              <SelectItem value={TodoStatus.IN_PROGRESS}>
                In Progress
              </SelectItem>
              <SelectItem value={TodoStatus.DONE}>Done</SelectItem>
              <SelectItem value={TodoStatus.CANCELLED}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={filters.priority || 'none'}
            onValueChange={(value) =>
              updateFilter('priority', value as TodoPriority | 'none')
            }
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All priorities</SelectItem>
              <SelectItem value={TodoPriority.LOW}>Low</SelectItem>
              <SelectItem value={TodoPriority.MEDIUM}>Medium</SelectItem>
              <SelectItem value={TodoPriority.HIGH}>High</SelectItem>
              <SelectItem value={TodoPriority.URGENT}>Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="overdue">Overdue</Label>
          <Select
            value={
              filters.overdue === undefined
                ? 'none'
                : filters.overdue
                  ? 'true'
                  : 'false'
            }
            onValueChange={(value) =>
              updateFilter(
                'overdue',
                value === 'none' ? ('none' as const) : value === 'true'
              )
            }
          >
            <SelectTrigger id="overdue">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">All</SelectItem>
              <SelectItem value="true">Overdue only</SelectItem>
              <SelectItem value="false">Not overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortBy">Sort By</Label>
          <Select
            value={filters.sortBy || 'createdAt'}
            onValueChange={(value) =>
              updateFilter('sortBy', value as TodoFiltersType['sortBy'])
            }
          >
            <SelectTrigger id="sortBy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="updatedAt">Updated Date</SelectItem>
              <SelectItem value="dueAt">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Order</Label>
          <Select
            value={filters.sortOrder || 'desc'}
            onValueChange={(value) =>
              updateFilter('sortOrder', value as 'asc' | 'desc')
            }
          >
            <SelectTrigger id="sortOrder">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

