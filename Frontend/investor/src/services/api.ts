const API_BASE_URL = 'http://localhost:8000';

export interface Startup {
  id: string;
  name: string;
  founderName: string;
  revenueRaised: string;
  registrationDate: string;
  domain: string;
  description: string;
  shortDescription: string;
  stage: string;
  location: string;
  employees: string;
  website?: string;
}

// This should match your database schema
export interface ApiStartup {
  id: string;
  company_name: string;
  brand_name?: string;
  registration_status?: string;
  industry_sector?: string;
  stage?: string;
  location_city?: string;
  location_state?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  problem_statement?: string;
  solution_description?: string;
  target_market?: string;
  revenue_model?: string;
  pricing_strategy?: string;
  competitive_advantage?: string;
  monthly_revenue?: number;
  monthly_burn_rate?: number;
  current_cash_position?: number;
  break_even_timeline?: string;
  team_size?: number;
  technology_stack?: string[];
  operational_metrics?: Record<string, any>;
  revenue_projections?: Record<string, any>;
  funding_amount_required?: number;
  funding_stage?: string;
  previous_funding?: number;
  current_customers?: number;
  key_achievements?: string[];
  use_of_funds?: Record<string, any>;
}

export interface StartupInsight {
  [key: string]: any; // Adjust based on your actual insights structure
}

// Fixed: Match the actual backend response structure
export interface StartupDetailResponse {
  Startup: ApiStartup;  // Capital 'S' to match backend
  Insights: StartupInsight; // Capital 'I' to match backend
}

// Convert API response to frontend Startup interface
export const mapApiStartupToStartup = (apiStartup: ApiStartup): Startup => {
  return {
    id: apiStartup.id,
    name: apiStartup.company_name,
    founderName: 'N/A', // You might need to get this from founders table
    revenueRaised: apiStartup.previous_funding?.toString() || '$0',
    registrationDate: new Date().toISOString().split('T')[0], // You might need to add this field
    domain: apiStartup.industry_sector || 'Technology',
    description: apiStartup.solution_description || 'No description available',
    shortDescription: apiStartup.problem_statement || 'Startup company',
    stage: apiStartup.stage || apiStartup.funding_stage || 'Early Stage',
    location: `${apiStartup.location_city || ''}, ${apiStartup.location_state || ''}`.trim().replace(/^,|,$/, '') || 'Location not specified',
    employees: apiStartup.team_size?.toString() || '1-10',
    website: apiStartup.website
  };
};

export const apiService = {
  // Get all startups with optional filters
  async getStartups(filters?: {
    limit?: number;
    industry_sector?: string;
    stage?: string;
    funding_stage?: string;
  }): Promise<ApiStartup[]> {
    try {
      const queryParams = new URLSearchParams();
      
      // Only add parameters if they have values
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.industry_sector) queryParams.append('industry_sector', filters.industry_sector);
      if (filters?.stage) queryParams.append('stage', filters.stage);
      if (filters?.funding_stage) queryParams.append('funding_stage', filters.funding_stage);
      
      const url = `${API_BASE_URL}/api/startups${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      console.log('Fetching from URL:', url); // Debug log
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching startups:', error);
      throw error;
    }
  },

  // Get specific startup by ID
  async getStartupById(startupId: string): Promise<StartupDetailResponse> {
    try {
      const url = `${API_BASE_URL}/api/startups/${startupId}`;
      console.log('Fetching startup details from:', url); // Debug log
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Startup not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Received data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching startup details:', error);
      throw error;
    }
  },

  // Search startups
  async searchStartups(query: string, limit: number = 20): Promise<ApiStartup[]> {
    try {
      const queryParams = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });
      
      const url = `${API_BASE_URL}/api/startups/search?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching startups:', error);
      throw error;
    }
  }
};