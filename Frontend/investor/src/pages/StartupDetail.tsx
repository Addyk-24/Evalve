import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStartup } from '@/hooks/useStartups';
import { ArrowLeft, TrendingUp, Users, Calendar, MapPin, Globe, Building, Loader2, AlertCircle, Shield, AlertTriangle, Target, DollarSign, Star, CheckCircle, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StartupChatbot from '@/components/StartupChatbot';

// AI Insights Component
interface InsightData {
  executive_summary?: string;
  key_strengths?: string[] | string;
  major_risks?: string[] | string;
  market_analysis?: string;
  financial_outlook?: string;
  investment_recommendation?: {
    score?: number;
    stage?: string;
    terms?: string;
    milestones?: string[] | string;
  };
  assumptions?: string[] | string;
  [key: string]: any;
}

interface AIInsightsProps {
  insights: InsightData | string;
  companyName: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ insights, companyName }) => {
  // Handle string insights (fallback)
  if (typeof insights === 'string') {
    return (
      <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
          AI Investment Analysis
        </h2>
        <div className="text-gray-700 leading-relaxed">
          <p>{insights}</p>
        </div>
      </div>
    );
  }

  // Handle object insights
  const data = insights as InsightData;
  const investmentScore = data.investment_recommendation?.score || 0;
  
  // Helper function to render arrays or strings
  const renderListItems = (items: string[] | string | undefined) => {
    if (!items) return null;
    if (typeof items === 'string') {
      return <li className="mb-2 text-sm leading-relaxed">{items}</li>;
    }
    return items.map((item, index) => (
      <li key={index} className="mb-2 text-sm leading-relaxed">{item}</li>
    ));
  };

  // Score color logic
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-700 bg-green-100 border-green-200';
    if (score >= 6) return 'text-yellow-700 bg-yellow-100 border-yellow-200';
    return 'text-red-700 bg-red-100 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Strong Buy';
    if (score >= 6) return 'Moderate Buy';
    if (score >= 4) return 'Hold';
    return 'High Risk';
  };

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
          AI Investment Analysis
        </h2>

        <div className="space-y-4">
          {/* Investment Recommendation Score */}
          {investmentScore > 0 && (
            <div className="p-4 bg-white rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Investment Score
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getScoreColor(investmentScore)}`}>
                  {investmentScore}/10 - {getScoreLabel(investmentScore)}
                </div>
              </div>
              {data.investment_recommendation?.terms && (
                <p className="text-xs text-gray-600 mt-2">
                  <strong>Terms:</strong> {data.investment_recommendation.terms}
                </p>
              )}
            </div>
          )}

          {/* Executive Summary */}
          {data.executive_summary && (
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-blue-600" />
                Executive Summary
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm">{data.executive_summary}</p>
            </div>
          )}

          {/* Two column layout for strengths and risks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Key Strengths */}
            {data.key_strengths && (
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Key Strengths
                </h3>
                <ul className="space-y-1 text-gray-700 list-disc list-inside">
                  {renderListItems(data.key_strengths)}
                </ul>
              </div>
            )}

            {/* Major Risks */}
            {data.major_risks && (
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Major Risks
                </h3>
                <ul className="space-y-1 text-gray-700 list-disc list-inside">
                  {renderListItems(data.major_risks)}
                </ul>
              </div>
            )}
          </div>

          {/* Market Analysis & Financial Outlook */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.market_analysis && (
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-purple-600" />
                  Market Analysis
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">{data.market_analysis}</p>
              </div>
            )}

            {data.financial_outlook && (
              <div className="p-4 bg-white rounded-lg border">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  Financial Outlook
                </h3>
                <p className="text-gray-700 leading-relaxed text-sm">{data.financial_outlook}</p>
              </div>
            )}
          </div>

          {/* Key Milestones */}
          {data.investment_recommendation?.milestones && (
            <div className="p-4 bg-white rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-blue-600" />
                Key Milestones
              </h3>
              <ul className="space-y-1 text-gray-700 list-disc list-inside">
                {renderListItems(data.investment_recommendation.milestones)}
              </ul>
            </div>
          )}

          {/* Assumptions */}
          {data.assumptions && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-yellow-600" />
                Key Assumptions
              </h3>
              <ul className="space-y-1 text-xs text-gray-600 list-disc list-inside">
                {renderListItems(data.assumptions)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main StartupDetail Component
const StartupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { startup, insights, loading, error, refetch } = useStartup(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <h1 className="text-xl font-semibold mb-2">Loading startup details...</h1>
            <p className="text-muted-foreground">Please wait while we fetch the information</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !startup) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Startups
          </button>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <h1 className="text-2xl font-bold mb-4 text-red-800">
                {error === 'Startup not found' ? 'Startup Not Found' : 'Error Loading Startup'}
              </h1>
              <p className="text-red-700 mb-6">
                {error || 'Something went wrong while loading the startup details'}
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="btn-invest"
                >
                  Back to Startups
                </button>
                <button
                  onClick={() => refetch()}
                  className="px-6 py-3 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Date not available';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Startups
        </button>

        <div className="bg-card border border-card-border rounded-xl p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-card-foreground mb-2">
                {startup.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {startup.shortDescription}
              </p>
            </div>
            <div className="bg-accent px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-accent-foreground">
                {startup.domain}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue Raised</p>
                  <p className="text-xl font-bold text-primary">{startup.revenueRaised}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Founder</p>
                  <p className="text-lg font-semibold text-foreground">{startup.founderName}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stage</p>
                  <p className="text-lg font-semibold text-foreground">{startup.stage}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration Date</p>
                  <p className="text-lg font-semibold text-foreground">{formatDate(startup.registrationDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-lg font-semibold text-foreground">{startup.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Team Size</p>
                  <p className="text-lg font-semibold text-foreground">{startup.employees} employees</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-card-foreground mb-4">About {startup.name}</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {startup.description}
            </p>
          </div>

          {startup.website && (
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a 
                    href={startup.website.startsWith('http') ? startup.website : `https://${startup.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg font-semibold text-primary hover:underline"
                  >
                    {startup.website}
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button className="btn-invest flex-1 text-lg">
              Invest in {startup.name}
            </button>
            <button className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors">
              Contact Founder
            </button>
          </div>
        </div>

        {/* AI Insights Section - Updated */}
        {insights && !insights.error && (
          <AIInsights insights={insights.response || insights} companyName={startup.name} />
        )}
      </div>
      
      {/* Chatbot - Only show if startup data is available */}
      <StartupChatbot startup={startup} />
    </div>
  );
};

export default StartupDetail;