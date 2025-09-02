from dotenv import load_dotenv
load_dotenv()

# MAIN FASTAPI ROUTE DONE BY ME

import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel,HttpUrl
from typing import Optional, List, Dict, Any

from database.DatabaseManager import DatabaseManager
from evalve.app import EvalveAgent
from conversation_mem.convo_mem import ConversationMemory

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

try:
    dm = DatabaseManager(SUPABASE_URL,SUPABASE_KEY)
    ea = EvalveAgent()
    cm = ConversationMemory()
except Exception as e:
    print(f"Error initializing services: {e}")
    dm = ea = cm = None

class ChatModel(BaseModel):
    query : str
    session_id : Optional[str]

class StartupResponse(BaseModel):
    startup_id: str
    company_name: str
    industry_sector: Optional[str] = None
    stage: Optional[str] = None
    funding_amount_required: Optional[float] = None
    # Add other fields as needed

class ChatResponse(BaseModel):
    response: str
    session_id: str
    startup_id: str

class Founder(BaseModel):
    # DONE IN SUPABASE
    name: str
    role: str
    education: Optional[str]
    institution: Optional[str]
    experience: Optional[str]
    equityShare: Optional[float]
    linkedIn: Optional[HttpUrl]

class StartupProfile(BaseModel):
    companyLegalName: str
    companyBrandName: Optional[str]
    industry_sector: str
    stage: str
    funding_stage: Optional[str]
    funding_amount_required: Optional[float]
    city: str
    state: str
    website: Optional[HttpUrl]
    email: str
    phone: str
    problemStatement: str
    solutionDescription: str
    targetMarket: str
    revenueModel: str
    pricingStrategy: Optional[str]
    competitiveAdvantage: str
    teamSize: int
    techStack: Optional[str]
    operationalMetrics: Optional[str]
    monthlyRevenue: Optional[float]
    burnRate: Optional[float]
    cashPosition: Optional[float]
    revenueProjections: Optional[str]
    breakEvenTimeline: Optional[str]




app = FastAPI(
    title="Evalve API",
    description="API for Startup Platform with AI Insights and Chatbot",
    version="1.0.0"
)

# CORS middleware for development
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Check if the built frontend exists
if os.path.exists("web/dist"):
    app.mount("/static", StaticFiles(directory="web/dist"), name="static")
    print("✅ Mounted built frontend from web/dist")
elif os.path.exists("web"):
    app.mount("/static", StaticFiles(directory="web"), name="static")
    print("✅ Mounted frontend from web directory")
else:
    print("⚠️ No frontend directory found")

# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "database": dm is not None and dm.is_connected() if dm else False,
            "ai_agent": ea is not None,
            "conversation_memory": cm is not None
        }
    }

# Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome To Evalve"}


@app.post("/api/signup/entrepreneur")
def create_entrepreneur(data: StartupProfile):
    """ Create Entrepreneur Signup"""
    if not dm:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    try:
        new_entry = dm.save_startup_profile(data.model_dump())
        return {"status": "success", "id": new_entry.get("id")}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@app.get("/api/startups", response_model=List[Dict[str, Any]])
def get_all_startup(limit: int = 50,
    industry_sector: Optional[str] = None,
    stage: Optional[str] = None,
    funding_stage: Optional[str] = None
    ):

    """ Get all Startup Profile With Filters"""
    if not dm:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    try:
        filters = {}
        if industry_sector:
            filters['industry_sector'] = industry_sector
        if stage:
            filters['stage'] = stage
        if funding_stage:
            filters['funding_stage'] = funding_stage
            
        response = dm.get_all_startups(filters=filters, limit=limit)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching startups: {str(e)}")


@app.get("/api/startups/{startup_id}")
def get_specific_startup(startup_id:str):
    """ Get Specific Startup Profile"""
    if not dm or not ea:
        raise HTTPException(status_code=503, detail="Required services unavailable")
    try:
        specific_profile = dm.get_startup_by_name_or_id(startup_id)

        if not specific_profile:
            raise HTTPException(status_code=404, detail="Startup not found")

        try:

            specific_profile_insights = ea.get_startup_insight(specific_profile)
        except Exception as e:
            print(f"Error getting insights: {e}")
            specific_profile_insights = {"error": "Could not generate insights"}

        return {f"{specific_profile.get('company_name')}" : {specific_profile},
                "Insights" : {specific_profile_insights}
                }
    except HTTPException:
        raise  # Re-raise HTTP exceptions
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching startup: {str(e)}")

# Get startup insights only - yeppp
@app.get("/api/startups/{startup_id}/insight")
def get_startup_insight(startup_id: str):
    """Get AI insights for a specific startup"""
    if not dm or not ea:
        raise HTTPException(status_code=503, detail="Required services unavailable")
    
    try:
        startup_profile = dm.get_startup_by_name_or_id(startup_id)
        if not startup_profile:
            raise HTTPException(status_code=404, detail="Startup not found")
        
        insights = ea.get_startup_insight(startup_profile)
        return insights
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")
    

@app.post("/api/startups/{startup_id}/chat", response_model=ChatResponse)
def specific_profile_chat(startup_id:str, req: ChatModel):
    """ Chat about that Specific Startup Profile"""

    if not dm or not ea or not cm:
        raise HTTPException(status_code=503, detail="Required services unavailable")
    
    try:
        startup_profile = dm.get_startup_by_name_or_id(startup_id)
        if not startup_profile:
            raise HTTPException(status_code=404, detail="Startup not found")

        session_id = req.session_id or cm._generate_session_id()

        response = ea.get_startup_chatbot(req.query,startup_id,req.session_id)

        return ChatResponse(
            response=response,
            session_id=session_id,
            startup_id=startup_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in chat: {str(e)}")
    

@app.get("/api/startups/search", response_model=List[Dict[str, Any]])
def search_startups(q: str, limit: int = 20):
    """Search startups by name, industry, or description"""
    if not dm:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    try:
        results = dm.search_startups(q, limit=limit)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching startups: {str(e)}")


# Serve the React app for non-API routes (SPA routing)
@app.get("/{path:path}")
async def serve_spa(path: str):
    """Serve the React SPA for all non-API routes"""
    # Don't serve SPA for API routes
    if path.startswith("api/") or path.startswith("static/"):
        raise HTTPException(status_code=404, detail="Not found")
    
    # Serve index.html for SPA routing
    if os.path.exists("web/dist/index.html"):
        return FileResponse("web/dist/index.html")
    elif os.path.exists("web/index.html"):
        return FileResponse("web/index.html")
    else:
        raise HTTPException(status_code=404, detail="Frontend not found")

# Handling the error - cool
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return {"error": "Not found", "detail": exc.detail}

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: HTTPException):
    return {"error": "Internal server error", "detail": exc.detail}

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
