import React from 'react';
import { Startup } from '@/services/api';
import { Calendar, MapPin, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StartupCardProps {
  startup: Startup;
}

const StartupCard: React.FC<StartupCardProps> = ({ startup }) => {
  const navigate = useNavigate();

  const handleInvestClick = () => {
    navigate(`/startup/${startup.id}`);
    

  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Date not available';
    }
  };

  return (
    <div className="investment-card animate-fade-in group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
            {startup.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3">
            {startup.shortDescription}
          </p>
        </div>
        <div className="bg-accent px-3 py-1 rounded-full">
          <span className="text-xs font-medium text-accent-foreground">
            {startup.domain}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium text-foreground">Revenue Raised:</span>
          <span className="font-bold text-primary">{startup.revenueRaised}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>Founder:</span>
          <span className="text-foreground font-medium">{startup.founderName}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Registered:</span>
          <span className="text-foreground">{formatDate(startup.registrationDate)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{startup.location}</span>
          <span>•</span>
          <span>{startup.stage}</span>
        </div>
      </div>

      <button
        onClick={handleInvestClick}
        className="btn-invest w-full"
      >
        Invest Now
      </button>
    </div>
  );
};

export default StartupCard;