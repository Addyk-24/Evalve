import { useState, useMemo } from 'react';
import { Navigation } from '@/components/Navigation';
import { FilterSidebar, FilterOptions } from '@/components/FilterSidebar';
import { InvestorCard, Investor } from '@/components/InvestorCard';
import { EditableProfileModal } from '@/components/EditableProfileModal';
import { mockInvestors } from '@/data/mockInvestors';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Index = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    investmentRange: [100000, 10000000],
    industries: [],
    stages: [],
    locations: [],
    minRating: 0,
  });

  const filteredInvestors = useMemo(() => {
    return mockInvestors.filter((investor) => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          investor.name.toLowerCase().includes(searchLower) ||
          investor.firm.toLowerCase().includes(searchLower) ||
          investor.location.toLowerCase().includes(searchLower) ||
          investor.industries.some(industry => 
            industry.toLowerCase().includes(searchLower)
          );
        if (!matchesSearch) return false;
      }

      // Investment range filter
      const investorMax = investor.investmentRange.max;
      const investorMin = investor.investmentRange.min;
      if (investorMax < filters.investmentRange[0] || investorMin > filters.investmentRange[1]) {
        return false;
      }

      // Industries filter
      if (filters.industries.length > 0) {
        const hasMatchingIndustry = filters.industries.some(industry =>
          investor.industries.includes(industry)
        );
        if (!hasMatchingIndustry) return false;
      }

      // Stages filter
      if (filters.stages.length > 0) {
        const hasMatchingStage = filters.stages.some(stage =>
          investor.stage.includes(stage)
        );
        if (!hasMatchingStage) return false;
      }

      // Locations filter
      if (filters.locations.length > 0) {
        if (!filters.locations.includes(investor.location)) return false;
      }

      // Rating filter
      if (filters.minRating > 0 && investor.rating < filters.minRating) {
        return false;
      }

      return true;
    });
  }, [mockInvestors, searchQuery, filters]);

  const clearFilters = () => {
    setFilters({
      investmentRange: [100000, 10000000],
      industries: [],
      stages: [],
      locations: [],
      minRating: 0,
    });
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation onViewProfile={() => setIsProfileOpen(true)} />
      
      <div className="flex">
        <div className="animate-fade-in-left">
          <FilterSidebar
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
          />
        </div>
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4 mb-8 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Find Your Perfect Investor</h1>
                  <p className="text-muted-foreground mt-1">
                    Connect with {filteredInvestors.length} investors who match your startup
                  </p>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search investors, firms, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Results */}
            {filteredInvestors.length === 0 ? (
              <div className="text-center py-12 animate-fade-in-up">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No investors found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  className="text-primary hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-right">
                {filteredInvestors.map((investor, index) => (
                  <div 
                    key={investor.id} 
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <InvestorCard investor={investor} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <EditableProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
};

export default Index;
