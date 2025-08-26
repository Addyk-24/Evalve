from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn

from database.DatabaseManager import DatabaseManager
from evalve.app import EvalveAgent

dm = DatabaseManager()
ea = EvalveAgent()

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Welcome To Evalve"}

@app.get("/api/startups")
def get_all_startup():
    response = dm.get_all_startups()
    return response

@app("/api/startups/{startup_id}")
def get_specific_startup(startup_id:str):
    specific_profile = dm.get_startup_by_name_or_id(startup_id)
    specific_profile_data = dm.get_startup_by_company_name(specific_profile)

    specific_profile_insights = ea.get_startup_insight(specific_profile)

    return {f"{specific_profile}\n : {specific_profile_data} "}

