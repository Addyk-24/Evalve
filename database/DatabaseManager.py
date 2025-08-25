from dotenv import load_dotenv
load_dotenv()
import os

from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, date
import json
from supabase import create_client
from dataclasses import dataclass
import uuid

SUPABASE_DB_PASSWORD = os.environ.get("SUPABASE_DB_PASSWORD")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
SUPABASE_URL = "https://gcyjrqgljtizcgekbsgf.supabase.co"


# Data Classes for Type Safety
@dataclass
class StartupProfile:
    company_name: str
    business_category: str
    product_description: str
    funding_amount_required: float
    funding_stage: str
    developer_id: str
    # Optional fields with defaults
    registration_status: str = "not_registered"
    development_stage: str = "idea"
    is_active: bool = True

@dataclass
class FounderInfo:
    full_name: str
    designation: str
    startup_id: str
    education: List[Dict]
    professional_experience: List[Dict] = None
    equity_stake: float = 0.0
    is_primary_founder: bool = False

@dataclass
class ConversationRecord:
    session_id: str
    user_query: str
    agent_response: str
    startup_id: str = None
    user_id: str = None
    context_used: str = ""
    query_intent: str = ""

from datetime import datetime
from supabase import create_client
from typing import Dict, List, Optional, Any
import json

class DatabaseManager:
    """Manages database operations for startup platform"""
    
    def __init__(self, SUPABASE_URL: str, SUPABASE_KEY: str):
        self.supabase_url = SUPABASE_URL
        self.supabase_key = SUPABASE_KEY
        self.supabase = None
        self.connected = False
        self._init_connection()
    
    def _init_connection(self):
        """Initialize Supabase connection with error handling"""
        try:
            self.supabase = create_client(self.supabase_url, self.supabase_key)
            self.supabase.table('conversations').select('id').limit(1).execute()
            self.connected = True
            print("✅ Database connection successful")
        except Exception as e:
            print(f"❌ Database connection failed: {str(e)}")
            self.connected = False
            self.supabase = None
    
    def is_connected(self) -> bool:
        """Check if database is connected"""
        return self.connected and self.supabase is not None
    
    # =================== CONVERSATION MANAGEMENT ===================
    def save_conversation(self, session_id: str, query: str, response: str, context: str = None):
        """Save conversation to database"""
        if not self.is_connected():
            return None
            
        try:
            conversation_data = {
                'session_id': session_id,
                'query': query,
                'response': response,
                'context': context,
                'timestamp': datetime.now().isoformat()
            }
            result = self.supabase.table('conversations').insert(conversation_data).execute()
            return result.data[0]['id'] if result.data else None
        except Exception as e:
            print(f"Error saving conversation: {str(e)}")
            return None
    
    def get_conversation_history(self, session_id: str, limit: int = 10):
        """Retrieve conversation history from database"""
        if not self.is_connected():
            return []
            
        try:
            result = self.supabase.table('conversations')\
                .select('*')\
                .eq('session_id', session_id)\
                .order('timestamp', desc=True)\
                .limit(limit)\
                .execute()
            return result.data
        except Exception as e:
            print(f"Error retrieving conversation history: {str(e)}")
            return []
    
    # =================== STARTUP PROFILE MANAGEMENT ===================
    def save_startup_profile(self, startup_data: Dict[str, Any]) -> Optional[str]:
        """Save complete startup profile to database"""
        if not self.is_connected():
            return None
            
        try:
            # Prepare startup profile data
            profile_data = {
                'startup_id': startup_data.get('startup_id'),
                'company_name': startup_data.get('company_name'),
                'brand_name': startup_data.get('brand_name'),
                'registration_status': startup_data.get('registration_status'),
                'industry_sector': startup_data.get('industry_sector'),
                'stage': startup_data.get('stage'),
                'location_city': startup_data.get('location_city'),
                'location_state': startup_data.get('location_state'),
                'website': startup_data.get('website'),
                'contact_email': startup_data.get('contact_email'),
                'contact_phone': startup_data.get('contact_phone'),
                
                # Business Model & Product
                'problem_statement': startup_data.get('problem_statement'),
                'solution_description': startup_data.get('solution_description'),
                'target_market': startup_data.get('target_market'),
                'revenue_model': startup_data.get('revenue_model'),
                'pricing_strategy': startup_data.get('pricing_strategy'),
                'competitive_advantage': startup_data.get('competitive_advantage'),
                
                # Market & Traction
                'market_size_tam': startup_data.get('market_size_tam'),
                'market_size_sam': startup_data.get('market_size_sam'),
                'current_customers': startup_data.get('current_customers'),
                'monthly_revenue': startup_data.get('monthly_revenue'),
                'growth_rate': startup_data.get('growth_rate'),
                'key_achievements': json.dumps(startup_data.get('key_achievements', [])),
                
                # Financial Information
                'monthly_burn_rate': startup_data.get('monthly_burn_rate'),
                'current_cash_position': startup_data.get('current_cash_position'),
                'revenue_projections': json.dumps(startup_data.get('revenue_projections', {})),
                'break_even_timeline': startup_data.get('break_even_timeline'),
                
                # Funding Requirements
                'funding_amount_required': startup_data.get('funding_amount_required'),
                'funding_stage': startup_data.get('funding_stage'),
                'previous_funding': startup_data.get('previous_funding'),
                'use_of_funds': json.dumps(startup_data.get('use_of_funds', {})),
                'equity_dilution': startup_data.get('equity_dilution'),
                'valuation_expectations': startup_data.get('valuation_expectations'),
                
                # Team & Operations
                'team_size': startup_data.get('team_size'),
                'technology_stack': json.dumps(startup_data.get('technology_stack', [])),
                'operational_metrics': json.dumps(startup_data.get('operational_metrics', {})),
                
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            result = self.supabase.table('startup_profiles').insert(profile_data).execute()
            startup_id = result.data[0]['startup_id'] if result.data else None
            
            # Save founders separately
            if startup_id and 'founders' in startup_data:
                self.save_founders(startup_id, startup_data['founders'])
            
            # Save team members separately
            if startup_id and 'team_members' in startup_data:
                self.save_team_members(startup_id, startup_data['team_members'])
            
            return startup_id
            
        except Exception as e:
            print(f"Error saving startup profile: {str(e)}")
            return None
    
    def save_founders(self, startup_id: str, founders: List[Dict[str, Any]]):
        """Save founder information"""
        if not self.is_connected():
            return None
            
        try:
            for founder in founders:
                founder_data = {
                    'startup_id': startup_id,
                    'name': founder.get('name'),
                    'role': founder.get('role'),
                    'education_degree': founder.get('education_degree'),
                    'education_institution': founder.get('education_institution'),
                    'professional_experience': founder.get('professional_experience'),
                    'years_of_experience': founder.get('years_of_experience'),
                    'equity_stake': founder.get('equity_stake'),
                    'linkedin_profile': founder.get('linkedin_profile'),
                    'created_at': datetime.now().isoformat()
                }
                self.supabase.table('founders').insert(founder_data).execute()
                
        except Exception as e:
            print(f"Error saving founders: {str(e)}")
    
    def save_team_members(self, startup_id: str, team_members: List[Dict[str, Any]]):
        """Save team member information"""
        if not self.is_connected():
            return None
            
        try:
            for member in team_members:
                member_data = {
                    'startup_id': startup_id,
                    'name': member.get('name'),
                    'role': member.get('role'),
                    'department': member.get('department'),
                    'experience': member.get('experience'),
                    'skills': json.dumps(member.get('skills', [])),
                    'created_at': datetime.now().isoformat()
                }
                self.supabase.table('team_members').insert(member_data).execute()
                
        except Exception as e:
            print(f"Error saving team members: {str(e)}")
    
    def get_startup_profile(self, startup_id: str) -> Optional[Dict[str, Any]]:
        """Get complete startup profile by ID"""
        if not self.is_connected():
            return None
            
        try:
            # Get main profile
            result = self.supabase.table('startup_profiles')\
                .select('*')\
                .eq('startup_id', startup_id)\
                .execute()
            
            if not result.data:
                return None
            
            startup_profile = result.data[0]
            
            # Get founders
            founders_result = self.supabase.table('founders')\
                .select('*')\
                .eq('startup_id', startup_id)\
                .execute()
            startup_profile['founders'] = founders_result.data
            
            # Get team members
            team_result = self.supabase.table('team_members')\
                .select('*')\
                .eq('startup_id', startup_id)\
                .execute()
            startup_profile['team_members'] = team_result.data
            
            return startup_profile
            
        except Exception as e:
            print(f"Error retrieving startup profile: {str(e)}")
            return None
    
    def get_all_startups(self, filters: Dict[str, Any] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all startup profiles with optional filters"""
        if not self.is_connected():
            return []
            
        try:
            query = self.supabase.table('startup_profiles').select('*')
            
            # Apply filters
            if filters:
                if 'industry_sector' in filters:
                    query = query.eq('industry_sector', filters['industry_sector'])
                if 'stage' in filters:
                    query = query.eq('stage', filters['stage'])
                if 'funding_stage' in filters:
                    query = query.eq('funding_stage', filters['funding_stage'])
                if 'location_city' in filters:
                    query = query.eq('location_city', filters['location_city'])
                if 'min_funding' in filters:
                    query = query.gte('funding_amount_required', filters['min_funding'])
                if 'max_funding' in filters:
                    query = query.lte('funding_amount_required', filters['max_funding'])
            
            result = query.order('created_at', desc=True).limit(limit).execute()
            return result.data
            
        except Exception as e:
            print(f"Error retrieving startups: {str(e)}")
            return []
    
    def update_startup_profile(self, startup_id: str, update_data: Dict[str, Any]) -> bool:
        """Update startup profile"""
        if not self.is_connected():
            return False
            
        try:
            update_data['updated_at'] = datetime.now().isoformat()
            result = self.supabase.table('startup_profiles')\
                .update(update_data)\
                .eq('startup_id', startup_id)\
                .execute()
            return len(result.data) > 0
            
        except Exception as e:
            print(f"Error updating startup profile: {str(e)}")
            return False
    
    def delete_startup_profile(self, startup_id: str) -> bool:
        """Delete startup profile and related data"""
        if not self.is_connected():
            return False
            
        try:
            # Delete related data first
            self.supabase.table('founders').delete().eq('startup_id', startup_id).execute()
            self.supabase.table('team_members').delete().eq('startup_id', startup_id).execute()
            
            # Delete main profile
            result = self.supabase.table('startup_profiles')\
                .delete()\
                .eq('startup_id', startup_id)\
                .execute()
            return len(result.data) > 0
            
        except Exception as e:
            print(f"Error deleting startup profile: {str(e)}")
            return False
    
    # =================== SEARCH & ANALYTICS ===================
    def search_startups(self, search_term: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search startups by company name, industry, or keywords"""
        if not self.is_connected():
            return []
            
        try:
            result = self.supabase.table('startup_profiles')\
                .select('*')\
                .or_(f"company_name.ilike.%{search_term}%,industry_sector.ilike.%{search_term}%,problem_statement.ilike.%{search_term}%")\
                .order('created_at', desc=True)\
                .limit(limit)\
                .execute()
            return result.data
            
        except Exception as e:
            print(f"Error searching startups: {str(e)}")
            return []
    
    def get_startup_analytics(self) -> Dict[str, Any]:
        """Get platform analytics"""
        if not self.is_connected():
            return {}
            
        try:
            # Total startups
            total_result = self.supabase.table('startup_profiles').select('startup_id', count='exact').execute()
            total_startups = total_result.count
            
            # By industry
            industry_result = self.supabase.rpc('get_startups_by_industry').execute()
            
            # By stage
            stage_result = self.supabase.rpc('get_startups_by_stage').execute()
            
            # By funding stage
            funding_result = self.supabase.rpc('get_startups_by_funding_stage').execute()
            
            return {
                'total_startups': total_startups,
                'by_industry': industry_result.data if industry_result.data else [],
                'by_stage': stage_result.data if stage_result.data else [],
                'by_funding_stage': funding_result.data if funding_result.data else []
            }
            
        except Exception as e:
            print(f"Error getting analytics: {str(e)}")
            return {}
    
    # =================== DOCUMENT MANAGEMENT ===================
    def save_document_metadata(self, filepath: str, document_type: str, chunk_count: int):
        """Save document metadata to database"""
        if not self.is_connected():
            return None
            
        try:
            doc_data = {
                'filepath': filepath,
                'document_type': document_type,
                'chunk_count': chunk_count,
                'processed_at': datetime.now().isoformat()
            }
            result = self.supabase.table('document_metadata').insert(doc_data).execute()
            return result.data[0]['id'] if result.data else None
        except Exception as e:
            print(f"Error saving document metadata: {str(e)}")
            return None
    
    def get_processed_documents(self):
        """Get list of processed documents"""
        if not self.is_connected():
            return []
            
        try:
            result = self.supabase.table('document_metadata')\
                .select('*')\
                .order('processed_at', desc=True)\
                .execute()
            return result.data
        except Exception as e:
            print(f"Error retrieving documents: {str(e)}")
            return []
    


