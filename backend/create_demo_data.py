#!/usr/bin/env python3

from database import SessionLocal, User, Folder, Note
from auth import get_password_hash
import random

def create_demo_data():
    db = SessionLocal()
    
    # Clear existing data
    db.query(Note).delete()
    db.query(Folder).delete()
    db.query(User).delete()
    db.commit()
    
    # Sample data
    parent_names = [
        ("Ayush", "Ayush@email.com"),
        ("Priya", "priya@email.com"),
        ("Rohit", "Rohit@email.com"),
   
    ]
    
    child_names = [
        ("arun", "arun@email.com"),
        ("kavita", "kavita@email.com"),
        ("arjit", "arjit@email.com"),
      
    ]
    
    # Create parent
    parents = []
    for name, email in parent_names:
        parent = User(
            username=name.lower(),
            email=email,
            hashed_password=get_password_hash("password123"),
            role="parent"
        )
        db.add(parent)
        parents.append(parent)
    
    db.commit()
    db.refresh(parents[0])
    db.refresh(parents[1])
    db.refresh(parents[2])
    db.refresh(parents[3])
    db.refresh(parents[4])
    
  
  # Assign children to parents
    child_assignments = [0, 1, 2, 3, 3, 4, 4]  
    children = []
    for i, (name, email) in enumerate(child_names):
        parent_id = parents[child_assignments[i]].id
        child = User(
            username=name.lower(),
            email=email,
            hashed_password=get_password_hash("password123"),
            role="child",
            parent_id=parent_id
        )
        db.add(child)
        children.append(child)
    
    db.commit()
    
    for child in children:
        db.refresh(child)
    
    # Create folders for each child
    folder_names = ["School", "Personal", "Projects", "Ideas", "To-Do"]
    folders = []
    
    for child in children:
      
        num_folders = random.randint(2, 3)
        child_folders = random.sample(folder_names, num_folders)
        
        for folder_name in child_folders:
            folder = Folder(
                name=folder_name,
                owner_id=child.id
            )
            db.add(folder)
            folders.append(folder)
    
    db.commit()
    
    for folder in folders:
        db.refresh(folder)
    
    note_templates = [
    ("Gym Routine", "Create workout plan for the next 4 weeks", "fitness,health", True, False),
    ("Travel Checklist", "Pack essentials for Goa trip", "travel,checklist", True, True),
    ("Recipe Ideas", "Try out pasta with creamy mushroom sauce", "cooking,food", False, False),
    ("Gift List", "Buy gifts for cousins before Diwali", "family,gifts", False, False),
   
    ]


    for child in children:
    
        child_folders = [f for f in folders if f.owner_id == child.id]
        
        
        num_notes = random.randint(3, 5)
        child_notes = random.sample(note_templates, num_notes)
        
        for title, content, tags, is_todo, is_completed in child_notes:
        
            if child_folders and random.choice([True, False]):
                folder_id = random.choice(child_folders).id
            else:
                folder_id = None
            
            note = Note(
                title=title,
                content=content,
                tags=tags,
                is_todo=is_todo,
                is_completed=is_completed,
                folder_id=folder_id,
                owner_id=child.id
            )
            db.add(note)
    
    db.commit()
    db.close()
 
if __name__ == "__main__":
    create_demo_data()