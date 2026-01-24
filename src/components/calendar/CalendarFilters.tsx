'use client';

import { CalendarEventFilters } from '@/types/api';
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

interface CalendarFiltersProps {
  filters: CalendarEventFilters;
  onFiltersChange: (filters: CalendarEventFilters) => void;
}

export function CalendarFilters({
  filters,
  onFiltersChange,
}: CalendarFiltersProps) {
  const updateFilter = <K extends keyof CalendarEventFilters>(
    key: K,
    value: CalendarEventFilters[K] | 'none'
  ) => {
    if (value === 'none') {
      onFiltersChange({ ...filters, [key]: undefined });
    } else {
      onFiltersChange({ ...filters, [key]: value as CalendarEventFilters[K] });
    }
  };

  const hasActiveFilters =
    filters.search ||
    filters.startAfter ||
    filters.startBefore ||
    filters.endAfter ||
    filters.endBefore ||
    filters.relatedTodoId;

  const resetFilters = () => {
    onFiltersChange({
      sortBy: 'startAt',
      sortOrder: 'asc',
      page: 1,
      limit: 50,
    });
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search events..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value || undefined)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startAfter">Start After</Label>
          <Input
            id="startAfter"
            type="datetime-local"
            value={filters.startAfter ? filters.startAfter.slice(0, 16) : ''}
            onChange={(e) =>
              updateFilter('startAfter', e.target.value ? e.target.value + ':00' : undefined)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startBefore">Start Before</Label>
          <Input
            id="startBefore"
            type="datetime-local"
            value={filters.startBefore ? filters.startBefore.slice(0, 16) : ''}
            onChange={(e) =>
              updateFilter('startBefore', e.target.value ? e.target.value + ':00' : undefined)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortBy">Sort By</Label>
          <Select
            value={filters.sortBy || 'startAt'}
            onValueChange={(value) =>
              updateFilter('sortBy', value as CalendarEventFilters['sortBy'])
            }
          >
            <SelectTrigger id="sortBy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="startAt">Start Date</SelectItem>
              <SelectItem value="endAt">End Date</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Select
            value={filters.sortOrder || 'asc'}
            onValueChange={(value) =>
              updateFilter('sortOrder', value as CalendarEventFilters['sortOrder'])
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

