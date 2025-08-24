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

class BaseDatabase:
    """Base database class with common functionality"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase_url = supabase_url
        self.supabase_key = supabase_key
        self.supabase = None
        self.connected = False
        self._init_connection()
    
    def _init_connection(self):
        """Initialize Supabase connection with error handling"""
        try:
            self.supabase = create_client(self.supabase_url, self.supabase_key)
            # Test connection
            self.supabase.table('users').select('id').limit(1).execute()
            self.connected = True
            print("✅ Database connection successful")
        except Exception as e:
            print(f"❌ Database connection failed: {str(e)}")
            self.connected = False
            self.supabase = None
    
    def is_connected(self) -> bool:
        """Check if database is connected"""
        return self.connected and self.supabase is not None
    
    def _handle_db_error(self, operation: str, error: Exception):
        """Handle database errors consistently"""
        error_msg = f"Error in {operation}: {str(error)}"
        print(error_msg)
        return None


