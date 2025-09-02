import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, Users, Star } from 'lucide-react';

export interface Investor {
  id: string;
  name: string;
  firm: string;
  avatar: string;
  location: string;
  investmentRange: {
    min: number;
    max: number;
  };
  industries: string[];
  stage: string[];
  rating: number;
  totalInvestments: number;
  description: string;
  notable_investments: string[];
}

interface InvestorCardProps {
  investor: Investor;
}

export function InvestorCard({ investor }: InvestorCardProps) {
  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <Card className="h-full bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-12 w-12 ring-2 ring-primary/10">
            <AvatarImage src={investor.avatar} alt={investor.name} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground">
              {investor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {investor.name}
            </h3>
            <p className="text-muted-foreground font-medium">{investor.firm}</p>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{investor.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{investor.rating}</span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {formatAmount(investor.investmentRange.min)} - {formatAmount(investor.investmentRange.max)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{investor.totalInvestments} investments</span>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {investor.description}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">INDUSTRIES</p>
            <div className="flex flex-wrap gap-1">
              {investor.industries.slice(0, 3).map((industry) => (
                <Badge key={industry} variant="secondary" className="text-xs">
                  {industry}
                </Badge>
              ))}
              {investor.industries.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{investor.industries.length - 3}
                </Badge>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">STAGE</p>
            <div className="flex flex-wrap gap-1">
              {investor.stage.map((stage) => (
                <Badge key={stage} variant="outline" className="text-xs">
                  {stage}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border/50">
          <Button className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow">
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}