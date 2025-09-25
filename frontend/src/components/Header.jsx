import React from 'react'
import { Link } from 'react-router-dom'

export default function Header({ user, onLogout }) {
  return (
    <nav className="navbar navbar-expand bg-light border-bottom">
      <div className="container">
        <Link className="navbar-brand" to="/">Kids Notes</Link>
        <div className="ms-auto d-flex align-items-center">
          {user ? (
            <>
              <span className="me-3 text-muted">Hi, {user.name}</span>
              <button className="btn btn-outline-danger btn-sm" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <Link className="btn btn-outline-primary btn-sm" to="/">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
