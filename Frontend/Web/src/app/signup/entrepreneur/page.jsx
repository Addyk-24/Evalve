import { useState } from 'react';
import { ArrowRight, ArrowLeft, Building, User, TrendingUp, Users, DollarSign, Target } from 'lucide-react';

export default function EntrepreneurSignup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Company Information
    companyLegalName: '',
    companyBrandName: '',
    registrationStatus: '',
    industry: '',
    stage: '',
    city: '',
    state: '',
    website: '',
    email: '',
    phone: '',

    // Founder Information
    founders: [{ name: '', role: '', education: '', institution: '', experience: '', equityShare: '', linkedIn: '' }],

    // Business Model & Product
    problemStatement: '',
    solutionDescription: '',
    targetMarket: '',
    revenueModel: '',
    pricingStrategy: '',
    competitiveAdvantage: '',

    // Team & Operations
    teamSize: '',
    keyMembers: '',
    techStack: '',
    operationalMetrics: '',

    // Financial Information
    monthlyRevenue: '',
    burnRate: '',
    cashPosition: '',
    revenueProjections: '',
    breakEvenTimeline: ''
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateFounder = (index, field, value) => {
    const updatedFounders = [...formData.founders];
    updatedFounders[index][field] = value;
    setFormData(prev => ({ ...prev, founders: updatedFounders }));
  };

  const addFounder = () => {
    setFormData(prev => ({
      ...prev,
      founders: [...prev.founders, { name: '', role: '', education: '', institution: '', experience: '', equityShare: '', linkedIn: '' }]
    }));
  };

  const removeFounder = (index) => {
    if (formData.founders.length > 1) {
      const updatedFounders = formData.founders.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, founders: updatedFounders }));
    }
  };

  const handleSubmit = async () => {
    try {
    // Basic client-side validation (keep your existing validation)
    const requiredFields = {
      companyLegalName: 'Company Legal Name',
      registrationStatus: 'Registration Status',
      industry: 'Industry',
      stage: 'Current Stage',
      city: 'City',
      state: 'State',
      email: 'Email',
      phone: 'Phone',
      problemStatement: 'Problem Statement',
      solutionDescription: 'Solution Description',
      targetMarket: 'Target Market',
      revenueModel: 'Revenue Model',
      competitiveAdvantage: 'Competitive Advantage'
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field].trim() === '') {
        missingFields.push(label);
      }
    }

    // Check founders
    if (!formData.founders || formData.founders.length === 0) {
      missingFields.push('At least one founder');
    } else {
      formData.founders.forEach((founder, index) => {
        if (!founder.name || founder.name.trim() === '') {
          missingFields.push(`Founder ${index + 1} name`);
        }
        if (!founder.role || founder.role.trim() === '') {
          missingFields.push(`Founder ${index + 1} role`);
        }
      });
    }

    if (missingFields.length > 0) {
      alert('Please fill in the following required fields:\n\n' + missingFields.join('\n'));
      return;
    }

    // Transform data to match backend model
    const transformedData = {
      // Company Information
      companyLegalName: formData.companyLegalName,
      companyBrandName: formData.companyBrandName || null,
      industry: formData.industry,  // Map to correct field name
      stage: formData.stage,
      city: formData.city,
      state: formData.state,
      website: formData.website || null,
      email: formData.email,
      phone: formData.phone,
      
      // Business Model & Product
      problemStatement: formData.problemStatement,
      solutionDescription: formData.solutionDescription,
      targetMarket: formData.targetMarket,
      revenueModel: formData.revenueModel,
      pricingStrategy: formData.pricingStrategy || null,
      competitiveAdvantage: formData.competitiveAdvantage,
      
      // Team & Operations
      teamSize: formData.teamSize ? parseInt(formData.teamSize) : null,
      techStack: formData.techStack || null,
      operationalMetrics: formData.operationalMetrics || null,
      
      // Financial Information
      monthlyRevenue: formData.monthlyRevenue ? parseFloat(formData.monthlyRevenue) : null,
      burnRate: formData.burnRate ? parseFloat(formData.burnRate) : null,
      cashPosition: formData.cashPosition ? parseFloat(formData.cashPosition) : null,
      revenueProjections: formData.revenueProjections || null,
      breakEvenTimeline: formData.breakEvenTimeline || null,
      
      // Add required fields with default values
      funding_stage: null,
      funding_amount_required: null,
      
      // Transform founders data
      founders: formData.founders.map(founder => ({
        name: founder.name,
        role: founder.role,
        education: founder.education || null,
        institution: founder.institution || null,
        experience: founder.experience || null,
        equityShare: founder.equityShare ? parseFloat(founder.equityShare) : null,
        linkedin_profile: founder.linkedIn || null  // Map to correct field name
      }))
    };

    console.log('Submitting transformed data:', transformedData);
    const apiUrl = 'http://localhost:8000'
    const response = await fetch(`${apiUrl}/api/signup/entrepreneur`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(transformedData)
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response error:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.detail && Array.isArray(errorData.detail)) {
          // Handle Pydantic validation errors
          const errorMessages = errorData.detail.map(err => `${err.loc.join('.')}: ${err.msg}`);
          alert('Please fix the following errors:\n\n' + errorMessages.join('\n'));
        } else {
          alert(errorData.detail || errorData.error || 'Server error occurred. Please try again.');
        }
      } catch (parseError) {
        alert(`Server error (${response.status}): ${errorText}`);
      }
      return;
    }

    const result = await response.json();
    console.log('Success response:', result);

    if (result.status === 'success') {
      alert('Application submitted successfully!');
      // Redirect or handle success
      window.location.href = '/dashboard';
    } else {
      alert(result.error || 'Failed to submit application. Please try again.');
    }

  } catch (error) {
    console.error('Submission error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      alert('Network error: Please check your internet connection and try again.');
    } else {
      alert('An unexpected error occurred. Please try again.\n\nError: ' + error.message);
    }
  }

  };

  const totalSteps = 5;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen bg-white dark:bg-black" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-black dark:text-white">Join as Entrepreneur</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Tell us about your startup</p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep} of {totalSteps}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
              <div
                className="bg-black dark:bg-white h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Step 1: Company Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                  <Building size={20} className="text-white dark:text-black" />
                </div>
                <h2 className="text-xl font-semibold text-black dark:text-white">Company Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Legal Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyLegalName}
                    onChange={(e) => updateFormData('companyLegalName', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="Enter legal company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyBrandName}
                    onChange={(e) => updateFormData('companyBrandName', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="Brand/trading name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Registration Status *
                  </label>
                  <select
                    value={formData.registrationStatus}
                    onChange={(e) => updateFormData('registrationStatus', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="">Select registration status</option>
                    <option value="Pvt Ltd">Private Limited</option>
                    <option value="LLP">Limited Liability Partnership</option>
                    <option value="Partnership">Partnership</option>
                    <option value="Proprietorship">Proprietorship</option>
                    <option value="Unregistered">Unregistered</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Industry/Sector *
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => updateFormData('industry', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="">Select industry</option>
                    <option value="Fintech">Fintech</option>
                    <option value="Edtech">Edtech</option>
                    <option value="SaaS">SaaS</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Current Stage *
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) => updateFormData('stage', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="">Select current stage</option>
                    <option value="Idea">Idea Stage</option>
                    <option value="MVP">MVP</option>
                    <option value="Beta">Beta</option>
                    <option value="Market Ready">Market Ready</option>
                    <option value="Scaling">Scaling</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Website/App
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateFormData('website', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="contact@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Founder Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                  <User size={20} className="text-white dark:text-black" />
                </div>
                <h2 className="text-xl font-semibold text-black dark:text-white">Founder Information</h2>
              </div>

              {formData.founders.map((founder, index) => (
                <div key={index} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-black dark:text-white">
                      Founder {index + 1}
                    </h3>
                    {formData.founders.length > 1 && (
                      <button
                        onClick={() => removeFounder(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={founder.name}
                        onChange={(e) => updateFounder(index, 'name', e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Role *
                      </label>
                      <input
                        type="text"
                        value={founder.role}
                        onChange={(e) => updateFounder(index, 'role', e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        placeholder="CEO, CTO, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Education
                      </label>
                      <input
                        type="text"
                        value={founder.education}
                        onChange={(e) => updateFounder(index, 'education', e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        placeholder="B.Tech, MBA, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={founder.institution}
                        onChange={(e) => updateFounder(index, 'institution', e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        placeholder="University/College name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Experience (Years)
                      </label>
                      <input
                        type="text"
                        value={founder.experience}
                        onChange={(e) => updateFounder(index, 'experience', e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        placeholder="Previous companies, years"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        Equity Share (%)
                      </label>
                      <input
                        type="number"
                        value={founder.equityShare}
                        onChange={(e) => updateFounder(index, 'equityShare', e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        placeholder="25"
                        min="0"
                        max="100"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        value={founder.linkedIn}
                        onChange={(e) => updateFounder(index, 'linkedIn', e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addFounder}
                className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors duration-200"
              >
                + Add Another Founder
              </button>
            </div>
          )}

          {/* Step 3: Business Model & Product */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                  <TrendingUp size={20} className="text-white dark:text-black" />
                </div>
                <h2 className="text-xl font-semibold text-black dark:text-white">Business Model & Product</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Problem Statement *
                  </label>
                  <textarea
                    value={formData.problemStatement}
                    onChange={(e) => updateFormData('problemStatement', e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="What problem are you solving? Describe the pain point your target customers face."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Solution Description * (200-300 words)
                  </label>
                  <textarea
                    value={formData.solutionDescription}
                    onChange={(e) => updateFormData('solutionDescription', e.target.value)}
                    rows={6}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="Describe your product/service in detail. How does it solve the problem? What makes it unique?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Target Market *
                  </label>
                  <textarea
                    value={formData.targetMarket}
                    onChange={(e) => updateFormData('targetMarket', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="Who are your customers? Demographics, market size, customer segments."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Revenue Model *
                    </label>
                    <textarea
                      value={formData.revenueModel}
                      onChange={(e) => updateFormData('revenueModel', e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      placeholder="How do you make money? Subscription, transaction fees, ads, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Pricing Strategy
                    </label>
                    <textarea
                      value={formData.pricingStrategy}
                      onChange={(e) => updateFormData('pricingStrategy', e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      placeholder="Your pricing model and strategy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Competitive Advantage *
                  </label>
                  <textarea
                    value={formData.competitiveAdvantage}
                    onChange={(e) => updateFormData('competitiveAdvantage', e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="What makes you unique? Technology, team, market position, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Team & Operations */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                  <Users size={20} className="text-white dark:text-black" />
                </div>
                <h2 className="text-xl font-semibold text-black dark:text-white">Team & Operations</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Current Team Size *
                  </label>
                  <input
                    type="number"
                    value={formData.teamSize}
                    onChange={(e) => updateFormData('teamSize', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="5"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Technology Stack
                  </label>
                  <input
                    type="text"
                    value={formData.techStack}
                    onChange={(e) => updateFormData('techStack', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="React, Node.js, AWS, etc."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Key Team Members
                  </label>
                  <textarea
                    value={formData.keyMembers}
                    onChange={(e) => updateFormData('keyMembers', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="List key team members and their roles (CTO, CMO, Head of Sales, etc.)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Operational Metrics
                  </label>
                  <textarea
                    value={formData.operationalMetrics}
                    onChange={(e) => updateFormData('operationalMetrics', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="Key performance indicators you track (MAU, conversion rate, retention, etc.)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Financial Information */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                  <DollarSign size={20} className="text-white dark:text-black" />
                </div>
                <h2 className="text-xl font-semibold text-black dark:text-white">Financial Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Current Monthly Revenue ($)
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyRevenue}
                    onChange={(e) => updateFormData('monthlyRevenue', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="10000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Monthly Burn Rate ($)
                  </label>
                  <input
                    type="number"
                    value={formData.burnRate}
                    onChange={(e) => updateFormData('burnRate', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="5000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Current Cash Position ($)
                  </label>
                  <input
                    type="number"
                    value={formData.cashPosition}
                    onChange={(e) => updateFormData('cashPosition', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="50000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Break-even Timeline
                  </label>
                  <input
                    type="text"
                    value={formData.breakEvenTimeline}
                    onChange={(e) => updateFormData('breakEvenTimeline', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="12 months"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Revenue Projections (Next 12-24 months)
                  </label>
                  <textarea
                    value={formData.revenueProjections}
                    onChange={(e) => updateFormData('revenueProjections', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="Describe your revenue projections and growth plans"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={20} />
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200"
              >
                Next
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200"
              >
                Submit Application
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}