from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from database import get_db, User, Folder, Note
from auth import get_password_hash, verify_password, create_access_token, get_current_user, get_current_user_optional

app = FastAPI(title="NoteNext API")

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    password: str
    role: str 
    parent_id: Optional[int] = None
    child_ids: Optional[List[int]] = []

class UserLogin(BaseModel):
    username: str
    password: str

class FolderCreate(BaseModel):
    name: str

class NoteCreate(BaseModel):
    title: str
    content: str
    tags: Optional[str] = ""
    is_todo: bool = False
    folder_id: Optional[int] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[str] = None
    is_todo: Optional[bool] = None
    is_completed: Optional[bool] = None

# Authentication endpoints
@app.post("/signup")
def signup(
    new_user: UserCreate,
    db_session: Session = Depends(get_db),
    active_user: Optional[User] = Depends(get_current_user_optional)
):
    # Prevent duplicate usernames
    if db_session.query(User).filter(User.username == new_user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_pw = get_password_hash(new_user.password)

    if new_user.role == "child":
        # Only parents can create child accounts
        if not active_user or active_user.role != "parent":
            raise HTTPException(status_code=403, detail="Only parents can create child accounts")
        db_user = User(
            username=new_user.username,
            email=active_user.email,
            hashed_password=hashed_pw,
            role="child",
            parent_id=active_user.id
        )
    else:  # parent signup
        # Email required for parent
        if not new_user.email:
            raise HTTPException(status_code=400, detail="Email required for parent signup")
        # Prevent duplicate parent emails
        if db_session.query(User).filter(User.email == new_user.email, User.role == "parent").first():
            raise HTTPException(status_code=400, detail="Email already registered")
        db_user = User(
            username=new_user.username,
            email=new_user.email,
            hashed_password=hashed_pw,
            role="parent",
        )

    db_session.add(db_user)
    db_session.commit()
    db_session.refresh(db_user)
    return {
        "id": db_user.id,
        "username": db_user.username,
        "role": db_user.role,
        "email": db_user.email,
        "parent_id": db_user.parent_id
    }

@app.post("/login")
def login(login_data: UserLogin, db_session: Session = Depends(get_db)):
    # Authenticate user and return JWT
    db_user = db_session.query(User).filter(User.username == login_data.username).first()
    if not db_user or not verify_password(login_data.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": db_user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "role": db_user.role
        }
    }

# Folder endpoints 
@app.get("/folders")
def get_folders(child_id: Optional[int] = None, active_user: User = Depends(get_current_user), db_session: Session = Depends(get_db)):
    # Return folders for current user or parent's children
    if active_user.role == "parent":
        child_ids = [child.id for child in active_user.children]
        if child_id and child_id in child_ids:
            folders = db_session.query(Folder).filter(Folder.owner_id == child_id).all()
        else:
            folders = db_session.query(Folder).filter(Folder.owner_id.in_(child_ids)).all()
    else:
        folders = db_session.query(Folder).filter(Folder.owner_id == active_user.id).all()
    return folders

@app.post("/folders")
def create_folder(folder_data: FolderCreate, active_user: User = Depends(get_current_user), db_session: Session = Depends(get_db)):
    # Only children can create folders
    if active_user.role == "parent":
        raise HTTPException(status_code=403, detail="Parents cannot create folders")
    
    db_folder = Folder(name=folder_data.name, owner_id=active_user.id)
    db_session.add(db_folder)
    db_session.commit()
    db_session.refresh(db_folder)
    return db_folder

@app.delete("/folders/{folder_id}")
def delete_folder(folder_id: int, active_user: User = Depends(get_current_user), db_session: Session = Depends(get_db)):
    # Only folder owner (child) can delete
    folder = db_session.query(Folder).filter(Folder.id == folder_id).first()
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    if active_user.role == "parent" or folder.owner_id != active_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_session.delete(folder)
    db_session.commit()
    return {"message": "Folder deleted"}

# Note endpoints 
@app.get("/notes")
def get_notes(folder_id: Optional[int] = None, child_id: Optional[int] = None, active_user: User = Depends(get_current_user), db_session: Session = Depends(get_db)):
    # Return notes for current user or parent's children
    query = db_session.query(Note)
    
    if active_user.role == "parent":
        child_ids = [child.id for child in active_user.children]
        if child_id and child_id in child_ids:
            query = query.filter(Note.owner_id == child_id)
        else:
            query = query.filter(Note.owner_id.in_(child_ids))
    else:
        query = query.filter(Note.owner_id == active_user.id)
    
    if folder_id:
        query = query.filter(Note.folder_id == folder_id)
    
    return query.all()

@app.post("/notes")
def create_note(note_data: NoteCreate, active_user: User = Depends(get_current_user), db_session: Session = Depends(get_db)):
    # Only children can create notes
    if active_user.role == "parent":
        raise HTTPException(status_code=403, detail="Parents cannot create notes")
    
    db_note = Note(
        title=note_data.title,
        content=note_data.content,
        tags=note_data.tags,
        is_todo=note_data.is_todo,
        folder_id=note_data.folder_id,
        owner_id=active_user.id
    )
    db_session.add(db_note)
    db_session.commit()
    db_session.refresh(db_note)
    return db_note

@app.put("/notes/{note_id}")
def update_note(note_id: int, note_data: NoteUpdate, active_user: User = Depends(get_current_user), db_session: Session = Depends(get_db)):
    # Only note owner (child) can update
    db_note = db_session.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    if active_user.role == "parent" or db_note.owner_id != active_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for field, value in note_data.dict(exclude_unset=True).items():
        setattr(db_note, field, value)
    
    db_note.updated_at = datetime.utcnow()
    db_session.commit()
    db_session.refresh(db_note)
    return db_note

@app.delete("/notes/{note_id}")
def delete_note(note_id: int, active_user: User = Depends(get_current_user), db_session: Session = Depends(get_db)):
    # Only note owner (child) can delete
    note = db_session.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if active_user.role == "parent" or note.owner_id != active_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_session.delete(note)
    db_session.commit()
    return {"message": "Note deleted"}

# Children endpoints 
@app.get("/children")
def get_children(active_user: User = Depends(get_current_user), db_session: Session = Depends(get_db)):
    # Only parents can view their children
    if active_user.role != "parent":
        raise HTTPException(status_code=403, detail="Only parents can access this endpoint")
    
    children = [{
        "id": child.id,
        "username": child.username,
        "email": child.email
    } for child in active_user.children]
    return children

@app.get("/available-children")
def get_available_children(db_session: Session = Depends(get_db)):
    # List children without parents
    children = db_session.query(User).filter(User.role == "child", User.parent_id == None).all()
    return [{
        "id": child.id,
        "username": child.username,
        "email": child.email
    } for child in children]

# Root endpoint 
@app.get("/")
def root():
    # Health check endpoint
    return {"message": "NoteNext API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)