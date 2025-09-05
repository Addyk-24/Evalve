import { useState } from 'react';
import { ArrowRight, ArrowLeft, TrendingUp, User, Building, DollarSign, Target } from 'lucide-react';

export default function InvestorSignup() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedIn: '',
    location: '',

    // Investor Profile
    investorType: '',
    organization: '',
    title: '',
    experience: '',

    // Investment Focus
    investmentStage: [],
    industryFocus: [],
    geographyFocus: [],
    investmentRange: '',

    // Investment Experience
    previousInvestments: '',
    portfolioSize: '',
    notableInvestments: '',

    // Additional Information
    investmentCriteria: '',
    valueAdd: '',
    timeCommitment: '',
    additionalInfo: ''
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateArrayField = (field, value) => {
    setFormData(prev => {
      const currentArray = prev[field] || [];
      if (currentArray.includes(value)) {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...currentArray, value] };
      }
    });
  };

  const handleSubmit = async () => {
    // here we would have request

    function parseInvestmentRange(range) {
    // Example: "$1K - $25K" => { min: 1000, max: 25000 }
    if (!range) return { min: null, max: null };
    const match = range.match(/\$([\d,]+)[K,M]? - \$([\d,]+)[K,M]?/);
    if (match) {
      const min = parseInt(match[1].replace(/,/g, '')) * 1000;
      const max = parseInt(match[2].replace(/,/g, '')) * 1000;
      return { min, max };
    }
    if (range.includes('$10M+')) return { min: 10000000, max: null };
    return { min: null, max: null };
  }

  const { min, max } = parseInvestmentRange(formData.investmentRange);

  const preferredIndustriesObj = {};
  formData.industryFocus.forEach(ind => preferredIndustriesObj[ind] = true);

  const geographicFocusObj = {};
  formData.geographyFocus.forEach(geo => geographicFocusObj[geo] = true);

  const typeMap = {
    "Angel Investor": "Angel",
    "VC Partner": "VC",
    "Private Equity": "PE",
    "Strategic Investor": "Strategic",
    "Corporate Investor": "Corporate"
  };

  // Main Start
  try {
      // Check required fields before submission
      const requiredFields = {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone number',
        location: 'Location',
        investorType: 'Investor type',
      };
      
      const missingFields = [];
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field] || formData[field].trim() === '') {
          missingFields.push(label);
        }
      }
      
      if (missingFields.length > 0) {
        alert('Please fill in the following required fields:\n\n' + missingFields.join('\n'));
        return;
      }

      // Transform data to match backend model (simplified for your database schema)
      const transformedData = {
        name: formData.firstName.trim() + ' ' + formData.lastName.trim(), // Combine first and last name
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        type:typeMap[formData.investorType] || "Angel",
        min_investment: min,
        max_investment: max,
        preferred_industries: preferredIndustriesObj,
        geographic_focus: geographicFocusObj
      };

      console.log('Submitting transformed data:', transformedData);
      
      const apiUrl = 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/signup/investor`, {
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
          if (errorData.details && Array.isArray(errorData.details)) {
            alert('Please fix the following errors:\n\n' + errorData.details.join('\n'));
          } else {
            alert(errorData.error || 'Server error occurred. Please try again.');
          }
        } catch (parseError) {
          alert(`Server error (${response.status}): ${errorText}`);
        }
        return;
      }

      const result = await response.json();
      console.log('Success response:', result);

      if (result.status === 'success') {
        alert('Application submitted successfully! We will review your application and get back to you within 2-3 business days.');
        // Redirect or handle success
        window.location.href = '/dashboard';
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        }
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

  const totalSteps = 4;

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
                <h1 className="text-2xl font-bold text-black dark:text-white">Join as Investor</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Tell us about your investment interests</p>
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
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                  <User size={20} className="text-white dark:text-black" />
                </div>
                <h2 className="text-xl font-semibold text-black dark:text-white">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="Doe"
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
                    placeholder="john@example.com"
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
                    placeholder="+1 555-123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={formData.linkedIn}
                    onChange={(e) => updateFormData('linkedIn', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="City, State/Country"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Investor Profile */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                  <Building size={20} className="text-white dark:text-black" />
                </div>
                <h2 className="text-xl font-semibold text-black dark:text-white">Investor Profile</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Investor Type *
                  </label>
                  <select
                    value={formData.investorType}
                    onChange={(e) => updateFormData('investorType', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="">Select investor type</option>
                    <option value="Angel Investor">Angel Investor</option>
                    <option value="VC Partner">VC Partner</option>
                    <option value="VC Partner">Strategic Investor</option>
                    <option value="Corporate Investor">Corporate Investor</option>
                    <option value="Private Equity">Private Equity</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Organization/Fund
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => updateFormData('organization', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="Fund name or Individual"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Title/Position
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateFormData('title', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="Partner, Managing Director, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Years of Investment Experience *
                  </label>
                  <select
                    value={formData.experience}
                    onChange={(e) => updateFormData('experience', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="">Select experience</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="3-5 years">3-5 years</option>
                    <option value="6-10 years">6-10 years</option>
                    <option value="11-15 years">11-15 years</option>
                    <option value="15+ years">15+ years</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Investment Focus */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                  <Target size={20} className="text-white dark:text-black" />
                </div>
                <h2 className="text-xl font-semibold text-black dark:text-white">Investment Focus</h2>
              </div>

              <div className="space-y-8">
                {/* Investment Stage */}
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-4">
                    Investment Stage (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth', 'IPO'].map(stage => (
                      <label key={stage} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.investmentStage.includes(stage)}
                          onChange={() => updateArrayField('investmentStage', stage)}
                          className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                        />
                        <span className="text-sm text-black dark:text-white">{stage}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Industry Focus */}
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-4">
                    Industry Focus  (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Fintech', 'Healthcare', 'SaaS', 'E-commerce', 'AI/ML', 'Edtech', 'Climate Tech', 'Biotech', 'Consumer', 'B2B', 'Other'].map(industry => (
                      <label key={industry} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.industryFocus.includes(industry)}
                          onChange={() => updateArrayField('industryFocus', industry)}
                          className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                        />
                        <span className="text-sm text-black dark:text-white">{industry}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Geography Focus */}
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-4">
                    Geography Focus * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['North America', 'Europe', 'Asia', 'India', 'Latin America', 'Africa', 'Global'].map(geo => (
                      <label key={geo} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.geographyFocus.includes(geo)}
                          onChange={() => updateArrayField('geographyFocus', geo)}
                          className="w-4 h-4 text-black focus:ring-black border-gray-300 rounded"
                        />
                        <span className="text-sm text-black dark:text-white">{geo}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Investment Range */}
                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Typical Investment Range 
                  </label>
                  <select
                    value={formData.investmentRange}
                    onChange={(e) => updateFormData('investmentRange', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="">Select investment range</option>
                    <option value="$1K - $25K">$1K - $25K</option>
                    <option value="$25K - $100K">$25K - $100K</option>
                    <option value="$100K - $500K">$100K - $500K</option>
                    <option value="$500K - $1M">$500K - $1M</option>
                    <option value="$1M - $5M">$1M - $5M</option>
                    <option value="$5M - $10M">$5M - $10M</option>
                    <option value="$10M+">$10M+</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Investment Experience & Additional Info */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                  <DollarSign size={20} className="text-white dark:text-black" />
                </div>
                <h2 className="text-xl font-semibold text-black dark:text-white">Investment Experience</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Number of Previous Investments
                    </label>
                    <select
                      value={formData.previousInvestments}
                      onChange={(e) => updateFormData('previousInvestments', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    >
                      <option value="">Select range</option>
                      <option value="0">First time investor</option>
                      <option value="1-5">1-5 investments</option>
                      <option value="6-15">6-15 investments</option>
                      <option value="16-30">16-30 investments</option>
                      <option value="30+">30+ investments</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Current Portfolio Size
                    </label>
                    <select
                      value={formData.portfolioSize}
                      onChange={(e) => updateFormData('portfolioSize', e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    >
                      <option value="">Select range</option>
                      <option value="0">No current portfolio</option>
                      <option value="1-10">1-10 companies</option>
                      <option value="11-25">11-25 companies</option>
                      <option value="26-50">26-50 companies</option>
                      <option value="50+">50+ companies</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Notable Investments (Optional)
                  </label>
                  <textarea
                    value={formData.notableInvestments}
                    onChange={(e) => updateFormData('notableInvestments', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="List any notable companies in your portfolio or successful exits"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Investment Criteria
                  </label>
                  <textarea
                    value={formData.investmentCriteria}
                    onChange={(e) => updateFormData('investmentCriteria', e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="What do you look for in startups? Team, traction, market size, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Value-Add/Expertise
                  </label>
                  <textarea
                    value={formData.valueAdd}
                    onChange={(e) => updateFormData('valueAdd', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="What expertise and value do you bring beyond capital? Industry connections, operational experience, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Time Commitment
                  </label>
                  <select
                    value={formData.timeCommitment}
                    onChange={(e) => updateFormData('timeCommitment', e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  >
                    <option value="">Select time commitment</option>
                    <option value="Passive">Passive investor</option>
                    <option value="Advisory">Advisory role</option>
                    <option value="Board">Board participation</option>
                    <option value="Hands-on">Hands-on involvement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black dark:text-white mb-2">
                    Additional Information
                  </label>
                  <textarea
                    value={formData.additionalInfo}
                    onChange={(e) => updateFormData('additionalInfo', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                    placeholder="Any other information you'd like to share"
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