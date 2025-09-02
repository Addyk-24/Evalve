import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Filter } from 'lucide-react';

export interface FilterOptions {
  investmentRange: [number, number];
  industries: string[];
  stages: string[];
  locations: string[];
  minRating: number;
}

interface FilterSidebarProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
}

const INDUSTRIES = [
  'FinTech', 'EdTech', 'HealthTech', 'E-commerce', 'SaaS', 'AI/ML',
  'Blockchain', 'IoT', 'Gaming', 'Food & Beverage', 'Real Estate', 'CleanTech'
];

const STAGES = ['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+'];

const LOCATIONS = [
  'San Francisco', 'New York', 'London', 'Singapore', 'Bangalore',
  'Berlin', 'Tel Aviv', 'Toronto', 'Sydney', 'Mumbai'
];

export function FilterSidebar({ filters, onFiltersChange, onClearFilters }: FilterSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'industries' | 'stages' | 'locations', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  const activeFiltersCount = 
    filters.industries.length + 
    filters.stages.length + 
    filters.locations.length + 
    (filters.minRating > 0 ? 1 : 0);

  if (isCollapsed) {
    return (
      <div className="w-16 h-screen bg-card border-r border-border/50">
        <div className="p-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8"
          >
            <Filter className="h-4 w-4" />
          </Button>
          {activeFiltersCount > 0 && (
            <Badge variant="destructive" className="mt-2 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-screen bg-card border-r border-border/50 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Filters</h2>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Investment Range */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Investment Range</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="px-3">
              <Slider
                value={filters.investmentRange}
                onValueChange={(value) => updateFilter('investmentRange', value as [number, number])}
                max={10000000}
                min={10000}
                step={50000}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatAmount(filters.investmentRange[0])}</span>
              <span>{formatAmount(filters.investmentRange[1])}</span>
            </div>
          </CardContent>
        </Card>

        {/* Industries */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Industries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {INDUSTRIES.map((industry) => (
              <div key={industry} className="flex items-center space-x-2">
                <Checkbox
                  id={industry}
                  checked={filters.industries.includes(industry)}
                  onCheckedChange={() => toggleArrayFilter('industries', industry)}
                />
                <Label htmlFor={industry} className="text-sm font-normal">
                  {industry}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Investment Stage */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Investment Stage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {STAGES.map((stage) => (
              <div key={stage} className="flex items-center space-x-2">
                <Checkbox
                  id={stage}
                  checked={filters.stages.includes(stage)}
                  onCheckedChange={() => toggleArrayFilter('stages', stage)}
                />
                <Label htmlFor={stage} className="text-sm font-normal">
                  {stage}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {LOCATIONS.map((location) => (
              <div key={location} className="flex items-center space-x-2">
                <Checkbox
                  id={location}
                  checked={filters.locations.includes(location)}
                  onCheckedChange={() => toggleArrayFilter('locations', location)}
                />
                <Label htmlFor={location} className="text-sm font-normal">
                  {location}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Minimum Rating */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Minimum Rating</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="px-3">
              <Slider
                value={[filters.minRating]}
                onValueChange={(value) => updateFilter('minRating', value[0])}
                max={5}
                min={0}
                step={0.5}
                className="w-full"
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {filters.minRating === 0 ? 'Any rating' : `${filters.minRating}+ stars`}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}