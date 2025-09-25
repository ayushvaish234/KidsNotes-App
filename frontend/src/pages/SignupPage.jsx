import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function SignupPage() {
  // State for form fields
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPass, setParentPass] = useState("");
  const [parentPassConfirm, setParentPassConfirm] = useState("");
  const navigate = useNavigate();

  // Handle signup form submission
  const handleSignup = async (e) => {
    e.preventDefault();

    if (parentPass !== parentPassConfirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/signup",
        { username: parentName, email: parentEmail, password: parentPass, role: "parent" },
        { headers: { "Content-Type": "application/json" } }
      );
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert("Signup failed: " + (err.response?.data?.detail || ""));
    }
  };

  // Signup form UI
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <form onSubmit={handleSignup} className="p-5 rounded shadow" style={{ width: "350px" }}>
        <h2 className="text-center mb-4">Signup (Parent)</h2>

        <input
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
          placeholder="Username"
          className="form-control mb-3"
          required
        />
        <input
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
          placeholder="Email"
          className="form-control mb-3"
          required
        />
        <input
          type="password"
          value={parentPass}
          onChange={(e) => setParentPass(e.target.value)}
          placeholder="Password"
          className="form-control mb-3"
          required
        />
        <input
          type="password"
          value={parentPassConfirm}
          onChange={(e) => setParentPassConfirm(e.target.value)}
          placeholder="Confirm Password"
          className="form-control mb-3"
          required
        />

        <button type="submit" className="btn w-100 fw-bold" style={{ backgroundColor: "#FAB12F", color: "#fff" }}>
          Signup
        </button>

        <div className="text-center mt-3">
          <Link to="/login" style={{ color: "#FAB12F", fontWeight: "bold" }}>
            Already have an account? Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default SignupPage;
