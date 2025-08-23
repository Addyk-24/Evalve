from dotenv import load_dotenv
load_dotenv() 

# Agno imports
from agno.agent import Agent, AgentKnowledge
from agno.models.openai import OpenAIChat
from agno.team.team import Team

from .system_prompt import system_prompt

from agno.knowledge.pdf import PDFKnowledgeBase, PDFReader
from agno.knowledge.website import WebsiteKnowledgeBase
from agno.document.base import Document
from agno.vectordb.pgvector import PgVector, SearchType
from agno.document.chunking.agentic import AgenticChunking
from agno.document.chunking.document import DocumentChunking
from agno.tools import Toolkit
from supabase import create_client



import os
import fitz
import json
import re
import requests
import urllib.parse
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path
import numpy as np
from bs4 import BeautifulSoup

# SYSTEM PROMPTS
insight_system_prompt = system_prompt.startup_insight
knowledge_system_prompt = system_prompt.Startup_Knowledge

SUPABASE_DB_PASSWORD = os.environ.get("SUPABASE_DB_PASSWORD")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
SERPAPI_KEY = os.environ.get("SERPAPI_KEY") 

SUPABASE_URL = "https://wasxdjhtnmxyatwbwttj.supabase.co"

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


class Evalve:

    """Main RAG agent that combines all components"""
    def __init__ (self):
        self.insight_prompt = insight_system_prompt
        # Initialize core components
        self.db_manager = DatabaseManager(SUPABASE_URL, SUPABASE_KEY)
        # self.memory_graph = MemoryGraph()
        self.conversation_memory = ConversationMemory(self.db_manager)
        
        # Initialize tools
        # self.web_search = WebSearchTool()
        # self.document_embedder = DocumentEmbedder(self.memory_graph, self.db_manager)
        # self.hybrid_retriever = HybridRetriever(self.memory_graph, self.document_embedder, self.web_search)
        
        # Initialize AI agent
    def main_agent(self):
        writer = Agent(
            name="Writer",
            role="Writes a high-quality article",
            description=(
                "You are a senior writer for the New York Times. Given a topic and a list of URLs, "
                "your goal is to write a high-quality NYT-worthy article on the topic."
            ),
            instructions=[self.insight_prompt],
            tools=[],
            add_datetime_to_instructions=True,
            # tools=[self.document_embedder, self.hybrid_retriever, self.web_search],
            instructions=self._get_agent_instructions(),
            show_tool_calls=False,
            markdown=False
        )

        self.agent = Team(
            name="Editor",
            mode="coordinate",
            model=OpenAIChat("gpt-4o"),
            # model=llm,
            members=[writer],
            description="You are a senior NYT editor. Given a topic, your goal is to write a NYT worthy article.",
            instructions=[
                "First ask the search journalist to search for the most relevant URLs for that topic.",
                "Then ask the writer to get an engaging draft of the article.",
                "Edit, proofread, and refine the article to ensure it meets the high standards of the New York Times.",
                "The article should be extremely articulate and well written. "
                "Focus on clarity, coherence, and overall quality.",
                "Remember: you are the final gatekeeper before the article is published, so make sure the article is perfect.",
            ],
            add_datetime_to_instructions=True,
            add_member_tools_to_system_message=False,  # This can be tried to make the agent more consistently get the transfer tool call correct
            enable_agentic_context=True,  # Allow the agent to maintain a shared context and send that to members.
            share_member_interactions=True,  # Share all member responses with subsequent member requests.
            show_members_responses=True,
            markdown=True,

        )

        
    def _get_agent_instructions(self) -> str:

        """Get comprehensive instructions for the AI agent"""
        return """
        You are MemoryPal, an advanced AI assistant with access to documents, web search, and conversation memory.
        
        CORE CAPABILITIES:
        1. Document Processing: Analyze PDFs, text files, and other documents
        2. Web Search: Access current information from the internet
        3. Memory Management: Remember conversations and build knowledge relationships
        4. Hybrid Retrieval: Combine document knowledge with web information
        
        RESPONSE GUIDELINES:
        1. Always search for relevant information before answering complex questions
        2. Clearly distinguish between document-based and web-based information
        3. Provide source citations for all information
        4. Synthesize information from multiple sources when available
        5. Ask clarifying questions when the query is ambiguous
        6. Be conversational but informative
        
        TOOL USAGE:
        - Use embed_documents to process new documents
        - Use hybrid_search for comprehensive information retrieval
        - Use web_search for current events or when documents lack information
        
        MEMORY INTEGRATION:
        - Remember key facts and relationships from conversations
        - Build connections between different pieces of information
        - Refer to previous conversations when relevant
        
        Always strive to provide accurate, helpful, and well-sourced responses.
        """
    
    def chat(self, query: str, session_id: str = "default", use_web: bool = True) -> Dict[str, Any]:
        """Main chat interface"""
        try:
            # Get conversation context
            conversation_context = self.conversation_memory.get_context_string()
            relevant_history = self.conversation_memory.get_relevant_history(query)
            
            # Enhance query with context
            enhanced_query = self._enhance_query_with_context(query, conversation_context, relevant_history)
            
            # Get response from agent
            response = self.agent.run(enhanced_query)
            
            # Clean and format response
            clean_response = self.formatter.clean_response(str(response.content))
            
            # Extract context used
            context_used = ""
            if hasattr(response, 'tool_calls') and response.tool_calls:
                for tool_call in response.tool_calls:
                    if hasattr(tool_call, 'result'):
                        context_used += str(tool_call.result) + "\n"
            
            # Save conversation
            self.conversation_memory.add_exchange(query, clean_response, context_used, session_id)
            
            # Update memory graph
            self._update_memory_graph(query, clean_response)
            
            return {
                "response": clean_response,
                "context": self.formatter.format_context(context_used),
                "session_id": session_id,
                "timestamp": datetime.now().isoformat(),
                "sources_used": self._extract_sources(context_used)
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

 


# editor.print_response("Write an article about latest developments in AI.")