from dotenv import load_dotenv
load_dotenv()
import sys
import os



from memory.memory import MemoryGraph

from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, date
import json
from supabase import create_client
from dataclasses import dataclass
import uuid

SUPABASE_DB_PASSWORD = os.environ.get("SUPABASE_DB_PASSWORD")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
SUPABASE_URL = os.environ.get("SUPABASE_URL") 

memory_graph = MemoryGraph()
# Data Classes

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

class DatabaseManager:
    """Enhanced database manager for startup platform with AI agent integration"""
    
    def __init__(self, SUPABASE_URL: str, SUPABASE_KEY: str,):
        self.supabase_url = SUPABASE_URL
        self.supabase_key = SUPABASE_KEY
        self.memory_graph = memory_graph
        self.supabase = None
        self.connected = False
        self._init_connection()
    
    def _init_connection(self):
        """Initialize Supabase connection with error handling"""
        try:
            self.supabase = create_client(self.supabase_url, self.supabase_key)
            # Test connection
            test_result = self.supabase.table('startup_profiles').select('startup_id').limit(1).execute()
            self.connected = True
            print("✅ Database connection successful")
        except Exception as e:
            print(f"❌ Database connection failed: {str(e)}")
            self.connected = False
            self.supabase = None
    
    def is_connected(self) -> bool:
        """Check if database is connected"""
        return self.connected and self.supabase is not None
    
    # =================== STARTUP PROFILE MANAGEMENT ===================
    
    def generate_startup_id(self, company_name: str) -> str:
        """Generate unique startup ID"""
        base_id = company_name.replace(" ", "_").upper()[:10]
        unique_suffix = str(uuid.uuid4())[:8].upper()
        return f"{base_id}_{unique_suffix}"
    
    def save_startup_profile(self, startup_data: Dict[str, Any]) -> Optional[str]:
        """Save complete startup profile to database with validation"""
        if not self.is_connected():
            print("❌ Database not connected")
            return None
        
        # Validate required fields
        required_fields = ['company_name', 'industry_sector', 'contact_email']
        for field in required_fields:
            if not startup_data.get(field):
                print(f"❌ Missing required field: {field}")
                return None
            
        try:
            # Generate startup_id if not provided
            if not startup_data.get('startup_id'):
                startup_data['startup_id'] = self.generate_startup_id(startup_data['company_name'])
            
            # Prepare startup profile data with proper JSON serialization
            profile_data = {
                'startup_id': startup_data['startup_id'],
                'company_name': startup_data.get('company_name'),
                'brand_name': startup_data.get('brand_name', startup_data.get('company_name')),
                'registration_status': startup_data.get('registration_status', 'Unregistered'),
                'industry_sector': startup_data.get('industry_sector'),
                'stage': startup_data.get('stage', 'Idea'),
                'location_city': startup_data.get('location_city', ''),
                'location_state': startup_data.get('location_state', ''),
                'website': startup_data.get('website'),
                'contact_email': startup_data.get('contact_email'),
                'contact_phone': startup_data.get('contact_phone'),
                
                # Business Model & Product
                'problem_statement': startup_data.get('problem_statement', ''),
                'solution_description': startup_data.get('solution_description', ''),
                'target_market': startup_data.get('target_market', ''),
                'revenue_model': startup_data.get('revenue_model', ''),
                'pricing_strategy': startup_data.get('pricing_strategy', ''),
                'competitive_advantage': startup_data.get('competitive_advantage', ''),
                
                # Market & Traction (with safe conversions)
                'market_size_tam': self._safe_float_conversion(startup_data.get('market_size_tam')),
                'market_size_sam': self._safe_float_conversion(startup_data.get('market_size_sam')),
                'current_customers': self._safe_int_conversion(startup_data.get('current_customers', 0)),
                'monthly_revenue': self._safe_float_conversion(startup_data.get('monthly_revenue', 0)),
                'growth_rate': self._safe_float_conversion(startup_data.get('growth_rate')),
                'key_achievements': self._safe_json_conversion(startup_data.get('key_achievements', [])),
                
                # Financial Information
                'monthly_burn_rate': self._safe_float_conversion(startup_data.get('monthly_burn_rate')),
                'current_cash_position': self._safe_float_conversion(startup_data.get('current_cash_position')),
                'revenue_projections': self._safe_json_conversion(startup_data.get('revenue_projections', {})),
                'break_even_timeline': startup_data.get('break_even_timeline'),
                
                # Funding Requirements
                'funding_amount_required': self._safe_float_conversion(startup_data.get('funding_amount_required', 0)),
                'funding_stage': startup_data.get('funding_stage', 'Pre-seed'),
                'previous_funding': self._safe_float_conversion(startup_data.get('previous_funding', 0)),
                'use_of_funds': self._safe_json_conversion(startup_data.get('use_of_funds', {})),
                'equity_dilution': self._safe_float_conversion(startup_data.get('equity_dilution')),
                'valuation_expectations': self._safe_float_conversion(startup_data.get('valuation_expectations')),
                
                # Team & Operations
                'team_size': self._safe_int_conversion(startup_data.get('team_size', 1)),
                'technology_stack': self._safe_json_conversion(startup_data.get('technology_stack', [])),
                'operational_metrics': self._safe_json_conversion(startup_data.get('operational_metrics', {})),
                
                # Metadata
                'is_active': True,
                'is_verified': False,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            # Insert startup profile
            result = self.supabase.table('startup_profiles').insert(profile_data).execute()
            
            if not result.data:
                print("❌ Failed to insert startup profile")
                return None
                
            startup_id = result.data[0]['startup_id']
            print(f"✅ Startup profile saved with ID: {startup_id}")
            
            # Save founders separately
            if startup_data.get('founders'):
                self.save_founders(startup_id, startup_data['founders'])
            
            # Save team members separately
            if startup_data.get('team_members'):
                self.save_team_members(startup_id, startup_data['team_members'])
            
            return startup_id
            
        except Exception as e:
            print(f"❌ Error saving startup profile: {str(e)}")
            return None
    
    def _safe_float_conversion(self, value) -> Optional[float]:
        """Safely convert value to float"""
        if value is None or value == '':
            return None
        try:
            return float(value)
        except (ValueError, TypeError):
            return None
    
    def _safe_int_conversion(self, value) -> Optional[int]:
        """Safely convert value to int"""
        if value is None or value == '':
            return None
        try:
            return int(value)
        except (ValueError, TypeError):
            return None
    
    def _safe_json_conversion(self, value) -> str:
        """Safely convert value to JSON string"""
        if value is None:
            return json.dumps({})
        if isinstance(value, (dict, list)):
            return json.dumps(value)
        return str(value)
    
    # =================== AI AGENT SPECIFIC METHODS ===================
    
    def get_startup_for_insights(self, startup_id: str) -> Optional[Dict[str, Any]]:
        """Get startup data formatted for AI insights generation"""
        if not self.is_connected():
            return None
            
        try:
            startup_data = self.get_startup_profile(startup_id)
            if not startup_data:
                return None
            
            # Parse JSON fields for AI processing
            startup_data['key_achievements'] = json.loads(startup_data.get('key_achievements', '[]'))
            startup_data['revenue_projections'] = json.loads(startup_data.get('revenue_projections', '{}'))
            startup_data['use_of_funds'] = json.loads(startup_data.get('use_of_funds', '{}'))
            startup_data['technology_stack'] = json.loads(startup_data.get('technology_stack', '[]'))
            startup_data['operational_metrics'] = json.loads(startup_data.get('operational_metrics', '{}'))
            
            return startup_data
            
        except Exception as e:
            print(f"Error getting startup for insights: {str(e)}")
            return None
    
    def save_startup_insights(self, startup_id: str, insights_data: Dict[str, Any]) -> Optional[str]:
        """Save AI-generated insights for a startup"""
        if not self.is_connected():
            return None
            
        try:
            # Mark previous insights as not current
            self.supabase.table('startup_insights')\
                .update({'is_current': False})\
                .eq('startup_id', startup_id)\
                .execute()
            
            # Insert new insights
            insight_data = {
                'startup_id': startup_id,
                'executive_summary': insights_data.get('executive_summary'),
                'key_strengths': json.dumps(insights_data.get('key_strengths', [])),
                'major_risks': json.dumps(insights_data.get('major_risks', [])),
                'market_analysis': insights_data.get('market_analysis'),
                'financial_outlook': insights_data.get('financial_outlook'),
                'investment_recommendation': insights_data.get('investment_recommendation'),
                'recommendation_score': insights_data.get('recommendation_score'),
                'generated_by': insights_data.get('generated_by', 'AI_Agent_v1'),
                'generated_at': datetime.now().isoformat(),
                'is_current': True
            }
            
            result = self.supabase.table('startup_insights').insert(insight_data).execute()
            return result.data[0]['id'] if result.data else None
            
        except Exception as e:
            print(f"Error saving startup insights: {str(e)}")
            return None
    
    def get_startup_insights(self, startup_id: str) -> Optional[Dict[str, Any]]:
        """Get current AI insights for a startup"""
        if not self.is_connected():
            return None
            
        try:
            result = self.supabase.table('startup_insights')\
                .select('*')\
                .eq('startup_id', startup_id)\
                .eq('is_current', True)\
                .execute()
            
            if result.data:
                insights = result.data[0]
                # Parse JSON fields
                insights['key_strengths'] = json.loads(insights.get('key_strengths', '[]'))
                insights['major_risks'] = json.loads(insights.get('major_risks', '[]'))
                return insights
            
            return None
            
        except Exception as e:
            print(f"Error getting startup insights: {str(e)}")
            return None
    
    # =================== CHATBOT SPECIFIC METHODS ===================
    
    def save_conversation_with_context(self, conversation_data: ConversationRecord) -> Optional[str]:
        """Save conversation with enhanced context for chatbot"""
        if not self.is_connected():
            return None
            
        try:
            conv_data = {
                'session_id': conversation_data.session_id,
                'startup_id': conversation_data.startup_id,
                'query': conversation_data.user_query,
                'response': conversation_data.agent_response,
                'context': conversation_data.context_used,
                'agent_type': 'chatbot',
                'query_intent': conversation_data.query_intent,
                'user_id': conversation_data.user_id,
                'timestamp': datetime.now().isoformat()
            }
            
            result = self.supabase.table('conversations').insert(conv_data).execute()
            return result.data[0]['id'] if result.data else None
            
        except Exception as e:
            print(f"Error saving conversation: {str(e)}")
            return None
    
    def get_startup_conversation_context(self, startup_id: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recent conversations for a specific startup as context"""
        if not self.is_connected():
            return []
            
        try:
            result = self.supabase.table('conversations')\
                .select('query', 'response', 'timestamp')\
                .eq('startup_id', startup_id)\
                .order('timestamp', desc=True)\
                .limit(limit)\
                .execute()
            
            return result.data
            
        except Exception as e:
            print(f"Error getting conversation context: {str(e)}")
            return []
    
    def get_similar_startups_for_context(self, startup_id: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Get similar startups for comparative context in chatbot"""
        if not self.is_connected():
            return []
            
        try:
            # Get current startup's industry and stage
            current_startup = self.get_startup_profile(startup_id)
            if not current_startup:
                return []
            
            result = self.supabase.table('startup_profiles')\
                .select('startup_id', 'company_name', 'industry_sector', 'stage', 'monthly_revenue', 'funding_stage')\
                .eq('industry_sector', current_startup['industry_sector'])\
                .neq('startup_id', startup_id)\
                .eq('is_active', True)\
                .order('created_at', desc=True)\
                .limit(limit)\
                .execute()
            
            return result.data
            
        except Exception as e:
            print(f"Error getting similar startups: {str(e)}")
            return []
    
    # =================== ENHANCED SEARCH & RETRIEVAL ===================
    
    def get_startup_profile(self, startup_id: str) -> Optional[Dict[str, Any]]:
        """Get complete startup profile by ID with error handling"""
        if not self.is_connected():
            return None
            
        try:
            # Get main profile
            result = self.supabase.table('startup_profiles')\
                .select('*')\
                .eq('startup_id', startup_id)\
                .execute()
            
            if not result.data:
                print(f"❌ No startup found with ID: {startup_id}")
                return None
            
            startup_profile = result.data[0]
            
            # Get founders
            founders_result = self.supabase.table('founders')\
                .select('*')\
                .eq('startup_id', startup_id)\
                .execute()
            startup_profile['founders'] = founders_result.data or []
            
            # Get team members
            team_result = self.supabase.table('team_members')\
                .select('*')\
                .eq('startup_id', startup_id)\
                .execute()
            startup_profile['team_members'] = team_result.data or []
            
            return startup_profile
            
        except Exception as e:
            print(f"❌ Error retrieving startup profile: {str(e)}")
            return None
    
    def save_founders(self, startup_id: str, founders: List[Dict[str, Any]]):
        """Save founder information with validation"""
        if not self.is_connected():
            return None
            
        try:
            for founder in founders:
                if not founder.get('name'):
                    continue  # Skip founders without names
                    
                founder_data = {
                    'startup_id': startup_id,
                    'name': founder.get('name'),
                    'role': founder.get('role', 'Founder'),
                    'education_degree': founder.get('education_degree'),
                    'education_institution': founder.get('education_institution'),
                    'professional_experience': founder.get('professional_experience'),
                    'years_of_experience': self._safe_int_conversion(founder.get('years_of_experience')),
                    'equity_stake': self._safe_float_conversion(founder.get('equity_stake')),
                    'linkedin_profile': founder.get('linkedin_profile'),
                    'is_primary_founder': founder.get('is_primary_founder', False),
                    'created_at': datetime.now().isoformat()
                }
                self.supabase.table('founders').insert(founder_data).execute()
                
        except Exception as e:
            print(f"❌ Error saving founders: {str(e)}")
    
    def save_team_members(self, startup_id: str, team_members: List[Dict[str, Any]]):
        """Save team member information with validation"""
        if not self.is_connected():
            return None
            
        try:
            for member in team_members:
                if not member.get('name'):
                    continue  # Skip members without names
                    
                member_data = {
                    'startup_id': startup_id,
                    'name': member.get('name'),
                    'role': member.get('role', 'Team Member'),
                    'department': member.get('department'),
                    'experience': member.get('experience'),
                    'skills': self._safe_json_conversion(member.get('skills', [])),
                    'is_key_member': member.get('is_key_member', False),
                    'created_at': datetime.now().isoformat()
                }
                self.supabase.table('team_members').insert(member_data).execute()
                
        except Exception as e:
            print(f"❌ Error saving team members: {str(e)}")
    
    # =================== EXISTING METHODS (Enhanced) ===================
    
    def get_all_startups(self, filters: Dict[str, Any] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all startup profiles with optional filters - enhanced for AI agents"""
        if not self.is_connected():
            return []
            
        try:
            query = self.supabase.table('startup_profiles')\
                .select('startup_id, company_name, industry_sector, stage, funding_stage, location_city, location_state, monthly_revenue, funding_amount_required, team_size, created_at')\
                .eq('is_active', True)
            
            # Apply filters
            if filters:
                if 'industry_sector' in filters and filters['industry_sector']:
                    query = query.eq('industry_sector', filters['industry_sector'])
                if 'stage' in filters and filters['stage']:
                    query = query.eq('stage', filters['stage'])
                if 'funding_stage' in filters and filters['funding_stage']:
                    query = query.eq('funding_stage', filters['funding_stage'])
                if 'location_city' in filters and filters['location_city']:
                    query = query.eq('location_city', filters['location_city'])
                if 'min_funding' in filters and filters['min_funding']:
                    query = query.gte('funding_amount_required', filters['min_funding'])
                if 'max_funding' in filters and filters['max_funding']:
                    query = query.lte('funding_amount_required', filters['max_funding'])
            
            result = query.order('created_at', desc=True).limit(limit).execute()
            return result.data or []
            
        except Exception as e:
            print(f"❌ Error retrieving startups: {str(e)}")
            return []
    
    def search_startups(self, search_term: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Enhanced search with better error handling"""
        if not self.is_connected():
            return []
            
        try:
            search_pattern = f"%{search_term}%"
            result = self.supabase.table('startup_profiles')\
                .select('startup_id, company_name, industry_sector, problem_statement, solution_description, stage, funding_stage')\
                .or_(f"company_name.ilike.{search_pattern},industry_sector.ilike.{search_pattern},problem_statement.ilike.{search_pattern}")\
                .eq('is_active', True)\
                .order('created_at', desc=True)\
                .limit(limit)\
                .execute()
            
            return result.data or []
            
        except Exception as e:
            print(f"❌ Error searching startups: {str(e)}")
            return []
        
    # Integration example - Add these methods to your DatabaseManager class

    def initialize_memory_graph(self):
        """Initialize and populate the memory graph"""
        
        if not self.is_connected():
            print("❌ Database not connected. Cannot initialize memory graph.")
            return None
        
        # Build the graph from existing data
        memory_graph.build_startup_graph_from_db(self)
        return memory_graph

    def get_enhanced_chatbot_context(self, startup_id: str, query: str) -> Dict[str, Any]:
        """Get enhanced context using both database and memory graph"""
        
        # Get basic startup data from database
        startup_data = self.get_startup_for_insights(startup_id)
        if not startup_data:
            return {}
        
        # Get conversation history
        conversation_history = self.get_startup_conversation_context(startup_id, limit=5)
        
        # Get graph-based context
        graph_context = memory_graph.get_chatbot_context(startup_id, query)
        
        # Combine all contexts
        enhanced_context = {
            "startup_data": startup_data,
            "conversation_history": conversation_history,
            "graph_relationships": graph_context,
            "similar_startups": memory_graph.find_similar_startups(startup_id),
            "query_focus": graph_context.get("focus", "general")
        }
        
        return enhanced_context

    def save_startup_with_graph_update(self, startup_data: Dict[str, Any]) -> Optional[str]:
        """Save startup and update memory graph"""
        
        # Save to database first
        startup_id = self.save_startup_profile(startup_data)
        
        if startup_id:
            # Add to memory graph
            memory_graph.add_entity(
                entity_id=startup_id,
                entity_type="startup",
                properties=startup_data
            )
            
            # Add relationships
            if startup_data.get('industry_sector'):
                industry_id = f"industry_{startup_data['industry_sector'].replace(' ', '_').lower()}"
                memory_graph.add_entity(
                    entity_id=industry_id,
                    entity_type="industry",
                    properties={"name": startup_data['industry_sector']}
                )
                memory_graph.add_relationship(startup_id, industry_id, "operates_in")
            
            # Add founder relationships
            if startup_data.get('founders'):
                for founder in startup_data['founders']:
                    founder_id = f"founder_{founder.get('name', '').replace(' ', '_').lower()}"
                    memory_graph.add_entity(
                        entity_id=founder_id,
                        entity_type="founder",
                        properties=founder
                    )
                    memory_graph.add_relationship(startup_id, founder_id, "founded_by")
        
        return startup_id

    # Usage example in your agent/chatbot
    def get_intelligent_response(startup_id: str, user_query: str) -> str:
        """Example of how to use enhanced context in your chatbot"""
        
        # Get enhanced context
        context = db_manager.get_enhanced_chatbot_context(startup_id, user_query)
        
        # Build context string for your AI agent
        context_string = f"""
        Startup Information:
        - Company: {context['startup_data'].get('company_name')}
        - Industry: {context['startup_data'].get('industry_sector')}
        - Stage: {context['startup_data'].get('stage')}
        
        Query Focus: {context.get('query_focus', 'general')}
        
        Related Information:
        """
        
        if context['query_focus'] == 'competitors':
            competitors = context['graph_relationships'].get('competitors', [])
            if competitors:
                context_string += f"Competitors: {[comp['entity']['properties'].get('company_name') for comp in competitors[:3]]}\n"
        
        elif context['query_focus'] == 'similar_startups':
            similar = context.get('similar_startups', [])
            if similar:
                context_string += f"Similar Startups: {[s['startup']['properties'].get('company_name') for s in similar[:3]]}\n"
        
        # Add conversation history
        if context.get('conversation_history'):
            context_string += "\nRecent Conversation:\n"
            for conv in context['conversation_history'][:2]:
                context_string += f"Q: {conv['query'][:100]}...\nA: {conv['response'][:100]}...\n"
        
        return context_string  # Feed this to your AI agent

# Create global database instance
try:
    db_manager = DatabaseManager(SUPABASE_URL, SUPABASE_KEY)
except Exception as e:
    print(f"Failed to initialize DatabaseManager: {e}")
    db_manager = None