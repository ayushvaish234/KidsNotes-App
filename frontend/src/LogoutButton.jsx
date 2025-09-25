import React from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <button
      className="btn"
      style={{ backgroundColor: "#FAB12F", color: "#fff" }}
      onClick={handleLogout}
    >
      Logout
    </button>
  );
}
