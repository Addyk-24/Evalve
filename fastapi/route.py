from dotenv import load_dotenv
load_dotenv() 

import os
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
from pydantic import BaseModel

from database.DatabaseManager import DatabaseManager
from evalve.app import EvalveAgent
from conversation_mem.convo_mem import ConversationMemory

dm = DatabaseManager()
ea = EvalveAgent()
cm = ConversationMemory()


class ChatModel(BaseModel):
    query : str
    session_id : str

app = FastAPI()


# Mount static files (built Vite app)
if os.path.exists("static"):
    app.mount("/web", StaticFiles(directory="web"), name="web")

# API routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/")
def root():
    return {"message": "Welcome To Evalve"}

@app.get("/api/startups")
def get_all_startup():
    response = dm.get_all_startups()
    return response

@app.get("/api/startups/{startup_id}")
def get_specific_startup(startup_id:str):
    specific_profile = dm.get_startup_by_name_or_id(startup_id)

    specific_profile_insights = ea.get_startup_insight(specific_profile)

    return {f"{specific_profile.get('company_name')}" : {specific_profile},
            "Insights" : {specific_profile_insights}
            }

@app.post("/api/startups/{startup_id}/chat")
def specific_profile_chat(startup_id:str, req: ChatModel):

    req.session_id = cm._generate_session_id()

    response = ea.get_startup_chatbot(req.query,startup_id,req.session_id)

    return {"response" : response}



