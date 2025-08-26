from database import DatabaseManager
from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid
import json
from dataclasses import dataclass

@dataclass
class ConversationRecord:
    session_id: str
    user_query: str
    agent_response: str
    startup_id: str = None
    user_id: str = None
    context_used: str = ""
    query_intent: str = ""
    agent_type: str = "chatbot"  # "chatbot" or "insights"

class ConversationMemory:
    """Enhanced conversation memory management for AI agents"""
    
    def __init__(self, session_id: str = None):
        self.history = []
        self.context_window = 15 
        self.db_manager = DatabaseManager()
        self.session_id = session_id or self._generate_session_id()
        self.current_startup_id = None
        self.conversation_metadata = {
            "started_at": datetime.now().isoformat(),
            "total_exchanges": 0,
            "startup_focused": False
        }
    
    def _generate_session_id(self) -> str:
        """Generate unique session ID"""
        return f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
    
    def set_startup_context(self, startup_id: str):
        """Set the current startup being discussed"""
        self.current_startup_id = startup_id
        self.conversation_metadata["startup_focused"] = True
        print(f"📍 Conversation context set to startup: {startup_id}")
    
    def add_exchange(self, 
                    query: str, 
                    response: str, 
                    context: str = None,
                    agent_type: str = "chatbot",
                    query_intent: str = "",
                    user_id: str = None) -> bool:
        """Add a conversation exchange with enhanced metadata"""
        
        if not query.strip() or not response.strip():
            print("Empty query or response, skipping...")
            return False
        
        try:
            exchange = {
                "id": str(uuid.uuid4()),
                "timestamp": datetime.now().isoformat(),
                "query": query.strip(),
                "response": response.strip(),
                "context": context or "",
                "agent_type": agent_type,
                "query_intent": query_intent,
                "startup_id": self.current_startup_id,
                "user_id": user_id,
                "session_id": self.session_id
            }
            
            self.history.append(exchange)
            self.conversation_metadata["total_exchanges"] += 1
            
            # Maintain sliding window
            if len(self.history) > self.context_window:
                self.history = self.history[-self.context_window:]
            
            # Save to database if available
            if self.db_manager and self.db_manager.is_connected():
                conversation_record = ConversationRecord(
                    session_id=self.session_id,
                    user_query=query,
                    agent_response=response,
                    startup_id=self.current_startup_id,
                    user_id=user_id,
                    context_used=context or "",
                    query_intent=query_intent,
                    agent_type=agent_type
                )
                
                success = self.db_manager.save_conversation_with_context(conversation_record)
                if success:
                    print(f"Conversation saved to database")
                else:
                    print("Failed to save conversation to database")
            
            return True
            
        except Exception as e:
            print(f"❌ Error adding exchange: {str(e)}")
            return False
    def get_context_string(self, max_exchanges: int = 5, include_metadata: bool = True) -> str:
        """Get formatted conversation history for AI context"""
        if not self.history:
            return "No previous conversation history."
        
        recent_history = self.history[-max_exchanges:]
        context_parts = []
        
        # Add metadata if requested
        if include_metadata and self.current_startup_id:
            context_parts.append(f"[CONTEXT: Currently discussing startup {self.current_startup_id}]")
        
        for exchange in recent_history:
            # Truncate long responses for context efficiency
            response_preview = exchange['response'][:300] + "..." if len(exchange['response']) > 300 else exchange['response']
            
            context_parts.extend([
                f"Human: {exchange['query']}",
                f"Assistant: {response_preview}",
                "---"
            ])
        
        return "\n".join(context_parts)
    
    def get_startup_specific_context(self, startup_id: str = None, max_exchanges: int = 5) -> str:
        """Get conversation history specific to a startup"""
        target_startup = startup_id or self.current_startup_id
        if not target_startup:
            return self.get_context_string(max_exchanges)
        
        # Filter history for specific startup
        startup_history = [
            exchange for exchange in self.history 
            if exchange.get('startup_id') == target_startup
        ]
        
        if not startup_history:
            return f"No previous conversations about startup {target_startup}."
        
        recent_startup_history = startup_history[-max_exchanges:]
        context_parts = [f"[Previous conversations about startup {target_startup}:]"]
        
        for exchange in recent_startup_history:
            response_preview = exchange['response'][:200] + "..." if len(exchange['response']) > 200 else exchange['response']
            context_parts.extend([
                f"Q: {exchange['query']}",
                f"A: {response_preview}",
                "---"
            ])
        
        return "\n".join(context_parts)
    
    def get_relevant_history(self,current_query: str,max_results: int = 3,min_relevance: float = 0.1) -> List[Dict]:
        """Enhanced relevance matching with better scoring"""
        if not self.history:
            return []
        
        query_words = set(current_query.lower().split())
        query_words = {word for word in query_words if len(word) > 2}  # Filter short words
        
        if not query_words:
            return []
        
        relevant_exchanges = []
        
        for exchange in self.history:
            # Combine query and response for matching
            exchange_text = f"{exchange['query']} {exchange['response']}"
            exchange_words = set(exchange_text.lower().split())
            exchange_words = {word for word in exchange_words if len(word) > 2}
            
            if not exchange_words:
                continue
            
            # Calculate relevance scores
            common_words = query_words.intersection(exchange_words)
            
            if common_words:
                word_overlap = len(common_words) / len(query_words)
                text_similarity = len(common_words) / len(exchange_words.union(query_words))
                
                # Boost score if same startup 
                startup_boost = 1.5 if (exchange.get('startup_id') == self.current_startup_id and self.current_startup_id) else 1.0
                
                # Recent conversations get slight boost
                time_boost = 1.2 if self.history.index(exchange) >= len(self.history) - 5 else 1.0
                
                relevance_score = (word_overlap * 0.6 + text_similarity * 0.4) * startup_boost * time_boost
                
                if relevance_score >= min_relevance:
                    relevant_exchanges.append({
                        **exchange,
                        'relevance_score': relevance_score,
                        'common_words': list(common_words)
                    })
        
        # Sort by relevance and return top results
        relevant_exchanges.sort(key=lambda x: x['relevance_score'], reverse=True)
        return relevant_exchanges[:max_results]
    
    def get_conversation_summary(self) -> Dict[str, Any]:
        """Get conversation statistics and summary"""
        if not self.history:
            return {"status": "No conversation history"}
        
        # Calculate basic stats
        total_exchanges = len(self.history)
        query_intents = {}
        agent_types = {}
        startup_discussions = set()
        
        for exchange in self.history:
            intent = exchange.get('query_intent', 'unknown')
            agent_type = exchange.get('agent_type', 'chatbot')
            startup_id = exchange.get('startup_id')
            
            query_intents[intent] = query_intents.get(intent, 0) + 1
            agent_types[agent_type] = agent_types.get(agent_type, 0) + 1
            
            if startup_id:
                startup_discussions.add(startup_id)
        
        return {
            "session_id": self.session_id,
            "total_exchanges": total_exchanges,
            "startups_discussed": len(startup_discussions),
            "startup_ids": list(startup_discussions),
            "query_intents": query_intents,
            "agent_types": agent_types,
            "started_at": self.conversation_metadata.get("started_at"),
            "current_startup": self.current_startup_id,
            "duration_minutes": self._calculate_duration()
        }
    
    def _calculate_duration(self) -> float:
        """Calculate conversation duration in minutes"""
        if not self.history:
            return 0.0
        
        try:
            start_time = datetime.fromisoformat(self.conversation_metadata["started_at"])
            latest_time = datetime.fromisoformat(self.history[-1]["timestamp"])
            duration = (latest_time - start_time).total_seconds() / 60
            return round(duration, 2)
        except:
            return 0.0
    
    def load_history_from_db(self, limit: int = None) -> bool:
        """Load conversation history from database"""
        if not self.db_manager or not self.db_manager.is_connected():
            print("⚠️ Database not available for loading history")
            return False
        
        try:
            db_history = self.db_manager.get_conversation_history(
                self.session_id, 
                limit or self.context_window
            )
            
            if db_history:
                # Convert database records to memory format
                for record in reversed(db_history):  # Reverse to maintain chronological order
                    exchange = {
                        "id": record.get('id', str(uuid.uuid4())),
                        "timestamp": record.get('timestamp'),
                        "query": record.get('query', ''),
                        "response": record.get('response', ''),
                        "context": record.get('context', ''),
                        "agent_type": record.get('agent_type', 'chatbot'),
                        "query_intent": record.get('query_intent', ''),
                        "startup_id": record.get('startup_id'),
                        "user_id": record.get('user_id'),
                        "session_id": record.get('session_id')
                    }
                    
                    if exchange not in self.history:  # Avoid duplicates
                        self.history.append(exchange)
                
                # Update current startup context if found
                startup_ids = [h.get('startup_id') for h in self.history if h.get('startup_id')]
                if startup_ids:
                    self.current_startup_id = startup_ids[-1]  # Use most recent
                
                print(f"📚 Loaded {len(db_history)} conversation records from database")
                return True
            
            return False
            
        except Exception as e:
            print(f"❌ Error loading conversation history: {str(e)}")
            return False
    
    def clear_history(self, keep_last: int = 0):
        """Clear conversation history, optionally keeping recent exchanges"""
        if keep_last > 0:
            self.history = self.history[-keep_last:]
        else:
            self.history = []
        
        self.conversation_metadata["total_exchanges"] = len(self.history)
        print(f"🧹 Conversation history cleared, kept {len(self.history)} recent exchanges")
    
    def export_conversation(self, format: str = "json") -> str:
        """Export conversation history"""
        export_data = {
            "session_info": self.get_conversation_summary(),
            "conversation_history": self.history
        }
        
        if format.lower() == "json":
            return json.dumps(export_data, indent=2, ensure_ascii=False)
        elif format.lower() == "text":
            lines = [f"Conversation Export - Session: {self.session_id}"]
            lines.append(f"Generated: {datetime.now().isoformat()}")
            lines.append("-" * 50)
            
            for exchange in self.history:
                lines.append(f"\n[{exchange['timestamp']}]")
                lines.append(f"Human: {exchange['query']}")
                lines.append(f"Assistant: {exchange['response']}")
                if exchange.get('startup_id'):
                    lines.append(f"Context: Startup {exchange['startup_id']}")
            
            return "\n".join(lines)
        
        return str(export_data)

# Usage example and factory function
def create_conversation_memory(db_manager: DatabaseManager = None, 
                             session_id: str = None,
                             load_existing: bool = True) -> ConversationMemory:
    """Factory function to create conversation memory with proper setup"""
    memory = ConversationMemory(db_manager, session_id)
    
    if load_existing and db_manager:
        memory.load_history_from_db()
    
    return memory