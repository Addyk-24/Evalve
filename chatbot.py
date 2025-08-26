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

# Import your fixed EvalveAgent
AGENT_AVAILABLE = False
import_error_msg = ""

try:
    from evalve.app import EvalveAgent
    AGENT_AVAILABLE = True
    st.success("EvalveAgent imported successfully from evalve/app.py")
except ImportError as e:
    import_error_msg = str(e)
    st.error(f"Could not import EvalveAgent: {e}")
    
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
    elif "No module named 'evalve'" in str(e):
        st.error("**Cannot find evalve folder!**")
        st.info("Make sure evalve/app.py exists in your project directory")
    
    st.warning("Please fix the import issues and restart the application.")
    AGENT_AVAILABLE = False

# Configure Streamlit page
st.set_page_config(
    page_title="Startup Analysis Testing",
    page_icon="🚀",
    layout="wide"
)

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []

if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())

if "agent" not in st.session_state and AGENT_AVAILABLE:
    with st.spinner("Initializing EvalveAgent..."):
        try:
            st.session_state.agent = EvalveAgent()
            st.success("EvalveAgent initialized successfully!")
        except Exception as e:
            st.error(f"Failed to initialize agent: {str(e)}")
            st.session_state.agent = None

def main():
    st.title("🚀 Startup Analysis Testing Platform")
    st.subheader("Test Startup Insights & Chatbot Functions")
    
    if not AGENT_AVAILABLE:
        st.error("Agent not available. Please check your setup.")
        return
    
    # Main interface with tabs
    tab1, tab2, tab3 = st.tabs(["💡 Startup Insights", "💬 Startup Chatbot", "📊 System Status"])
    
    with tab1:
        test_startup_insights()
    
    with tab2:
        test_startup_chatbot()
    
    with tab3:
        show_system_status()

def test_startup_insights():
    """Test the startup insights functionality"""
    st.header("📈 Startup Investment Insights Generator")
    st.write("Generate comprehensive investment analysis for any startup")
    
    # Input section
    col1, col2 = st.columns([2, 1])
    
    with col1:
        company_identifier = st.text_input(
            "Enter Company Name or Startup ID:",
            placeholder="e.g., Zomato, Flipkart, or STARTUP_ABC123",
            help="Enter either the company name or startup ID you want to analyze"
        )
    
    with col2:
        use_web = st.checkbox("Use Web Search", value=True)
        session_id = st.text_input("Session ID (optional)", value=st.session_state.session_id[:8])
    
    # Generate insights button
    if st.button("🔍 Generate Investment Insights", type="primary"):
        if not company_identifier.strip():
            st.error("Please enter a company name or startup ID")
            return
            
        if not st.session_state.get("agent"):
            st.error("Agent not initialized")
            return
        
        with st.spinner("Generating comprehensive startup insights..."):
            try:
                # Call the insights function
                result = st.session_state.agent.get_startup_insight(
                    company_identifier=company_identifier.strip(),
                    session_id=session_id or st.session_state.session_id,
                    use_web=use_web
                )
                
                # Display results
                if result.get("error"):
                    st.error("Error generating insights:")
                    st.error(result["response"])
                else:
                    st.success("✅ Investment insights generated successfully!")
                    
                    # Show if found in database
                    if result.get("found_in_db"):
                        st.info("📊 Data found in database and used for analysis")
                    else:
                        st.warning("⚠️ No database record found. Analysis based on web search and general knowledge.")
                    
                    # Main response
                    st.markdown("### 📊 Investment Analysis")
                    st.markdown(result["response"])
                    
                    # Additional info in expandable sections
                    with st.expander("📋 Response Details"):
                        col1, col2 = st.columns(2)
                        
                        with col1:
                            st.write("**Timestamp:**", result["timestamp"])
                            st.write("**Session ID:**", result["session_id"])
                            st.write("**Company/ID:**", result["company_identifier"])
                            st.write("**Found in DB:**", "Yes" if result.get("found_in_db") else "No")
                        
                        with col2:
                            if result.get("context"):
                                st.write("**Context Used:**")
                                st.text_area("", result["context"], height=100, disabled=True)
                    
                    # Add to message history for tracking
                    st.session_state.messages.append({
                        "type": "insight",
                        "company_identifier": company_identifier,
                        "response": result["response"],
                        "timestamp": result["timestamp"],
                        "found_in_db": result.get("found_in_db", False)
                    })
                    
            except Exception as e:
                st.error(f"Error: {str(e)}")
    
    # Show recent insights
    st.divider()
    recent_insights = [msg for msg in st.session_state.messages if msg.get("type") == "insight"]
    
    if recent_insights:
        st.subheader("🕒 Recent Insights Generated")
        for i, insight in enumerate(recent_insights[-3:], 1):
            db_status = "📊 DB" if insight.get("found_in_db") else "🌐 Web"
            with st.expander(f"Insight {i}: {insight['company_identifier']} - {db_status} - {insight['timestamp'][:19]}"):
                st.markdown(insight["response"][:500] + "..." if len(insight["response"]) > 500 else insight["response"])

def test_startup_chatbot():
    """Test the startup chatbot functionality"""
    st.header("💬 Startup Consultation Chatbot")
    st.write("Ask specific questions about any startup")
    
    # Input section
    col1, col2 = st.columns([3, 1])
    
    with col1:
        company_identifier = st.text_input(
            "Company Name or Startup ID:",
            placeholder="e.g., Zomato, Flipkart, or STARTUP_ABC123",
            help="Enter the company name or startup ID you want to ask about",
            key="chatbot_company_identifier"
        )
    
    with col2:
        use_web = st.checkbox("Enable Web Search", value=True, key="chatbot_web")
    
    # Query input
    user_query = st.text_area(
        "Ask your question:",
        placeholder="e.g., What is the competitive landscape for this startup?",
        height=100,
        help="Ask any question about the startup - funding, competitors, market, team, etc."
    )
    
    # Submit button
    if st.button("🤖 Ask Chatbot", type="primary"):
        if not company_identifier.strip():
            st.error("Please enter a company name or startup ID")
            return
        
        if not user_query.strip():
            st.error("Please enter your question")
            return
            
        if not st.session_state.get("agent"):
            st.error("Agent not initialized")
            return
        
        with st.spinner("Getting response from startup consultant..."):
            try:
                # Call the chatbot function
                result = st.session_state.agent.get_startup_chatbot(
                    query=user_query.strip(),
                    company_identifier=company_identifier.strip(),
                    session_id=st.session_state.session_id,
                    use_web=use_web
                )
                
                # Display results
                if result.get("error"):
                    st.error("Error getting chatbot response:")
                    st.error(result["response"])
                else:
                    st.success("✅ Response generated successfully!")
                    
                    # Show if found in database
                    if result.get("found_in_db"):
                        st.info("📊 Data found in database and used for analysis")
                    else:
                        st.warning("⚠️ No database record found. Analysis based on web search and general knowledge.")
                    
                    # Show Q&A format
                    st.markdown("### ❓ Your Question")
                    st.info(user_query)
                    
                    st.markdown("### 🤖 Chatbot Response")
                    st.markdown(result["response"])
                    
                    # Additional details
                    with st.expander("📋 Response Details"):
                        col1, col2 = st.columns(2)
                        
                        with col1:
                            st.write("**Company/ID:**", result["company_identifier"])
                            st.write("**Timestamp:**", result["timestamp"])
                            st.write("**Session ID:**", result["session_id"])
                            st.write("**Found in DB:**", "Yes" if result.get("found_in_db") else "No")
                        
                        with col2:
                            if result.get("context"):
                                st.write("**Context Used:**")
                                st.text_area("Context", result["context"], height=150, disabled=True, key=f"context_{uuid.uuid4()}")
                    
                    # Add to conversation history
                    st.session_state.messages.append({
                        "type": "chatbot",
                        "company_identifier": company_identifier,
                        "query": user_query,
                        "response": result["response"],
                        "timestamp": result["timestamp"],
                        "found_in_db": result.get("found_in_db", False)
                    })
                    
            except Exception as e:
                st.error(f"Error: {str(e)}")
    
    # Show conversation history
    st.divider()
    chatbot_history = [msg for msg in st.session_state.messages if msg.get("type") == "chatbot"]
    
    if chatbot_history:
        st.subheader("💭 Recent Conversations")
        for i, conv in enumerate(chatbot_history[-5:], 1):
            db_status = "📊 DB" if conv.get("found_in_db") else "🌐 Web"
            with st.expander(f"Q&A {i}: {conv['company_identifier']} - {db_status} - {conv['timestamp'][:19]}"):
                st.write("**Question:**", conv["query"])
                st.write("**Response:**", conv["response"][:300] + "..." if len(conv["response"]) > 300 else conv["response"])

def show_system_status():
    """Show system status and debug information"""
    st.header("🔧 System Status & Debug Information")
    
    if st.session_state.get("agent"):
        try:
            status = st.session_state.agent.get_system_status()
            
            # System status cards
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric(
                    "Database",
                    "Connected" if status.get("database_connected") else "Disconnected",
                    delta="✅" if status.get("database_connected") else "❌"
                )
            
            with col2:
                st.metric(
                    "Memory Graph Entities",
                    status.get("entities_in_graph", 0)
                )
            
            with col3:
                st.metric(
                    "Memory Graph Relations",
                    status.get("relationships_in_graph", 0)
                )
            
            with col4:
                st.metric(
                    "Conversation History",
                    status.get("conversation_history_length", 0)
                )
            
            # Detailed status
            st.subheader("📊 Detailed System Information")
            st.json(status)
            
            # Session information
            st.subheader("🔗 Session Information")
            session_info = {
                "Current Session ID": st.session_state.session_id,
                "Messages in Session": len(st.session_state.messages),
                "Agent Initialized": st.session_state.get("agent") is not None
            }
            st.json(session_info)
            
        except Exception as e:
            st.error(f"Error getting system status: {e}")
    else:
        st.error("Agent not initialized")
    
    # Environment check
    st.subheader("🌍 Environment Variables")
    env_vars = ["SUPABASE_URL", "SUPABASE_KEY", "GROQ_API_KEY", "SERPAPI_KEY", "OPENAI_API_KEY"]
    
    for var in env_vars:
        value = os.environ.get(var)
        st.write(f"**{var}:** {'✅ Set' if value else '❌ Missing'}")
    
    # Recent activity
    st.subheader("📝 Recent Activity")
    if st.session_state.messages:
        for msg in st.session_state.messages[-5:]:
            st.write(f"**{msg.get('type', 'unknown').title()}** - {msg.get('timestamp', 'no timestamp')[:19]}")
    else:
        st.write("No recent activity")

# Sample queries for testing - FIXED VERSION
def show_sample_queries():
    st.sidebar.header("💡 Sample Test Cases")
    
    st.sidebar.subheader("For Insights Testing:")
    sample_companies = [
        "Zomato",
        "Flipkart", 
        "Paytm",
        "Byju's",
        "Ola",
        "Swiggy",
        "STARTUP_002"
    ]
    
    for i, company in enumerate(sample_companies):
        if st.sidebar.button(f"Test: {company}", key=f"insight_btn_{i}_{company}"):
            st.session_state.test_company = company
    
    st.sidebar.subheader("For Chatbot Testing:")
    sample_queries = [
        "What is the funding history of this startup?",
        "Who are the main competitors?",
        "What is the market opportunity?",
        "Tell me about the founding team",
        "What are the key risks for investors?",
        "How does this startup make money?",
        "What is their business model?",
        "What are recent news about this company?"
    ]
    
    for i, query in enumerate(sample_queries):
        if st.sidebar.button(f"Ask: {query[:30]}...", key=f"query_btn_{i}"):
            st.session_state.test_query = query
    
    # Display selected values if they exist
    if hasattr(st.session_state, 'test_company'):
        st.sidebar.info(f"Selected Company: {st.session_state.test_company}")
        if st.sidebar.button("Clear Selection", key="clear_company"):
            del st.session_state.test_company
    
    if hasattr(st.session_state, 'test_query'):
        st.sidebar.info(f"Selected Query: {st.session_state.test_query[:50]}...")
        if st.sidebar.button("Clear Query", key="clear_query"):
            del st.session_state.test_query

if __name__ == "__main__":
    # Sidebar
    show_sample_queries()
    
    # Clear session button
    if st.sidebar.button("🔄 Clear Session", key="clear_session"):
        st.session_state.messages = []
        st.session_state.session_id = str(uuid.uuid4())
        st.rerun()
    
    # Main app
    main()
    
    # Footer
    st.divider()
    st.caption("🚀 Startup Analysis Testing Platform")
    st.caption(f"Session: {st.session_state.session_id[:8]} | Messages: {len(st.session_state.messages)}")

# Instructions for running
"""
To run this testing platform:

1. Save as 'test_frontend.py' in your project directory
2. Make sure your file structure is:
   your_project/
   ├── test_frontend.py
   ├── evalve/
   │   └── app.py (your fixed EvalveAgent)
   └── other folders...

3. Install requirements:
   pip install streamlit pypdf agno openai supabase python-dotenv google-search-results groq

4. Set up .env file with your API keys

5. Add the database search method to your DatabaseManager class

6. Run:
   streamlit run test_frontend.py

Key Features:
- ✅ Fixed NoneType format errors with safe formatting
- ✅ Company name search (fallback to startup ID)
- ✅ Clear indicators if data found in DB vs web search
- ✅ Better error handling
- ✅ Sample company names for testing
- ✅ Unique keys to prevent Streamlit errors

This will give you a complete testing interface that works with both company names and startup IDs!
"""