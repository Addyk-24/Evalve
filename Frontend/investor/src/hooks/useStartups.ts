import { useState, useEffect } from 'react';
import { Startup } from '@/data/startups';
import { apiService, mapApiStartupToStartup } from '@/services/api';

interface UseStartupsResult {
  startups: Startup[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseStartupsFilters {
  limit?: number;
  industry_sector?: string;
  stage?: string;
  funding_stage?: string;
}

export const useStartups = (filters?: UseStartupsFilters): UseStartupsResult => {
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiStartups = await apiService.getStartups(filters);
      const mappedStartups = apiStartups.map(mapApiStartupToStartup);
      
      setStartups(mappedStartups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching startups');
      console.error('Error fetching startups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartups();
  }, [filters?.limit, filters?.industry_sector, filters?.stage, filters?.funding_stage]);

  return {
    startups,
    loading,
    error,
    refetch: fetchStartups
  };
};

// Hook for single startup
interface UseStartupResult {
  startup: Startup | null;
  insights: any | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStartup = (startupId: string | undefined): UseStartupResult => {
  const [startup, setStartup] = useState<Startup | null>(null);
  const [insights, setInsights] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStartup = async () => {
    if (!startupId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getStartupById(startupId);
      
      // Extract startup data from the response
      const companyName = Object.keys(response).find(key => key !== 'Insights');
      if (companyName && response[companyName]) {
        const apiStartup = response[companyName];
        const mappedStartup = mapApiStartupToStartup(apiStartup);
        setStartup(mappedStartup);
        setInsights(response.Insights);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching startup details');
      console.error('Error fetching startup:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStartup();
  }, [startupId]);

  return {
    startup,
    insights,
    loading,
    error,
    refetch: fetchStartup
  };
};