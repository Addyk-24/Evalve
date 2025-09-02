import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Building,
  MapPin,
  Globe,
  Phone,
  Mail,
  Users,
  DollarSign,
  TrendingUp,
  Target,
  Calendar,
  Award,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  // Mock startup data
  const startupData = {
    companyName: 'TechFlow Solutions',
    legalName: 'TechFlow Solutions Pvt Ltd',
    registrationStatus: 'Pvt Ltd',
    industry: 'FinTech',
    stage: 'MVP',
    location: 'Bangalore, Karnataka',
    website: 'https://techflowsolutions.com',
    email: 'founder@techflowsolutions.com',
    phone: '+91 98765 43210',
    
    founders: [
      {
        name: 'John Smith',
        role: 'CEO & Co-Founder',
        education: 'MBA - IIM Bangalore, B.Tech - IIT Delhi',
        experience: '8 years in FinTech and Banking',
        equity: '40%',
        linkedin: 'linkedin.com/in/johnsmith'
      },
      {
        name: 'Sarah Johnson',
        role: 'CTO & Co-Founder',
        education: 'M.Tech - IIT Bombay, B.Tech - BITS Pilani',
        experience: '6 years in Software Development',
        equity: '35%',
        linkedin: 'linkedin.com/in/sarahjohnson'
      }
    ],
    
    business: {
      problemStatement: 'Small businesses struggle with complex financial management and lack access to affordable digital banking solutions.',
      solution: 'TechFlow provides an all-in-one financial management platform specifically designed for SMEs, offering automated bookkeeping, expense tracking, invoice management, and integrated payment solutions.',
      targetMarket: 'Small and Medium Enterprises (SMEs) with 10-500 employees',
      revenueModel: 'SaaS subscription model with tiered pricing',
      pricing: '₹2,999/month for basic, ₹7,999/month for premium',
      competitiveAdvantage: 'AI-powered financial insights and seamless integration with Indian banking systems'
    },
    
    market: {
      marketSize: '₹15,000 Cr TAM, ₹3,000 Cr SAM',
      currentCustomers: 450,
      monthlyRevenue: '₹12,50,000',
      growthRate: '25% MoM',
      achievements: ['Winner - TechCrunch Disrupt Bangalore 2024', 'Selected for Y Combinator India', '50+ Enterprise clients']
    },
    
    financial: {
      currentRevenue: '₹12,50,000',
      burnRate: '₹8,00,000',
      cashPosition: '₹45,00,000',
      projectedRevenue: '₹2.5 Cr (12 months), ₹8 Cr (24 months)',
      breakEvenTimeline: '18 months'
    },
    
    funding: {
      requiredAmount: '₹3.5 Cr',
      currentStage: 'Seed',
      previousFunding: '₹75 lakhs (Pre-seed)',
      useOfFunds: {
        'Product Development': '35%',
        'Marketing & Sales': '30%',
        'Team Expansion': '25%',
        'Operations': '10%'
      },
      equityDilution: '20%',
      valuation: '₹17.5 Cr'
    },
    
    team: {
      currentSize: 12,
      keyMembers: [
        'Rajesh Kumar - Head of Engineering',
        'Priya Sharma - Head of Marketing',
        'Amit Patel - Head of Sales'
      ],
      techStack: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker']
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
            Startup Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Company Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg">
                    TF
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{startupData.companyName}</h3>
                  <p className="text-muted-foreground">{startupData.legalName}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">{startupData.registrationStatus}</Badge>
                    <Badge variant="outline">{startupData.industry}</Badge>
                    <Badge variant="outline">{startupData.stage}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{startupData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{startupData.website}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{startupData.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Founders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Founders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {startupData.founders.map((founder, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{founder.name}</h4>
                      <p className="text-sm text-primary">{founder.role}</p>
                    </div>
                    <Badge variant="outline">{founder.equity} equity</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Education:</strong> {founder.education}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Experience:</strong> {founder.experience}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Business Model */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Business Model
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Problem Statement</h4>
                <p className="text-sm text-muted-foreground">{startupData.business.problemStatement}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Solution</h4>
                <p className="text-sm text-muted-foreground">{startupData.business.solution}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Target Market</h4>
                  <p className="text-sm text-muted-foreground">{startupData.business.targetMarket}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Revenue Model</h4>
                  <p className="text-sm text-muted-foreground">{startupData.business.revenueModel}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market & Traction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Market & Traction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">{startupData.market.currentCustomers}</div>
                  <div className="text-xs text-muted-foreground">Customers</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">{startupData.market.monthlyRevenue}</div>
                  <div className="text-xs text-muted-foreground">Monthly Revenue</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">{startupData.market.growthRate}</div>
                  <div className="text-xs text-muted-foreground">Growth Rate</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold text-primary">{startupData.team.currentSize}</div>
                  <div className="text-xs text-muted-foreground">Team Size</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Key Achievements
                </h4>
                <div className="space-y-2">
                  {startupData.market.achievements.map((achievement, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Funding Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Funding Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-gradient-primary/10">
                  <div className="text-xl font-bold text-primary">{startupData.funding.requiredAmount}</div>
                  <div className="text-sm text-muted-foreground">Funding Required</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-primary/10">
                  <div className="text-xl font-bold text-primary">{startupData.funding.equityDilution}</div>
                  <div className="text-sm text-muted-foreground">Equity Dilution</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gradient-primary/10">
                  <div className="text-xl font-bold text-primary">{startupData.funding.valuation}</div>
                  <div className="text-sm text-muted-foreground">Valuation</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Use of Funds</h4>
                <div className="space-y-2">
                  {Object.entries(startupData.funding.useOfFunds).map(([category, percentage]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm">{category}</span>
                      <Badge variant="outline">{percentage}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}