import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/login",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("token", res.data.access_token);
      if (res.data.user) {
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("username", res.data.user.username);
      }
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#fff" }}
    >
      <form
        onSubmit={handleLogin}
        className="p-5 rounded shadow"
        style={{ width: "350px", backgroundColor: "#fff" }}
      >
        <h2 className="text-center mb-4" style={{ color: "#000" }}>
          Login
        </h2>
        <div className="mb-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="form-control"
            required
          />
        </div>
        <button
          type="submit"
          className="btn w-100 fw-bold"
          style={{ backgroundColor: "#FAB12F", color: "#fff" }}
        >
          Login
        </button>
        <div className="text-center mt-3">
          <Link to="/signup" style={{ color: "#FAB12F", fontWeight: "bold" }}>
            Don&apos;t have an account? Signup
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
