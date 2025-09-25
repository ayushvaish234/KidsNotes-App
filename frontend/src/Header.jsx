import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <nav
      className="navbar navbar-expand-lg shadow sticky-top"
      style={{ backgroundColor: "#FAB12F" }}
    >
      <div className="container">
        <Link
          className="navbar-brand fs-3 fw-bold mx-auto"
          to="/"
          style={{ color: "#000", fontFamily: "Arial, sans-serif" }}
        >
          KidsNotes App
        </Link>
      </div>
    </nav>
  );
}

export default Header;
