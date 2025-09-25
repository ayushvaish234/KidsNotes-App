// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./Header";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./PrivateRoute";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<h2 className="text-center mt-5">Page Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
