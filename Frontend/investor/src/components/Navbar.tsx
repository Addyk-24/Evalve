import React, { useState } from 'react';
import { User, ChevronDown, Building, DollarSign, MapPin, Phone, Mail, Target } from 'lucide-react';

const Navbar = () => {
  const [showProfile, setShowProfile] = useState(false);
  
  // Mock profile data based on the form structure provided
  const profileData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 555-123-4567',
    location: 'San Francisco, CA',
    investorType: 'Angel Investor',
    organization: 'Individual',
    title: 'Senior Investor',
    experience: '6-10 years',
    investmentStage: ['Seed', 'Series A'],
    industryFocus: ['Fintech', 'AI/ML', 'SaaS'],
    investmentRange: '$100K - $500K'
  };

  return (
    <nav className="bg-background border-b border-border px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">I</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            INDEV.AI
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <span className="text-muted-foreground text-sm">
            Investment Platform
          </span>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <ChevronDown className="w-4 h-4 text-foreground" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground mb-1">
                    {profileData.firstName} {profileData.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">{profileData.investorType}</p>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{profileData.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{profileData.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{profileData.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building className="w-4 h-4 text-primary" />
                      <span className="text-sm text-foreground">{profileData.organization} - {profileData.title}</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">Investment Focus</span>
                    </div>
                    <div className="ml-7 space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Stages: {profileData.investmentStage.join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Industries: {profileData.industryFocus.join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Range: {profileData.investmentRange}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">Experience: {profileData.experience}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;