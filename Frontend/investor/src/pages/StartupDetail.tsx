import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStartup } from '@/hooks/useStartups';
import { ArrowLeft, TrendingUp, Users, Calendar, MapPin, Globe, Building, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StartupChatbot from '@/components/StartupChatbot';

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
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Startups
        </button>

        <div className="bg-card border border-card-border rounded-xl p-8">
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

          {/* AI Insights Section */}
          {insights && !insights.error && (
            <div className="mb-8 p-4 bg-accent/50 rounded-lg border">
              <h2 className="text-xl font-bold text-card-foreground mb-4">
                <span className="inline-flex items-center gap-2">
                  🤖 AI Insights
                </span>
              </h2>
              <div className="text-muted-foreground">
                {typeof insights === 'string' ? (
                  <p className="leading-relaxed">{insights}</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(insights).map(([key, value]) => (
                      <div key={key} className="border-l-2 border-primary pl-3">
                        <p className="font-medium text-foreground capitalize">{key.replace(/_/g, ' ')}:</p>
                        <p className="text-sm">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

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
      </div>
      
      {/* Chatbot - Only show if startup data is available */}
      <StartupChatbot startup={startup} />
    </div>
  );
};

export default StartupDetail;