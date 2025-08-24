from dotenv import load_dotenv
load_dotenv() 

# Agno imports
from agno.agent import Agent, AgentKnowledge
from agno.models.openai import OpenAIChat
from agno.team.team import Team
from agno.tools.serpapi import SerpApiTools

from system_prompt.prompt import system_prompt

from agno.knowledge.pdf import PDFKnowledgeBase, PDFReader
from agno.knowledge.website import WebsiteKnowledgeBase
from agno.document.base import Document
from agno.vectordb.pgvector import PgVector, SearchType
from agno.document.chunking.agentic import AgenticChunking
from agno.document.chunking.document import DocumentChunking
from agno.tools import Toolkit
from supabase import create_client

from typing import Optional


import os
import json
import re
import requests
import urllib.parse
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path


# SYSTEM PROMPTS
insight_system_prompt = system_prompt.startup_insight
knowledge_system_prompt = system_prompt.Startup_Knowledge

# WEB SCRAPPING TOOL
web_scrapping = SerpApiTools()

SUPABASE_DB_PASSWORD = os.environ.get("SUPABASE_DB_PASSWORD")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
SERPAPI_KEY = os.environ.get("SERPAPI_KEY") 

SUPABASE_URL = "https://gcyjrqgljtizcgekbsgf.supabase.co"

class DatabaseManager:
    """Manages database operations for storing conversations and knowledge"""
    
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
            # TABLE 1 : conversation 
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
    def save_startup_profile(): pass

class ConversationMemory:
    """Manages conversation history and context"""
    
    def __init__(self, db_manager: DatabaseManager = None):
        self.history = []
        self.context_window = 10
        self.db_manager = db_manager
    
    def add_exchange(self, query: str, response: str, context: str = None, session_id: str = None):
        """Add a conversation exchange"""
        exchange = {
            "timestamp": datetime.now().isoformat(),
            "query": query,
            "response": response,
            "context": context
        }
        self.history.append(exchange)
        
        if len(self.history) > self.context_window:
            self.history = self.history[-self.context_window:]
        
        # Save to database if manager is available
        if self.db_manager and self.db_manager.is_connected() and session_id:
            self.db_manager.save_conversation(session_id, query, response, context)
    
    def get_context_string(self, max_exchanges: int = 5) -> str:
        """Get formatted conversation history for context"""
        if not self.history:
            return ""
        
        recent_history = self.history[-max_exchanges:]
        context_parts = []
        
        for exchange in recent_history:
            context_parts.append(f"Human: {exchange['query']}")
            context_parts.append(f"Assistant: {exchange['response'][:200]}...")
        
        return "\n".join(context_parts)
    
    def get_relevant_history(self, current_query: str, max_results: int = 3) -> List[Dict]:
        """Get conversation history relevant to current query"""
        if not self.history:
            return []
        
        # Simple keyword matching for relevance
        query_words = set(current_query.lower().split())
        relevant_exchanges = []
        
        for exchange in self.history:
            exchange_words = set((exchange['query'] + ' ' + exchange['response']).lower().split())
            common_words = query_words.intersection(exchange_words)
            
            if common_words:
                relevance = len(common_words) / len(query_words)
                relevant_exchanges.append({
                    **exchange,
                    'relevance': relevance
                })
        
        # Sort by relevance and return top results
        relevant_exchanges.sort(key=lambda x: x['relevance'], reverse=True)
        return relevant_exchanges[:max_results]
    

class MemoryGraph:
    """Simple in-memory knowledge graph for relationships"""
    
    def __init__(self):
        self.entities = {}
        self.relationships = []
    
    def add_entity(self, entity_id: str, entity_type: str, properties: Dict):
        """Add an entity to the knowledge graph"""
        self.entities[entity_id] = {
            "type": entity_type,
            "properties": properties,
            "created_at": datetime.now().isoformat()
        }
    
    def add_relationship(self, source: str, target: str, relation_type: str, properties: Dict = None):
        """Add a relationship between entities"""
        self.relationships.append({
            "source": source,
            "target": target,
            "type": relation_type,
            "properties": properties or {},
            "created_at": datetime.now().isoformat()
        })
    
    def get_related_entities(self, entity_id: str) -> List[Dict]:
        """Get entities related to a given entity"""
        related = []
        for rel in self.relationships:
            if rel["source"] == entity_id:
                if rel["target"] in self.entities:
                    related.append({
                        "entity": self.entities[rel["target"]],
                        "relationship": rel["type"],
                        "entity_id": rel["target"]
                    })
            elif rel["target"] == entity_id:
                if rel["source"] in self.entities:
                    related.append({
                        "entity": self.entities[rel["source"]],
                        "relationship": rel["type"],
                        "entity_id": rel["source"]
                    })
        return related


class EvalveAgent:

    """Main RAG agent that combines all components"""
    def __init__ (self):

        # System Prompts
        self.insight_prompt = insight_system_prompt
        self.knowledge_prompt = knowledge_system_prompt

        # Initialize core components
        self.db_manager = DatabaseManager(SUPABASE_URL, SUPABASE_KEY)
        self.memory_graph = MemoryGraph()
        self.conversation_memory = ConversationMemory(self.db_manager)
        
        # Initialize tools

        # Initialize AI agent
        self.create_startup_analysis_team()

    def create_agents(self):

        insights_generator = Agent(
            name="StartupInsightsAnalyst",
            role="Senior Investment Analyst for Indian Startups",
            description=(
                "You are a senior investment analyst specializing in Indian startup evaluation. "
                "Your goal is to generate comprehensive, data-driven insights about startups to help "
                "investors make informed investment decisions in the Indian market."
            ),
            instructions=[self.insights_prompt],
            tools=[],  
            add_datetime_to_instructions=True,
            show_tool_calls=True,
            markdown=True
        )


        startup_chatbot = Agent(
            name="StartupConsultantChatbot",
            role="Expert Startup Consultant for Interactive Queries",
            description=(
                "You are an expert startup consultant chatbot with deep knowledge of Indian startups. "
                "Your goal is to provide detailed, interactive assistance to investors seeking to "
                "understand specific startups through conversational queries."
            ),
            instructions=[self.knowledge_prompt],
            tools=[SerpApiTools(search_youtube = True)],
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
            model=OpenAIChat("gpt-4o"),
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
    
  
    def chat(self, query: str, session_id: str = "default", use_web: bool = True) -> Dict[str, Any]:
        """Main chat interface"""
        try:
            # Get conversation context
            conversation_context = self.conversation_memory.get_context_string()
            relevant_history = self.conversation_memory.get_relevant_history(query)
            
            # Enhance query with context
            enhanced_query = self._enhance_query_with_context(query, conversation_context, relevant_history)
            
            # Get response from agent
            response = self.startup_analysis_team.run(enhanced_query)
            
            # Extract string content from response
            response_content = str(response.content) if hasattr(response, 'content') else str(response)
                        
            # Extract context used
            context_used = ""
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
            }
            
        except Exception as e:
            error_msg = f"Error processing query: {str(e)}"
            return {
                "response": error_msg,
                "context": "",
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "sources_used": []
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
    


 
    


 


# editor.print_response("Write an article about latest developments in AI.")