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

export const domains = [
  'Finance',
  'Logistics',
  'Automotive',
  'Fashion',
  'Healthcare',
  'Technology',
  'Food & Beverage',
  'Real Estate',
  'Education',
  'Entertainment',
  'E-commerce',
  'Green Energy',
  'Agriculture',
  'Recent Registered'
];

export const mockStartups: Startup[] = [
  {
    id: '1',
    name: 'FinanceFlow',
    founderName: 'Sarah Johnson',
    revenueRaised: '$2.5M',
    registrationDate: '2024-01-15',
    domain: 'Finance',
    description: 'Revolutionary fintech platform that simplifies investment management for retail investors through AI-powered portfolio optimization and risk assessment.',
    shortDescription: 'AI-powered investment management platform',
    stage: 'Series A',
    location: 'San Francisco, CA',
    employees: '15-25',
    website: 'financeflow.com'
  },
  {
    id: '2',
    name: 'LogiTech Solutions',
    founderName: 'Michael Chen',
    revenueRaised: '$1.8M',
    registrationDate: '2024-02-20',
    domain: 'Logistics',
    description: 'Smart logistics platform that optimizes supply chain operations using machine learning algorithms to reduce costs and improve delivery times.',
    shortDescription: 'Smart supply chain optimization platform',
    stage: 'Seed',
    location: 'Austin, TX',
    employees: '10-15',
    website: 'logitechsolutions.com'
  },
  {
    id: '3',
    name: 'AutoDrive Innovations',
    founderName: 'Emily Rodriguez',
    revenueRaised: '$5.2M',
    registrationDate: '2023-11-10',
    domain: 'Automotive',
    description: 'Developing next-generation autonomous vehicle software with advanced safety features and seamless integration with smart city infrastructure.',
    shortDescription: 'Autonomous vehicle software development',
    stage: 'Series A',
    location: 'Detroit, MI',
    employees: '25-50',
    website: 'autodriveinnovations.com'
  },
  {
    id: '4',
    name: 'StyleLink',
    founderName: 'Jessica Park',
    revenueRaised: '$950K',
    registrationDate: '2024-03-05',
    domain: 'Fashion',
    description: 'Social commerce platform connecting fashion enthusiasts with emerging designers through personalized styling recommendations and virtual try-on technology.',
    shortDescription: 'Social commerce for fashion enthusiasts',
    stage: 'Pre-seed',
    location: 'New York, NY',
    employees: '5-10',
    website: 'stylelink.fashion'
  },
  {
    id: '5',
    name: 'HealthTech Analytics',
    founderName: 'Dr. Robert Kim',
    revenueRaised: '$3.7M',
    registrationDate: '2023-12-18',
    domain: 'Healthcare',
    description: 'Advanced healthcare analytics platform that helps hospitals optimize patient care through predictive modeling and real-time data insights.',
    shortDescription: 'Healthcare analytics and predictive modeling',
    stage: 'Series A',
    location: 'Boston, MA',
    employees: '20-30',
    website: 'healthtechanalytics.com'
  },
  {
    id: '6',
    name: 'CodeCraft AI',
    founderName: 'Alex Thompson',
    revenueRaised: '$1.2M',
    registrationDate: '2024-01-30',
    domain: 'Technology',
    description: 'AI-powered code generation platform that helps developers build applications faster with intelligent code suggestions and automated testing.',
    shortDescription: 'AI-powered development tools',
    stage: 'Seed',
    location: 'Seattle, WA',
    employees: '8-12',
    website: 'codecraftai.dev'
  },
  {
    id: '7',
    name: 'FreshBite',
    founderName: 'Maria Gonzalez',
    revenueRaised: '$800K',
    registrationDate: '2024-02-14',
    domain: 'Food & Beverage',
    description: 'Farm-to-table delivery service leveraging blockchain technology to ensure food traceability and support local organic farmers.',
    shortDescription: 'Blockchain-powered farm-to-table delivery',
    stage: 'Pre-seed',
    location: 'Portland, OR',
    employees: '6-10',
    website: 'freshbite.farm'
  },
  {
    id: '8',
    name: 'PropTech Ventures',
    founderName: 'David Wilson',
    revenueRaised: '$4.1M',
    registrationDate: '2023-10-22',
    domain: 'Real Estate',
    description: 'Digital real estate platform that uses VR technology and AI to streamline property viewing, valuation, and transaction processes.',
    shortDescription: 'VR-powered real estate platform',
    stage: 'Series A',
    location: 'Miami, FL',
    employees: '18-25',
    website: 'proptechventures.com'
  },
  {
    id: '9',
    name: 'EduNext',
    founderName: 'Lisa Wang',
    revenueRaised: '$1.5M',
    registrationDate: '2024-01-08',
    domain: 'Education',
    description: 'Personalized learning platform that adapts to individual student needs using AI to improve educational outcomes and engagement.',
    shortDescription: 'AI-powered personalized learning',
    stage: 'Seed',
    location: 'Cambridge, MA',
    employees: '12-18',
    website: 'edunext.edu'
  },
  {
    id: '10',
    name: 'StreamVibe',
    founderName: 'Jordan Lee',
    revenueRaised: '$2.8M',
    registrationDate: '2023-09-15',
    domain: 'Entertainment',
    description: 'Interactive streaming platform that allows viewers to influence content in real-time through community voting and engagement features.',
    shortDescription: 'Interactive community-driven streaming',
    stage: 'Series A',
    location: 'Los Angeles, CA',
    employees: '22-30',
    website: 'streamvibe.tv'
  },
  {
    id: '11',
    name: 'ShopSmart AI',
    founderName: 'Rachel Brown',
    revenueRaised: '$1.9M',
    registrationDate: '2024-01-25',
    domain: 'E-commerce',
    description: 'E-commerce optimization platform that uses machine learning to personalize shopping experiences and increase conversion rates.',
    shortDescription: 'AI-powered e-commerce optimization',
    stage: 'Seed',
    location: 'Chicago, IL',
    employees: '14-20',
    website: 'shopsmartai.com'
  },
  {
    id: '12',
    name: 'GreenGrid Energy',
    founderName: 'Kevin Martinez',
    revenueRaised: '$6.3M',
    registrationDate: '2023-08-12',
    domain: 'Green Energy',
    description: 'Smart grid technology that optimizes renewable energy distribution and storage, reducing waste and improving efficiency for utility companies.',
    shortDescription: 'Smart renewable energy grid solutions',
    stage: 'Series A',
    location: 'San Diego, CA',
    employees: '30-40',
    website: 'greengridenergy.com'
  }
];