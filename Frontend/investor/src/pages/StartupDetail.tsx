import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockStartups } from '@/data/startups';
import { ArrowLeft, TrendingUp, Users, Calendar, MapPin, Globe, Building } from 'lucide-react';
import Navbar from '@/components/Navbar';
import StartupChatbot from '@/components/StartupChatbot';

const StartupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const startup = mockStartups.find(s => s.id === id);

  if (!startup) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Startup Not Found</h1>
            <button
              onClick={() => navigate('/')}
              className="btn-invest"
            >
              Back to Startups
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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

          {startup.website && (
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a 
                    href={`https://${startup.website}`} 
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
      
      {/* Chatbot */}
      <StartupChatbot startup={startup} />
    </div>
  );
};

export default StartupDetail;