import React from 'react';
import { domains } from '@/data/startups';
import { 
  Building2, 
  Truck, 
  Car, 
  Shirt, 
  Heart, 
  Laptop, 
  UtensilsCrossed, 
  Home, 
  GraduationCap, 
  Play, 
  ShoppingCart, 
  Leaf, 
  Wheat,
  Clock 
} from 'lucide-react';

interface FilterSidebarProps {
  selectedDomain: string;
  onDomainSelect: (domain: string) => void;
}

const domainIcons: Record<string, React.ReactNode> = {
  'Finance': <Building2 className="w-5 h-5" />,
  'Logistics': <Truck className="w-5 h-5" />,
  'Automotive': <Car className="w-5 h-5" />,
  'Fashion': <Shirt className="w-5 h-5" />,
  'Healthcare': <Heart className="w-5 h-5" />,
  'Technology': <Laptop className="w-5 h-5" />,
  'Food & Beverage': <UtensilsCrossed className="w-5 h-5" />,
  'Real Estate': <Home className="w-5 h-5" />,
  'Education': <GraduationCap className="w-5 h-5" />,
  'Entertainment': <Play className="w-5 h-5" />,
  'E-commerce': <ShoppingCart className="w-5 h-5" />,
  'Green Energy': <Leaf className="w-5 h-5" />,
  'Agriculture': <Wheat className="w-5 h-5" />,
  'Recent Registered': <Clock className="w-5 h-5" />
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({ selectedDomain, onDomainSelect }) => {
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-[calc(100vh-73px)] sticky top-[73px] custom-scrollbar overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-sidebar-foreground mb-6">
          Filter Startups
        </h2>
        
        <div className="space-y-2">
          <div
            className={`filter-item ${selectedDomain === 'All' ? 'active' : ''}`}
            onClick={() => onDomainSelect('All')}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-sm font-medium">All Startups</span>
          </div>
          
          {domains.map((domain) => (
            <div
              key={domain}
              className={`filter-item ${selectedDomain === domain ? 'active' : ''}`}
              onClick={() => onDomainSelect(domain)}
            >
              {domainIcons[domain]}
              <span className="text-sm font-medium">{domain}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;