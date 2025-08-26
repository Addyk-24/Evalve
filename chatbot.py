import streamlit as st
import os
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional
import json
import uuid

# Add your project paths
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Import your EvalveAgent from evalve folder with detailed error handling
AGENT_AVAILABLE = False
import_error_msg = ""

try:
    from evalve.app import EvalveAgent
    AGENT_AVAILABLE = True
    st.success("✅ EvalveAgent imported successfully from evalve/app.py")
except ImportError as e:
    import_error_msg = str(e)
    st.error(f"Could not import EvalveAgent from evalve/app.py: {e}")
    
    # Check if the file exists
    evalve_path = os.path.join(current_dir, "evalve", "app.py")
    if not os.path.exists(evalve_path):
        st.error(f"**File not found:** {evalve_path}")
        st.info("Please make sure the file structure is:")
        st
    
    # Provide specific guidance for common issues
    if "pypdf" in str(e):
        st.error("**Missing pypdf package!**")
        st.code("pip install pypdf", language="bash")
    elif "agno" in str(e):
        st.error("**Missing agno framework!**")
        st.code("pip install agno", language="bash")
    elif "supabase" in str(e):
        st.error("**Missing supabase client!**")
        st.code("pip install supabase", language="bash")
    elif "serpapi" in str(e):
        st.error("**Missing serpapi package!**")
        st.code("pip install google-search-results", language="bash")
    elif "No module named 'evalve'" in str(e):
        st.error("**Cannot find evalve folder!**")
        st.info("Make sure evalve/app.py exists in your project directory")
    
    st.info("**Install all requirements at once:**")
    st.code("pip install pypdf agno openai supabase python-dotenv streamlit google-search-results groq", language="bash")
    
    st.warning("Please fix the import issues and restart the application.")

# Configure Streamlit page
st.set_page_config(
    page_title="Startup Investment Assistant",
    page_icon="🚀",
    layout="wide"
)

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []

if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())

if "agent" not in st.session_state and AGENT_AVAILABLE:
    with st.spinner("Initializing AI Agent..."):
        try:
            st.session_state.agent = EvalveAgent().get_startup_insight
            # st.session_state.agent = EvalveAgent().get_startup_chatbot
            st.success("✅ AI Agent initialized successfully!")
        except Exception as e:
            st.error(f"❌ Failed to initialize agent: {str(e)}")
            st.session_state.agent = None

def main():
    st.title("🚀 Startup Investment Assistant")
    st.subheader("AI-Powered Startup Analysis & Consultation")
    
    if not AGENT_AVAILABLE:
        st.error("Agent not available. Please check your setup.")
        return
    
    # Sidebar with system info
    with st.sidebar:
        st.header("System Status")
        
        if st.session_state.get("agent"):
            try:
                status = st.session_state.agent.get_system_status()
                st.write("**Database:** ", "✅ Connected" if status.get("database_connected") else "❌ Disconnected")
                st.write("**Memory Graph Entities:** ", status.get("entities_in_graph", 0))
                st.write("**Memory Graph Relations:** ", status.get("relationships_in_graph", 0))
                st.write("**Conversation History:** ", status.get("conversation_history_length", 0))
            except Exception as e:
                st.write("**Status:** ", f"Error: {str(e)}")
        else:
            st.write("**Agent:** ", "❌ Not initialized")
        
        st.divider()
        
        st.header("Sample Queries")
        sample_queries = [
            "List all available startups",
            "Search for fintech startups",
            "Tell me about startup ABC123",
            "Find similar startups to XYZ789",
            "What are the funding requirements for startup DEF456?",
            "Analyze the investment potential of startup GHI789"
        ]
        
        for query in sample_queries:
            if st.button(query, key=f"sample_{query[:10]}"):
                st.session_state.sample_query = query
        
        st.divider()
        
        if st.button("Clear Chat History"):
            st.session_state.messages = []
            st.rerun()
        
        if st.button("New Session"):
            st.session_state.messages = []
            st.session_state.session_id = str(uuid.uuid4())
            st.rerun()
    
    # Main chat interface
    st.write("**Session ID:**", st.session_state.session_id[:8])
    
    # Display chat messages
    chat_container = st.container()
    
    with chat_container:
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.write(message["content"])
                
                # Show additional info for assistant messages
                if message["role"] == "assistant" and "metadata" in message:
                    with st.expander("Additional Information"):
                        metadata = message["metadata"]
                        if metadata.get("context"):
                            st.write("**Context Used:**")
                            st.text(metadata["context"][:500] + "..." if len(metadata["context"]) > 500 else metadata["context"])
                        
                        if metadata.get("timestamp"):
                            st.write("**Timestamp:**", metadata["timestamp"])
    
    # Handle sample query from sidebar
    if hasattr(st.session_state, 'sample_query'):
        user_input = st.session_state.sample_query
        delattr(st.session_state, 'sample_query')
        process_message(user_input)
    
    # Chat input
    if prompt := st.chat_input("Ask me anything about startups..."):
        process_message(prompt)

def process_message(user_input: str):
    """Process user message and get agent response"""
    
    # Add user message to chat history
    st.session_state.messages.append({"role": "user", "content": user_input})
    
    # Display user message immediately
    with st.chat_message("user"):
        st.write(user_input)
    
    # Get agent response
    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            try:
                if st.session_state.get("agent"):
                    response_data = st.session_state.agent.chat(
                        query=user_input,
                        session_id=st.session_state.session_id,
                        use_web=True
                    )
                    
                    response_content = response_data.get("response", "No response generated")
                    context = response_data.get("context", "")
                    timestamp = response_data.get("timestamp", "")
                    
                    # Display the response
                    st.write(response_content)
                    
                    # Add to message history with metadata
                    st.session_state.messages.append({
                        "role": "assistant", 
                        "content": response_content,
                        "metadata": {
                            "context": context,
                            "timestamp": timestamp
                        }
                    })
                    
                else:
                    error_msg = "❌ Agent not available. Please refresh the page."
                    st.error(error_msg)
                    st.session_state.messages.append({"role": "assistant", "content": error_msg})
                    
            except Exception as e:
                error_msg = f"❌ Error: {str(e)}"
                st.error(error_msg)
                st.session_state.messages.append({"role": "assistant", "content": error_msg})

# Additional features
def show_agent_capabilities():
    """Show what the agent can do"""
    st.header("🤖 Agent Capabilities")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("📊 Startup Analysis")
        st.write("• Generate comprehensive investment insights")
        st.write("• Analyze market opportunities")
        st.write("• Evaluate funding requirements")
        st.write("• Assess competitive landscape")
        
        st.subheader("🔍 Search & Discovery")
        st.write("• Search startups by industry/stage")
        st.write("• Find similar companies")
        st.write("• Discover investment opportunities")
        st.write("• Filter by various criteria")
    
    with col2:
        st.subheader("💬 Interactive Consultation")
        st.write("• Answer specific investor questions")
        st.write("• Provide detailed startup information")
        st.write("• Offer market insights")
        st.write("• Give investment recommendations")
        
        st.subheader("🧠 Smart Features")
        st.write("• Memory of conversation context")
        st.write("• Web search for latest information")
        st.write("• Relationship mapping")
        st.write("• Real-time data analysis")

# Advanced features section
def show_debug_info():
    """Show debug information"""
    if st.checkbox("Show Debug Info"):
        st.subheader("🔧 Debug Information")
        
        if st.session_state.get("agent"):
            # Show recent conversation
            st.write("**Recent Conversation:**")
            for msg in st.session_state.messages[-5:]:
                st.write(f"**{msg['role'].title()}:** {msg['content'][:100]}...")
            
            # Show system status
            st.write("**System Status:**")
            try:
                status = st.session_state.agent.get_system_status()
                st.json(status)
            except Exception as e:
                st.error(f"Error getting status: {e}")
        
        # Environment variables (safely)
        st.write("**Environment Check:**")
        env_vars = ["SUPABASE_URL", "SUPABASE_KEY", "GROQ_API_KEY", "SERPAPI_KEY"]
        for var in env_vars:
            value = os.environ.get(var)
            st.write(f"**{var}:** {'✅ Set' if value else '❌ Missing'}")

if __name__ == "__main__":
    # Main app
    main()
    
    # Additional sections
    st.divider()
    
    # Show capabilities in an expander
    with st.expander("🤖 What can this agent do?"):
        show_agent_capabilities()
    
    # Debug info
    show_debug_info()
    
    # Footer
    st.divider()
    st.caption("Startup Investment Assistant | Powered by AI")
    st.caption(f"Built with Streamlit | Session: {st.session_state.session_id[:8]}")
