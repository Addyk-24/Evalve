import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side operations
);

// Save startup data to existing startup_profiles table
async function saveStartupToDatabase(formData) {
  try {
    // Insert into startup_profiles table
    const { data: investorData, error: investorError } = await supabase
      .from('investor_profiles')
      .insert([
        {
      name: formData.firstName + ' ' + formData.lastName,
      email: formData.email,
      phone: formData.phone,
      linkedin: formData.linkedIn,
      location: formData.location,
      investor_type: formData.investorType,
      organization: formData.organization,
      title: formData.title,
      experience: formData.experience,
      investment_stage: formData.investmentStage,
      industry_focus: formData.industryFocus,
      geography_focus: formData.geographyFocus,
      investment_range: formData.investmentRange,
      previous_investments: formData.previousInvestments,
      portfolio_size: formData.portfolioSize,
        }
      ])
      .select()
      .single();

    if (investorError) {
      throw new Error(`Failed to save startup data: ${investorError.message}`);
    }
    return {
      id: investorData.investor_id,
      name: investorData.name,
      email: investorData.email,
      createdAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Database save error:', error);
    throw error;
  }
}


export async function POST(request) {
  try {
    const formData = await request.json();

    // Comprehensive validation
    const errors = validateFormData(formData);
    if (errors.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          details: errors 
        },
        { status: 400 }
      );
    }

    // Save to database
    const savedData = await saveStartupToDatabase(formData);
    
    // Send confirmation email
    try {
      await sendConfirmationEmail(savedData);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the entire request if email fails
    }

    // Log successful submission
    console.log('Entrepreneur application saved:', {
      id: savedData.id,
      company: savedData.companyName,
      email: savedData.email,
      timestamp: savedData.createdAt
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! We will review your application and get back to you within 2-3 business days.',
      applicationId: savedData.id,
      redirectUrl: '/dashboard'
    });
    
  } catch (error) {
    console.error('Error processing entrepreneur signup:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Comprehensive validation function
function validateFormData(formData) {
  const errors = [];

  // Required company fields
  const requiredCompanyFields = {
    Name: 'Company Legal Name',
    email: 'Email',
    phone: 'Phone',
    type: 'Industry_Type',
    location: 'Location ',
  };

  for (const [field, label] of Object.entries(requiredCompanyFields)) {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors.push(`${label} is required`);
    }
  }

  // Email validation
  if (formData.email && !isValidEmail(formData.email)) {
    errors.push('Please provide a valid email address');
  }

  // Phone validation
  if (formData.phone && !isValidPhone(formData.phone)) {
    errors.push('Please provide a valid phone number');
  }

  return errors;
}



// Helper validation functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  // Basic phone validation - adjust regex based on your requirements
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Optional: Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}