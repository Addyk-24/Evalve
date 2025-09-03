import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for server-side operations
);

// NO NEED OF THIS FUCNTION AS WE ARE REQUESTING THE FASTAPI ENDPOINT DIRECTLY
// Save investor data to database
// async function saveInvestorToDatabase(formData) {
//   try {
//     // Insert into investor_profiles table
//     const { data: investorData, error: investorError } = await supabase
//       .from('investor_profiles')
//       .insert([
//         {
//           name: formData.name,
//           email: formData.email,
//           phone: formData.phone,
//           linkedin: formData.linkedin,
//           location: formData.location,
//           type: formData.investor_type,
//           organization: formData.organization,
//           title: formData.title,
//           experience: formData.experience,
//           investment_stage: formData.investment_stage,
//           industry_focus: formData.industry_focus,
//           geography_focus: formData.geography_focus,
//           investment_range: formData.investment_range,
//           previous_investments: formData.previous_investments,
//           portfolio_size: formData.portfolio_size,
//           notable_investments: formData.notable_investments || null,
//           investment_criteria: formData.investment_criteria || null,
//           value_add: formData.value_add || null,
//           time_commitment: formData.time_commitment || null,
//           additional_info: formData.additional_info || null,
//           created_at: new Date().toISOString(),
//           updated_at: new Date().toISOString()
//         }
//       ])
//       .select()
//       .single();

//     if (investorError) {
//       throw new Error(`Failed to save investor data: ${investorError.message}`);
//     }

//     return {
//       id: investorData.investor_id,
//       name: investorData.name,
//       email: investorData.email,
//       createdAt: investorData.created_at
//     };

//   } catch (error) {
//     console.error('Database save error:', error);
//     throw error;
//   }
// }

// Send confirmation email (optional)
async function sendConfirmationEmail(investorData) {
  // Implement your email service here (SendGrid, Resend, etc.)
  console.log('Sending confirmation email to:', investorData.email);
  // This is a placeholder - implement actual email sending
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
    const savedData = await saveInvestorToDatabase(formData);
    
    // Send confirmation email (optional)
    try {
      await sendConfirmationEmail(savedData);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the entire request if email fails
    }

    // Log successful submission
    console.log('Investor application saved:', {
      id: savedData.id,
      name: savedData.name,
      email: savedData.email,
      timestamp: savedData.createdAt
    });

    // Return success response
    return NextResponse.json({
      status: 'success',
      message: 'Application submitted successfully! We will review your application and get back to you within 2-3 business days.',
      applicationId: savedData.id,
      redirectUrl: '/dashboard'
    });
    
  } catch (error) {
    console.error('Error processing investor signup:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { 
        status: 'error',
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

  // Required fields mapping
  const requiredFields = {
    name: 'Investor name',
    email: 'Email',
    phone: 'Phone number',
    location: 'Location',
    investor_type: 'Investor type',
  };

  // Check required fields
  for (const [field, label] of Object.entries(requiredFields)) {
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

  // LinkedIn URL validation (if provided)
  if (formData.linkedin && formData.linkedin.trim() !== '' && !isValidUrl(formData.linkedin)) {
    errors.push('Please provide a valid LinkedIn URL');
  }

  // Array field validation - these will be converted to objects
  if (formData.industry_focus && !Array.isArray(formData.industry_focus)) {
    errors.push('Industry focus must be an array');
  }

  if (formData.geography_focus && !Array.isArray(formData.geography_focus)) {
    errors.push('Geography focus must be an array');
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

// Handle other HTTP methods
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