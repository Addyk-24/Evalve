from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn


app = FastAPI()

@app.get("/")
def root():
    return {"message": "Welcome To Evalve"}