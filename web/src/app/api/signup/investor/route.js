export async function POST(request) {
  try {
    const formData = await request.json();
    
    // Log the investor signup data
    console.log('Investor signup data:', formData);
    
    // Basic validation
    const requiredFields = [
      'firstName', 
      'lastName', 
      'email', 
      'phone', 
      'location',
      'investorType',
      'experience',
      'investmentRange'
    ];
    
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      return Response.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Validate arrays
    if (!formData.investmentStage || formData.investmentStage.length === 0) {
      return Response.json(
        { error: 'Please select at least one investment stage' },
        { status: 400 }
      );
    }
    
    if (!formData.industryFocus || formData.industryFocus.length === 0) {
      return Response.json(
        { error: 'Please select at least one industry focus' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return Response.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }
    
    // Check required investment criteria
    if (!formData.investmentCriteria) {
      return Response.json(
        { error: 'Investment criteria is required' },
        { status: 400 }
      );
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real application, you would:
    // - Save the data to a database
    // - Create an investor profile
    // - Send confirmation emails
    // - Set up matching preferences
    // - Verify accreditation status
    
    return Response.json({
      success: true,
      message: 'Application submitted successfully! We will review your investor profile and get back to you soon.',
      applicationId: `INV-${Date.now()}`
    });
    
  } catch (error) {
    console.error('Error processing investor signup:', error);
    return Response.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}