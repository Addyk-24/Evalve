from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr, HttpUrl
from typing import List, Optional
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
DATABASE_URL = "postgresql://postgres:Cadbury%40123@localhost:5432/Enterprenuer_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Entrepreneur(Base):
    __tablename__ = "entrepreneurs"

    id = Column(Integer, primary_key=True, index=True)
    companyLegalName = Column(String, nullable=False)
    companyBrandName = Column(String, nullable=True)
    registrationStatus = Column(String, nullable=False)
    industry = Column(String, nullable=False)
    stage = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    website = Column(String, nullable=True)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    founders = Column(JSON, nullable=True)
    problemStatement = Column(Text, nullable=False)
    solutionDescription = Column(Text, nullable=False)
    targetMarket = Column(Text, nullable=False)
    revenueModel = Column(Text, nullable=False)
    pricingStrategy = Column(Text, nullable=True)
    competitiveAdvantage = Column(Text, nullable=False)
    teamSize = Column(Integer, nullable=False)
    keyMembers = Column(Text, nullable=True)
    techStack = Column(String, nullable=True)
    operationalMetrics = Column(Text, nullable=True)
    monthlyRevenue = Column(Float, nullable=True)
    burnRate = Column(Float, nullable=True)
    cashPosition = Column(Float, nullable=True)
    revenueProjections = Column(Text, nullable=True)
    breakEvenTimeline = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

class Founder(BaseModel):
    name: str
    role: str
    education: Optional[str]
    institution: Optional[str]
    experience: Optional[str]
    equityShare: Optional[float]
    linkedIn: Optional[HttpUrl]

class EntrepreneurSchema(BaseModel):
    companyLegalName: str
    companyBrandName: Optional[str]
    registrationStatus: str
    industry: str
    stage: str
    city: str
    state: str
    website: Optional[HttpUrl]
    email: EmailStr
    phone: str
    founders: List[Founder]
    problemStatement: str
    solutionDescription: str
    targetMarket: str
    revenueModel: str
    pricingStrategy: Optional[str]
    competitiveAdvantage: str
    teamSize: int
    keyMembers: Optional[str]
    techStack: Optional[str]
    operationalMetrics: Optional[str]
    monthlyRevenue: Optional[float]
    burnRate: Optional[float]
    cashPosition: Optional[float]
    revenueProjections: Optional[str]
    breakEvenTimeline: Optional[str]

app = FastAPI(title="Entrepreneur Signup API")

@app.post("/api/signup/entrepreneur")
def create_entrepreneur(data: EntrepreneurSchema):
    db = SessionLocal()
    try:
        new_entry = Entrepreneur(**data.dict())
        db.add(new_entry)
        db.commit()
        db.refresh(new_entry)
        return {"status": "success", "id": new_entry.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

@app.get("/api/signup/entrepreneur/{entrepreneur_id}")
def get_entrepreneur(entrepreneur_id: int):
    db = SessionLocal()
    try:
        entry = db.query(Entrepreneur).filter(Entrepreneur.id == entrepreneur_id).first()
        if not entry:
            raise HTTPException(status_code=404, detail="Entrepreneur not found")
        return entry.__dict__
    finally:
        db.close()
