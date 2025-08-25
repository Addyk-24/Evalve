from dotenv import load_dotenv
load_dotenv() 

# Agno imports
from agno.agent import Agent, AgentKnowledge
from agno.models.openai import OpenAIChat
from agno.team.team import Team
from agno.tools.serpapi import SerpApiTools

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
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
SERPAPI_KEY = os.environ.get("SERPAPI_KEY") 

SUPABASE_URL = "https://gcyjrqgljtizcgekbsgf.supabase.co"

    




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