from fastapi import FastAPI, Depends
from sqlalchemy import Column, Integer, BigInteger, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = "postgresql://postgres:Cadbury%40123@localhost:5432/Features"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Features(Base):
    __tablename__ = "features"  
    id = Column(Integer, primary_key=True, index=True)
    developers = Column(BigInteger, default=0)
    startups = Column(BigInteger, default=0)
    funding = Column(BigInteger, default=0)
    investors = Column(BigInteger, default=0)

Base.metadata.create_all(bind=engine)

app = FastAPI()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    stats = db.query(Features).first()
    if not stats:
        default = Features(developers=15000, startups=2500, funding=125, investors=850)
        db.add(default)
        db.commit()
        db.refresh(default)
        stats = default
    return {
        "developers": stats.developers,
        "startups": stats.startups,
        "funding": stats.funding,
        "investors": stats.investors
    }
