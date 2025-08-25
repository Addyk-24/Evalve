from database import DatabaseManager
import datetime

from typing import List, Dict, Any, Optional


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