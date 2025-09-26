# KidsNotes

KidsNotes is a web application designed for children and their parents to manage notes in a safe, organized, and family-friendly way. The app features role-based access, allowing children to create and organize notes into folders, while parents can view their children's notes and manage child accounts. KidsNotes is built with FastAPI (backend), React.js (frontend), and SQLite (database).

---

## Features

- **Role-Based Authentication**
  - **Parent:** Sign up, log in, create child accounts, and view notes created by their children.
  - **Child:** Log in, create/delete notes, organize notes into folders, and mark notes as "To-Do".

- **Notes Management**
  - Create, view, and delete notes.
  - Assign notes to folders for better organization.
  - Mark notes as "To-Do" and filter notes by this status.

- **Folders**
  - Children can create folders and organize their notes.

- **Parent Dashboard**
  - View all child accounts and their notes.
  - Cannot modify or delete notes.

- **Clean UI**
  - Responsive dashboard with modals for note and folder creation.
  - Easy navigation and clear separation of parent/child features.

---

## Installation

### Prerequisites

- Python 3.8+
- Node.js and npm

### Backend Setup

1. **Clone the repository**
    ```sh
    git clone [https://github.com/ayushvaish234/KidsNotes-App.git]
    cd kidsnotes/backend
    ```

2. **Create a virtual environment**
    ```sh
    python -m venv venv
    source venv\Scripts\activate
    ```

3. **Install dependencies**
    ```sh
    pip install -r requirements.txt
    ```

4. **(Optional) Create demo data**
    ```sh
    python create_demo_data.py
    ```

5. **Run the FastAPI server**
    ```sh
    uvicorn main:app --reload
    ```
    The backend will be available at `http://127.0.0.1:8000`.

---

### Frontend Setup

1. **Navigate to the frontend folder**
    ```sh
    cd ../frontend
    ```

2. **Install dependencies**
    ```sh
    npm install
    ```

3. **Start the React development server**
    ```sh
    npm start
    ```
    The frontend will be available at `http://localhost:3000`.

---

## Usage

1. **Parent Signup:**  
   Register as a parent with a username, email, and password.

2. **Parent Dashboard:**  
   - Create child accounts.
   - Select a child to view their notes.

3. **Child Login:**  
   Log in with the credentials provided by the parent.

4. **Child Dashboard:**  
   - Create notes and folders.
   - Assign notes to folders.
   - Mark notes as "To-Do" and filter notes by status.
   - Delete notes.

5. **Logout:**  
   Use the logout button to securely exit the session.

---

## Project Structure

```
kidsnotes/
  ├── backend/
  │   ├── main.py
  │   ├── database.py
  │   ├── auth.py
  │   ├── create_demo_data.py
  │   └── requirements.txt
  └── frontend/
      ├── src/
      │   ├── pages/
      │   │   └── Dashboard.jsx
      │   ├── App.jsx
      │   ├── header.jsx
      │   └── ...
      ├── public/
      │   └── icon.png
      └── package.json
```

---


---

## License

MIT License

---


## Contact

For questions or support, contact ayushvaish87@gmail.com.
