from dotenv import load_dotenv
load_dotenv() 

# Agno imports
from agno.agent import Agent, AgentKnowledge
from agno.models.openai import OpenAIChat
from agno.team.team import Team
from agno.tools.serpapi import SerpApiTools

# Trial
from agno.models.groq import Groq

from system_prompt.prompt import system_prompt
from database.DatabaseManager import DatabaseManager
from conversation_mem.convo_mem import ConversationMemory
from memory.memory import MemoryGraph

from agno.knowledge.pdf import PDFKnowledgeBase, PDFReader
from agno.knowledge.website import WebsiteKnowledgeBase
from agno.document.base import Document
from agno.vectordb.pgvector import PgVector, SearchType
from agno.document.chunking.agentic import AgenticChunking
from agno.document.chunking.document import DocumentChunking
from agno.tools import Toolkit
from supabase import create_client

from typing import List, Dict, Any, Optional

# from agno.models.ollama import Ollama


import os
import json
import re
import requests
import urllib.parse
from datetime import datetime
from pathlib import Path

# SYSTEM PROMPTS
insight_system_prompt = system_prompt.startup_insight
knowledge_system_prompt = system_prompt.Startup_Knowledge

# WEB SCRAPPING TOOL
web_scrapping = SerpApiTools()

SUPABASE_DB_PASSWORD = os.environ.get("SUPABASE_DB_PASSWORD")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
SERPAPI_KEY = os.environ.get("SERPAPI_KEY") 
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

# llm = OpenAIChat(id="gpt-4o")
llm = Groq(id="openai/gpt-oss-20b")
# llm = Groq(id="llama-3.1-8b-instant")
# llm = Ollama(id="llama3.1")

class EvalveAgent:
    """Main RAG agent that combines all components"""
    
    def __init__(self):
        # System Prompts
        self.sys_prompt = system_prompt()

        # Initialize core components
        self.db_manager = DatabaseManager(SUPABASE_URL, SUPABASE_KEY)
        self.memory_graph = MemoryGraph()
        self.conversation_memory = ConversationMemory()
        
        # Initialize AI agent
        self.create_agents()

    def create_agents(self):
        self.insights_generator = Agent(
            name="StartupInsightsAnalyst",
            role="Senior Investment Analyst for Indian Startups",
            model=llm,
            description=(
                "You are a senior investment analyst specializing in Indian startup evaluation. "
                "Your goal is to generate comprehensive, data-driven insights about startups to help "
                "investors make informed investment decisions in the Indian market."
            ),
            instructions=[self.sys_prompt.startup_insight],
            add_datetime_to_instructions=True,
            show_tool_calls=False,
            markdown=False
        )

        self.startup_chatbot = Agent(
            name="StartupConsultantChatbot",
            role="Expert Startup Consultant for Interactive Queries",
            model=llm,
            description=(
                "You are an expert startup consultant chatbot with deep knowledge of Indian startups. "
                "You are a helpful, conversational startup consultant. "
                "Greet the user naturally (e.g., 'Hello! Welcome!'), answer casual questions conversationally, "
                "and only provide structured startup analysis if the user specifically asks for it."

                "Your goal is to provide detailed, interactive assistance to investors seeking to "
                "understand specific startups through conversational queries."
            ),
            instructions=[self.sys_prompt.Startup_Knowledge],
            tools=[SerpApiTools(api_key=SERPAPI_KEY,search_youtube=True)],
            add_datetime_to_instructions=True,
            show_tool_calls=False,
            markdown=True
        )
        


    def safe_format(self, value, default="N/A"):
        """Safely format values that might be None"""
        if value is None:
            return default
        return str(value)

    def get_startup_by_name_or_id(self, identifier: str):
        """Get startup data by either company name or startup ID"""
        try:
            print(f"[EvalveAgent] Searching for startup: {identifier}")
            
            # Use the database manager's method
            startup_data = self.db_manager.get_startup_by_name_or_id(identifier)
            
            if startup_data:
                print(f"[EvalveAgent] Found startup: {startup_data.get('company_name')} (ID: {startup_data.get('startup_id')})")
            else:
                print(f"[EvalveAgent] No startup found for: {identifier}")
            
            return startup_data
        except Exception as e:
            print(f"[EvalveAgent] Error getting startup data: {e}")
            return None

    def format_startup_context(self, startup_data: Dict[str, Any]) -> str:
        """Safely format startup context with None value handling"""
        if not startup_data:
            return ""
        
        try:
            # Safe formatting with default values
            company_name = self.safe_format(startup_data.get('company_name'), 'Unknown')
            industry = self.safe_format(startup_data.get('industry_sector'), 'Unknown')
            stage = self.safe_format(startup_data.get('stage'), 'Unknown')
            
            # Handle numeric fields that might be None - convert to int/float with defaults
            monthly_revenue = startup_data.get('monthly_revenue')
            if monthly_revenue is None:
                monthly_revenue = 0
            else:
                try:
                    monthly_revenue = float(monthly_revenue)
                except (ValueError, TypeError):
                    monthly_revenue = 0
            
            funding_required = startup_data.get('funding_amount_required')
            if funding_required is None:
                funding_required = 0
            else:
                try:
                    funding_required = float(funding_required)
                except (ValueError, TypeError):
                    funding_required = 0
            
            team_size = self.safe_format(startup_data.get('team_size'), 'Unknown')
            location_city = self.safe_format(startup_data.get('location_city'), 'Unknown')
            location_state = self.safe_format(startup_data.get('location_state'), 'Unknown')
            problem_statement = self.safe_format(startup_data.get('problem_statement'), 'N/A')
            solution = self.safe_format(startup_data.get('solution_description'), 'N/A')
            target_market = self.safe_format(startup_data.get('target_market'), 'N/A')
            funding_stage = self.safe_format(startup_data.get('funding_stage'), 'Unknown')

            startup_context = f"""
    Startup Information:
    - Company: {company_name}
    - Industry: {industry}
    - Stage: {stage}
    - Monthly Revenue: ${monthly_revenue:,.0f}
    - Funding Required: ${funding_required:,.0f}
    - Team Size: {team_size}
    - Location: {location_city}, {location_state}
    - Problem Statement: {problem_statement}
    - Solution: {solution}
    - Target Market: {target_market}
    - Funding Stage: {funding_stage}
    """
            return startup_context
            
        except Exception as e:
            print(f"Error formatting startup context: {e}")
            # Return a basic context without formatting if there's still an error
            basic_startup_context = f"""
    Startup Information:
    - Company: {startup_data.get('company_name', 'Unknown')}
    - Industry: {startup_data.get('industry_sector', 'Unknown')}
    - Stage: {startup_data.get('stage', 'Unknown')}
    - Monthly Revenue: ${startup_data.get('monthly_revenue', 0)}
    - Funding Required: ${startup_data.get('funding_amount_required', 0)}
    - Team Size: {startup_data.get('team_size', 'Unknown')}
    """
            return basic_startup_context

    # In your evalve/app.py, update the get_startup_insight method:

    def get_startup_insight(self, company_identifier: str, session_id: str = "default", use_web: bool = False):
        """Retrieve Specific Startup Insights by company name or startup ID"""
        try:
            # Get startup data from database (by name or ID)
            startup_data = self.get_startup_by_name_or_id(company_identifier)
            startup_context = ""
            
            if startup_data:
                startup_context = self.format_startup_context(startup_data)
            else:
                startup_context = f"No database record found for: {company_identifier}. Please search for information about this startup online."
            
            # Define query - SIMPLIFIED to avoid tool schema issues
            query = f"""You are an experienced investment analyst. Analyze the startup: {company_identifier}

    Based on the provided startup profile, generate a comprehensive investment analysis in valid JSON format with these exact fields:

    {{
        "executive_summary": "Brief overview of the startup and investment opportunity",
        "key_strengths": ["strength1", "strength2", "strength3"],
        "major_risks": ["risk1", "risk2", "risk3"],
        "market_analysis": "Analysis of market opportunity and competitive landscape",
        "financial_outlook": "Assessment of financial projections and sustainability",
        "investment_recommendation": {{
            "score": 7,
            "stage": "Series A",
            "terms": "Suggested investment terms",
            "milestones": ["milestone1", "milestone2"]
        }},
        "assumptions": ["assumption1", "assumption2"]
    }}

    Startup Context:
    {startup_context}

    Return ONLY valid JSON, no additional text or formatting.
    """
            
            # Get conversation context
            conversation_context = self.conversation_memory.get_context_string()
            relevant_history = self.conversation_memory.get_relevant_history(query)
            
            
            # Get response from simple agent
            response = self.insights_generator.run(query)
            
            # Extract string content from response
            response_content = str(response.content) if hasattr(response, 'content') else str(response)
            
            # Try to parse as JSON
            try:
                # Clean the response content first
                cleaned_content = response_content.strip()
                
                # Remove any markdown formatting if present
                if cleaned_content.startswith('```json'):
                    cleaned_content = cleaned_content.replace('```json', '').replace('```', '').strip()
                elif cleaned_content.startswith('```'):
                    cleaned_content = cleaned_content.replace('```', '').strip()
                
                parsed_response = json.loads(cleaned_content)
            except json.JSONDecodeError as e:
                print(f"JSON parsing error: {e}")
                # Fallback to string response
                parsed_response = {
                    "executive_summary": response_content,
                    "error": "Failed to parse structured response"
                }
            
            # Save conversation
            self.conversation_memory.add_exchange(query, response_content, startup_context, session_id)
            
            return {
                "response": parsed_response,
                # "context": conversation_context
            }
            
        except Exception as e:
            error_msg = f"Error processing startup insight request: {str(e)}"
            print(f"EvalveAgent Error: {error_msg}")
            return {
                "response": {"error": error_msg},
                "context": "",
                "session_id": session_id,
                "company_identifier": company_identifier,
                "error": True
            }

    def get_startup_chatbot(self, query: str, company_identifier: str, session_id: str = "default", use_web: bool = True):
        """Getting Chatbot for Specific Startup by company name or ID"""
        try:
            # Get startup data from database (by name or ID)
            startup_data = self.get_startup_by_name_or_id(company_identifier)
            startup_context = ""
            
            if startup_data:
                startup_context = f"""
You are answering questions about this specific startup:

{self.format_startup_context(startup_data)}

IMPORTANT: Provide conversational, natural responses. Do NOT return JSON or structured data. 
Answer as if you're having a friendly conversation with an investor who wants to learn about this startup.
Be informative but conversational. Use the startup information to provide specific, helpful answers.

"""
            else:
                startup_context = f"""
You are answering questions about: {company_identifier}

Note: No detailed database record found for this startup. Please use web search to find relevant information and provide helpful insights based on available data.

IMPORTANT: Provide conversational, natural responses. Do NOT return JSON or structured data.
Answer as if you're having a friendly conversation with an investor.
"""
            
            # Get conversation context
            conversation_context = self.conversation_memory.get_context_string()
            relevant_history = self.conversation_memory.get_relevant_history(query)
            
            # Enhanced query with startup context
            query_with_context = f"{startup_context}\n\nUser Question: {query}"
            enhanced_query = self._enhance_query_with_context(query_with_context, conversation_context, relevant_history)
            
            # Get response from team
            response = self.startup_chatbot.run(enhanced_query)

            # Extract string content from response
            response_content = str(response.content) if hasattr(response, 'content') else str(response)
                
                
            # Extract context used
            context_used = startup_context
            if hasattr(response, 'tool_calls') and response.tool_calls:
                for tool_call in response.tool_calls:
                    if hasattr(tool_call, 'result'):
                        context_used += str(tool_call.result) + "\n"
            
            # Save conversation
            try:
                self.conversation_memory.add_exchange(query, response_content, startup_context, session_id)
            except Exception as e:
                print(f"[EvalveAgent] Error saving conversation: {e}")
            
            # Update memory graph
            try:
                self._update_memory_graph(query, response_content)
            except Exception as e:
                print(f"[EvalveAgent] Error updating memory graph: {e}")
            
            return response_content
            
        except Exception as e:
            error_msg = f"Error processing chatbot query: {str(e)}"

            print(f"[EvalveAgent] Chatbot error: {error_msg}")
            return f"I apologize, but I'm experiencing technical difficulties right now. However, I can tell you that you're asking about {company_identifier}. Please try asking your question again, or check the startup's detailed profile for more information."
                    
    def _enhance_query_with_context(self, query: str, conversation_context: str, relevant_history: List[Dict]) -> str:
        """Enhance query with conversation context"""
        enhanced_parts = [query]
        
        if conversation_context:
            enhanced_parts.append(f"\nRecent conversation context:\n{conversation_context}")
        
        if relevant_history:
            history_context = "\nRelevant previous discussions:\n"
            for item in relevant_history:
                history_context += f"- {item['query'][:100]}...\n"
            enhanced_parts.append(history_context)
        
        return "\n".join(enhanced_parts)
    
    def _update_memory_graph(self, query: str, response: str):
        """Update memory graph with new information"""
        try:
            # Extract entities and relationships (simplified)
            query_id = f"query_{datetime.now().timestamp()}"
            
            self.memory_graph.add_entity(
                query_id,
                "conversation",
                {
                    "query": query,
                    "response": response[:200],  # Truncate for storage
                    "timestamp": datetime.now().isoformat()
                }
            )
            
        except Exception as e:
            print(f"Error updating memory graph: {e}")

    def get_conversation_history(self, session_id: str, limit: int = 10) -> List[Dict]:
        """Get conversation history"""
        return self.db_manager.get_conversation_history(session_id, limit)
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get system status information"""
        return {
            "database_connected": self.db_manager.is_connected(),
            "entities_in_graph": len(self.memory_graph.entities),
            "relationships_in_graph": len(self.memory_graph.relationships),
            "conversation_history_length": len(self.conversation_memory.history)
        }