from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

# Set up SQLite database connection
DB_URL = "sqlite:///./notes_new.db"
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionMaker = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

#  stores parent and child users
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, index=True, nullable=True)
    hashed_password = Column(String)
    role = Column(String, default="child")  # "child" or "parent"
    parent_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Only for children
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Link to parent and children
    parent = relationship("User", remote_side=[id], back_populates="children")
    children = relationship("User", back_populates="parent", remote_side=[parent_id])
    
    folders = relationship("Folder", back_populates="owner")
    notes = relationship("Note", back_populates="owner")

# organizes notes for each user
class Folder(Base):
    __tablename__ = "folders"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    owner = relationship("User", back_populates="folders")
    notes = relationship("Note", back_populates="folder")

# stores notes
class Note(Base):
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    tags = Column(String)  # Comma-separated tags
    is_todo = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)
    folder_id = Column(Integer, ForeignKey("folders.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = relationship("User", back_populates="notes")
    folder = relationship("Folder", back_populates="notes")

# Build tables if they don't exist yet
Base.metadata.create_all(bind=engine)

def get_db():
    db_session = SessionMaker()
    try:
        yield db_session
    finally:
        db_session.close()