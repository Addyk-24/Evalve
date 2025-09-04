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
        self.create_startup_analysis_team()

    def create_agents(self):
        insights_generator = Agent(
            name="StartupInsightsAnalyst",
            role="Senior Investment Analyst for Indian Startups",
            model=llm,
            description=(
                "You are a senior investment analyst specializing in Indian startup evaluation. "
                "Your goal is to generate comprehensive, data-driven insights about startups to help "
                "investors make informed investment decisions in the Indian market."
            ),
            instructions=[self.sys_prompt.startup_insight],
            tools=[],  
            add_datetime_to_instructions=True,
            show_tool_calls=True,
            markdown=True
        )

        startup_chatbot = Agent(
            name="StartupConsultantChatbot",
            role="Expert Startup Consultant for Interactive Queries",
            model=llm,
            description=(
                "You are an expert startup consultant chatbot with deep knowledge of Indian startups. "
                "Your goal is to provide detailed, interactive assistance to investors seeking to "
                "understand specific startups through conversational queries."
            ),
            instructions=[self.sys_prompt.Startup_Knowledge],
            tools=[SerpApiTools(search_youtube=True)],
            add_datetime_to_instructions=True,
            show_tool_calls=False,
            markdown=True
        )
        
        return insights_generator, startup_chatbot

    def create_startup_analysis_team(self):
        insights_generator, startup_chatbot = self.create_agents()
        
        self.startup_analysis_team = Team(
            name="StartupAnalysisTeam",
            mode="coordinate",
            model=llm,
            members=[insights_generator, startup_chatbot],
            description=(
                "You are a senior startup analysis team specializing in Indian startup evaluation. "
                "Your goal is to provide comprehensive startup analysis and interactive investor support."
            ),
            instructions=[
                "First, have the StartupInsightsAnalyst generate comprehensive investment insights for the startup.",
                "Then, be ready to have the StartupConsultantChatbot answer any specific investor questions about the startup.",
                "Ensure both agents work together to provide complete, accurate, and actionable information.",
                "Focus on Indian market dynamics, opportunities, and challenges.",
                "Maintain consistency between insights and chatbot responses.",
                "Provide both high-level strategic analysis and detailed operational information as needed.",
                "Remember: Your analysis directly impacts investment decisions in the Indian startup ecosystem."
            ],
            add_datetime_to_instructions=True,
            add_member_tools_to_system_message=False,
            enable_agentic_context=True,
            share_member_interactions=True,
            show_members_responses=True,
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

    def get_startup_insight(self, company_identifier: str, session_id: str = "default", use_web: bool = False):
        """Retrieve Specific Startup Insights by company name or startup ID"""
        try:
            # Define query first
            query = f"""Generate investment insights and analysis about startup/company: {company_identifier} and
        
        You are an experienced investment analyst. Based strictly on the given startup profile, 
        generate a structured investment analysis including:
        - Executive Summary
        - Key Strengths
        - Major Risks
        - Market Analysis
        - Financial Outlook
        - Investment Recommendation (with score 1-10)
        
        Return ONLY valid JSON, no explanations, no markdown.
        

        Do NOT refuse or say you cannot verify. If information is missing, make 
        reasonable assumptions and clearly label them as assumptions.
            
            """
            
            # Get startup data from database (by name or ID)
            startup_data = self.get_startup_by_name_or_id(company_identifier)
            startup_context = ""
            
            if startup_data:
                startup_context = self.format_startup_context(startup_data)
                query += f"\n\nStartup Data:\n{startup_context}"
            else:
                # If no data found in DB, still provide the identifier for web search
                startup_context = f"No database record found for: {company_identifier}. Please search for information about this startup online."
                query += f"\n\nNote: {startup_context}"
            
            # Get conversation context
            conversation_context = self.conversation_memory.get_context_string()
            relevant_history = self.conversation_memory.get_relevant_history(query)
            
            # Enhance query with context
            enhanced_query = self._enhance_query_with_context(query, conversation_context, relevant_history)
            
            # Get response from team
            response = self.startup_analysis_team.run(enhanced_query)
            
            # Extract string content from response
            response_content = str(response.content) if hasattr(response, 'content') else str(response)

            try:
                parsed_response = json.loads(response_content)
            except Exception:
                parsed_response = {"raw_response": response_content}
            # Extract context used
            context_used = startup_context
            if hasattr(response, 'tool_calls') and response.tool_calls:
                for tool_call in response.tool_calls:
                    if hasattr(tool_call, 'result'):
                        context_used += str(tool_call.result) + "\n"
            
            # Save conversation
            self.conversation_memory.add_exchange(query, response_content, context_used, session_id)
            
            # Update memory graph
            self._update_memory_graph(query, response_content)
            
            return {
                # "response": response_content,
                "response": parsed_response,
                "context": context_used,
                # "session_id": session_id,
                # "timestamp": datetime.now().isoformat(),
                # "company_identifier": company_identifier,
                # "found_in_db": startup_data is not None
            }
            
        except Exception as e:
            error_msg = f"Error processing startup insight request: {str(e)}"
            return {
                "response": error_msg,
                "context": "",
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
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
"""
            else:
                startup_context = f"""
You are answering questions about: {company_identifier}

Note: No detailed database record found for this startup. Please use web search to find relevant information and provide helpful insights based on available data.
"""
            
            # Get conversation context
            conversation_context = self.conversation_memory.get_context_string()
            relevant_history = self.conversation_memory.get_relevant_history(query)
            
            # Enhanced query with startup context
            query_with_context = f"{startup_context}\n\nUser Question: {query}"
            enhanced_query = self._enhance_query_with_context(query_with_context, conversation_context, relevant_history)
            
            # Get response from team
            response = self.startup_analysis_team.run(enhanced_query)

            # Extract string content from response
            response_content = str(response.content) if hasattr(response, 'content') else str(response)
                
            # Extract context used
            context_used = startup_context
            if hasattr(response, 'tool_calls') and response.tool_calls:
                for tool_call in response.tool_calls:
                    if hasattr(tool_call, 'result'):
                        context_used += str(tool_call.result) + "\n"
            
            # Save conversation
            self.conversation_memory.add_exchange(query, response_content, context_used, session_id)
            
            # Update memory graph
            self._update_memory_graph(query, response_content)
            
            return {
                "response": response_content,
                "context": context_used,
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "company_identifier": company_identifier,
                "found_in_db": startup_data is not None
            }
            
        except Exception as e:
            error_msg = f"Error processing chatbot query: {str(e)}"
            return {
                "response": error_msg,
                "context": "",
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "company_identifier": company_identifier,
                "error": True
            }
                    
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