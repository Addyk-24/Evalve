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
    const { data: startupData, error: startupError } = await supabase
      .from('startup_profiles')
      .insert([
        {
          company_name: formData.companyLegalName,
          brand_name: formData.companyBrandName || formData.companyLegalName,
          industry_sector: formData.industry,
          location_city: formData.city,
          location_state: formData.state,
          contact_email: formData.email,
          contact_phone: formData.phone,
          problem_statement: formData.problemStatement,
          solution_description: formData.solutionDescription,
          target_market: formData.targetMarket,
          revenue_model: formData.revenueModel,
          stage: formData.stage,
          website: formData.website || null
        }
      ])
      .select()
      .single();

    if (startupError) {
      throw new Error(`Failed to save startup data: ${startupError.message}`);
    }

    // Check if founders table exists and save founders data there
    // If you don't have a founders table, we'll create a JSON field approach
    try {
      const foundersData = formData.founders.map(founder => ({
        startup_id: startupData.startup_id,
        name: founder.name,
        role: founder.role,
        education: founder.education || null,
        institution: founder.institution || null,
        experience: founder.experience || null,
        equity_share: parseFloat(founder.equityShare) || null,
        linkedin_profile: founder.linkedin_profile || null
      }));

      const { error: foundersError } = await supabase
        .from('founders')
        .insert(foundersData);

      if (foundersError) {
        // If founders table doesn't exist or fails, we'll continue without it
        // but log the error for debugging
        console.warn('Founders table insertion failed:', foundersError.message);
        console.log('Continuing without founders data...');
      }
    } catch (foundersErr) {
      console.warn('Founders table not available:', foundersErr.message);
    }

    return {
      id: startupData.startup_id,
      email: startupData.contact_email,
      companyName: startupData.company_name,
      createdAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Database save error:', error);
    throw error;
  }
}

// Mock email service function
async function sendConfirmationEmail(userData) {
  // This is where you'd implement your email service
  // Examples:
  
  // Using NodeMailer:
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransporter({...});
  // await transporter.sendMail({
  //   to: userData.email,
  //   subject: 'Application Received - Thank You!',
  //   html: `<h1>Thank you for your application!</h1>
  //          <p>We have received your entrepreneur application for ${userData.companyName}.</p>
  //          <p>Application ID: ${userData.id}</p>`
  // });
  
  // Using SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: userData.email,
  //   from: 'noreply@yourplatform.com',
  //   subject: 'Application Received',
  //   html: emailTemplate
  // });
  
  console.log(`Confirmation email would be sent to: ${userData.email}`);
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
    companyLegalName: 'Company Legal Name',
    registrationStatus: 'Registration Status',
    industry: 'Industry',
    stage: 'Current Stage',
    city: 'City',
    state: 'State',
    email: 'Email',
    phone: 'Phone'
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

  // Website validation (if provided)
  if (formData.website && !isValidUrl(formData.website)) {
    errors.push('Please provide a valid website URL');
  }

  // Founders validation
  if (!formData.founders || formData.founders.length === 0) {
    errors.push('At least one founder is required');
  } else {
    formData.founders.forEach((founder, index) => {
      if (!founder.name || founder.name.trim() === '') {
        errors.push(`Founder ${index + 1}: Name is required`);
      }
      if (!founder.role || founder.role.trim() === '') {
        errors.push(`Founder ${index + 1}: Role is required`);
      }
      if (founder.equityShare && (isNaN(founder.equityShare) || founder.equityShare < 0 || founder.equityShare > 100)) {
        errors.push(`Founder ${index + 1}: Equity share must be between 0 and 100`);
      }
      if (founder.linkedIn && !isValidUrl(founder.linkedIn)) {
        errors.push(`Founder ${index + 1}: Please provide a valid LinkedIn URL`);
      }
    });

    // Check if total equity adds up to reasonable amount
    const totalEquity = formData.founders
      .map(f => parseFloat(f.equityShare) || 0)
      .reduce((sum, equity) => sum + equity, 0);
    
    if (totalEquity > 100) {
      errors.push('Total founder equity cannot exceed 100%');
    }
  }

  // Required business fields
  const requiredBusinessFields = {
    problemStatement: 'Problem Statement',
    solutionDescription: 'Solution Description',
    targetMarket: 'Target Market',
    revenueModel: 'Revenue Model',
    competitiveAdvantage: 'Competitive Advantage'
  };

  for (const [field, label] of Object.entries(requiredBusinessFields)) {
    if (!formData[field] || formData[field].toString().trim() === '') {
      errors.push(`${label} is required`);
    }
  }

  // Solution description length check
  if (formData.solutionDescription && formData.solutionDescription.length < 50) {
    errors.push('Solution description should be at least 50 characters long');
  }

  // Team size validation
  if (formData.teamSize && (isNaN(formData.teamSize) || parseInt(formData.teamSize) < 1)) {
    errors.push('Team size must be a positive number');
  }

  // Financial data validation
  if (formData.monthlyRevenue && isNaN(formData.monthlyRevenue)) {
    errors.push('Monthly revenue must be a valid number');
  }
  if (formData.burnRate && isNaN(formData.burnRate)) {
    errors.push('Burn rate must be a valid number');
  }
  if (formData.cashPosition && isNaN(formData.cashPosition)) {
    errors.push('Cash position must be a valid number');
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