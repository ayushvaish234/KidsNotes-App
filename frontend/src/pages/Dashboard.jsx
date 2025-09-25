import React, { useEffect, useState } from "react";
import axios from "axios";
import LogoutButton from "../LogoutButton";
import { Modal, Button, Form } from "react-bootstrap";

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");

  const [showChildModal, setShowChildModal] = useState(false);
  const [childUsername, setChildUsername] = useState("");
  const [childPassword, setChildPassword] = useState("");

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    tags: "",
    is_todo: false,
    folder_id: selectedFolder || null,
  });

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [showOnlyTodo, setShowOnlyTodo] = useState(false); // Toggle for To-Do filter

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Fetch notes (for child or selected child of parent)
  const fetchNotes = async (childId = null, folderId = null) => {
    try {
      const params = {};
      if (role === "parent" && childId) params.child_id = childId;
      if (folderId) params.folder_id = folderId;
      const res = await axios.get("http://127.0.0.1:8000/notes", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(res.data);
    } catch {
      alert("Failed to fetch notes");
    }
  };

  //fetch children for parent user
  const fetchChildren = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/children", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChildren(res.data);
      if (res.data.length > 0) {
        setSelectedChild(res.data[0].id);
        fetchNotes(res.data[0].id);
      }
    } catch {
      alert("Failed to fetch children");
    }
  };

  //fetch folders for child user
  const fetchFolders = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/folders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFolders(res.data);
    } catch {
      alert("Failed to fetch folders");
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (role === "child") {
      fetchNotes();
      fetchFolders();
    }
    if (role === "parent") fetchChildren();

  }, []);

  const handleCreateNote = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/notes",
        newNote,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowNoteModal(false);
      setNewNote({ title: "", content: "", tags: "", is_todo: false, folder_id: selectedFolder || null });
      fetchNotes(selectedChild, selectedFolder);
    } catch {
      alert("Failed to create note");
    }
  };

  // Create new folder
  const handleCreateFolder = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/folders",
        { name: newFolderName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowFolderModal(false);
      setNewFolderName("");
      fetchFolders();
    } catch {
      alert("Failed to create folder");
    }
  };

  // Filter notes if toggle is on
  const displayedNotes = showOnlyTodo
    ? notes.filter(note => note.is_todo)
    : notes;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Notes</h2>
        <LogoutButton />
      </div>

      {role === "parent" && (
        <>
          <button
            className="btn mb-3"
            style={{ backgroundColor: "#FAB12F", color: "#fff" }}
            onClick={() => setShowChildModal(true)}
          >
            Create Child Account
          </button>

          {showChildModal && (
            <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog">
                <div className="modal-content p-3">
                  <h5>Create Child Account</h5>
                  <input
                    type="text"
                    placeholder="Username"
                    className="form-control my-2"
                    value={childUsername}
                    onChange={(e) => setChildUsername(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    className="form-control my-2"
                    value={childPassword}
                    onChange={(e) => setChildPassword(e.target.value)}
                  />
                  <div className="d-flex justify-content-end mt-2">
                    <button
                      className="btn"
                      style={{ backgroundColor: "#FAB12F", color: "#fff" }}
                      onClick={async () => {
                        if (!childUsername || !childPassword) return alert("Fill both fields");
                        try {
                          await axios.post(
                            "http://127.0.0.1:8000/signup",
                            { username: childUsername, password: childPassword, role: "child" },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          alert("Child account created");
                          setChildUsername("");
                          setChildPassword("");
                          setShowChildModal(false);
                          fetchChildren();
                        } catch {
                          alert("Failed to create child");
                        }
                      }}
                    >
                      Create
                    </button>
                    <button
                      className="btn btn-secondary ms-2"
                      onClick={() => setShowChildModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-3">
            <label>Select child: </label>
            <select
              className="form-select"
              value={selectedChild || ""}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedChild(id);
                fetchNotes(id || null);
              }}
            >
              <option value="">All</option>
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.username}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {role === "child" && (
        <>
          <Button
            style={{ backgroundColor: "#FAB12F", color: "#fff" }}
            className="mb-3"
            onClick={() => setShowNoteModal(true)}
          >
            + New Note
          </Button>

          <button
            className="btn btn-secondary mb-3"
            onClick={() => setShowFolderModal(true)}
          >
            + New Folder
          </button>

          <div className="mb-3">
            <label>Select folder: </label>
            <select
              className="form-select"
              value={selectedFolder}
              onChange={(e) => {
                setSelectedFolder(e.target.value);
                fetchNotes(null, e.target.value !== "" ? e.target.value : null);
              }}
            >
              <option value="">All</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* To-Do filter toggle */}
          <div className="mb-3">
            <Form.Check
              type="checkbox"
              label="Show only To-Do notes"
              checked={showOnlyTodo}
              onChange={e => setShowOnlyTodo(e.target.checked)}
            />
          </div>
        </>
      )}

      {/* Notes list */}
      <ul className="list-group mb-4">
        {displayedNotes.map((note) => (
          <li
            key={note.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{note.title}</strong>
              {note.is_todo && (
                <span className="badge bg-warning ms-2" style={{ color: "#000" }}>
                  To-Do
                </span>
              )}
              <div className="mb-1">{note.content}</div>
              <div>{note.tags && <small className="text-muted">Tags: {note.tags}</small>}</div>
            </div>
            {role === "child" && (
              <button
                className="btn btn-danger btn-sm"
                onClick={async () => {
                  if (window.confirm("Delete this note?")) {
                    try {
                      await axios.delete(`http://127.0.0.1:8000/notes/${note.id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      setNotes(notes.filter(n => n.id !== note.id));
                    } catch {
                      alert("Failed to delete note");
                    }
                  }
                }}
              >
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      <Modal show={showNoteModal} onHide={() => setShowNoteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={newNote.title}
                onChange={e => setNewNote({ ...newNote, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newNote.content}
                onChange={e => setNewNote({ ...newNote, content: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tags</Form.Label>
              <Form.Control
                type="text"
                value={newNote.tags}
                onChange={e => setNewNote({ ...newNote, tags: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Is To-Do?"
                checked={newNote.is_todo}
                onChange={e => setNewNote({ ...newNote, is_todo: e.target.checked })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Folder</Form.Label>
              <Form.Select
                value={newNote.folder_id || ""}
                onChange={e => setNewNote({ ...newNote, folder_id: e.target.value })}
              >
                <option value="">No Folder</option>
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNoteModal(false)}>
            Cancel
          </Button>
          <Button
            style={{ backgroundColor: "#FAB12F", color: "#fff" }}
            onClick={handleCreateNote}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showFolderModal} onHide={() => setShowFolderModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Folder</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            className="form-control"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            placeholder="Folder name"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowFolderModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateFolder}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Dashboard;
