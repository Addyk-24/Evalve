import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/FilterSidebar';
import StartupCard from '@/components/StartupCard';
import { useStartups } from '@/hooks/useStartups';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const Index = () => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  
  // Prepare API filters based on selected domain
  const apiFilters = useMemo(() => {
    const filters: any = { limit: 100 }; // Increased limit to get more data
    
    if (selectedDomain !== 'All' && selectedDomain !== 'Recent Registered') {
      filters.industry_sector = selectedDomain;
    }
    
    return filters;
  }, [selectedDomain]);

  const { startups, loading, error, refetch } = useStartups(apiFilters);

  // Filter and sort startups based on selected domain (client-side filtering for "Recent Registered")
  const filteredStartups = useMemo(() => {
    if (selectedDomain === 'All') {
      return startups;
    }
    if (selectedDomain === 'Recent Registered') {
      // Sort by registration date and return the most recent ones
      return [...startups]
        .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
        .slice(0, 6);
    }
    // For specific domains, the API already filtered, but double-check client-side
    return startups.filter(startup => startup.domain === selectedDomain);
  }, [startups, selectedDomain]);

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="flex">
        <FilterSidebar 
          selectedDomain={selectedDomain} 
          onDomainSelect={setSelectedDomain} 
        />
        
        <main className="flex-1 p-6 custom-scrollbar overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    Investment Opportunities
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Discover and invest in promising startups across various industries
                  </p>
                </div>
                
                {/* Refresh button */}
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  title="Refresh startup data"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              <div className="mt-4 text-sm text-muted-foreground">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading startups...
                  </div>
                ) : error ? (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    Error loading data
                  </div>
                ) : (
                  selectedDomain === 'All' 
                    ? `Showing all ${filteredStartups.length} startups`
                    : `Showing ${filteredStartups.length} startups in ${selectedDomain}`
                )}
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Error Loading Startups</h3>
                    <p className="text-red-700">{error}</p>
                    <button
                      onClick={handleRefresh}
                      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && !error && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Loading Investment Opportunities</h3>
                  <p className="text-muted-foreground">Fetching the latest startup data...</p>
                </div>
              </div>
            )}

            {/* Startups Grid */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStartups.map((startup, index) => (
                  <div
                    key={startup.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <StartupCard startup={startup} />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredStartups.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {selectedDomain === 'All' 
                      ? 'No startups available' 
                      : `No startups found in ${selectedDomain}`
                    }
                  </h3>
                  <p className="text-muted-foreground text-lg mb-6">
                    {selectedDomain === 'All'
                      ? 'There are currently no startups in the database.'
                      : 'Try selecting a different category or check back later.'
                    }
                  </p>
                  {selectedDomain !== 'All' && (
                    <button
                      onClick={() => setSelectedDomain('All')}
                      className="btn-invest"
                    >
                      View All Startups
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
