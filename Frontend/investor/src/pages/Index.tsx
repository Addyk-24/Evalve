import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/FilterSidebar';
import StartupCard from '@/components/StartupCard';
import { mockStartups } from '@/data/startups';

const Index = () => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');

  const filteredStartups = useMemo(() => {
    if (selectedDomain === 'All') {
      return mockStartups;
    }
    if (selectedDomain === 'Recent Registered') {
      // Sort by registration date and return the most recent ones
      return [...mockStartups]
        .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
        .slice(0, 6);
    }
    return mockStartups.filter(startup => startup.domain === selectedDomain);
  }, [selectedDomain]);

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
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Investment Opportunities
              </h1>
              <p className="text-muted-foreground text-lg">
                Discover and invest in promising startups across various industries
              </p>
              <div className="mt-4 text-sm text-muted-foreground">
                {selectedDomain === 'All' 
                  ? `Showing all ${filteredStartups.length} startups`
                  : `Showing ${filteredStartups.length} startups in ${selectedDomain}`
                }
              </div>
            </div>

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

            {filteredStartups.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg mb-4">
                  No startups found in this category
                </p>
                <button
                  onClick={() => setSelectedDomain('All')}
                  className="btn-invest"
                >
                  View All Startups
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;