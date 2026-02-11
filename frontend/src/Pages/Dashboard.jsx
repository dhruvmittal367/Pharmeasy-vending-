import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("");
    navigate("/");
  };

  return (
    <div className="dashboard">
      <h2>Admin Dashboard</h2>

      <div className="menu">
        <button onClick={() => navigate("/users")}>User Management</button>

                <button onClick={() => navigate("/medicine")}>Medicine & OTC Rules</button>
                <button onClick={() => alert("Coming Soon")}>Brand → Generic</button>
                <button onClick={() => alert("Coming Soon")}>Pricing Management</button>
                <button onClick={() => alert("Coming Soon")}>Sales & Reports</button>
                <button onClick={() => alert("Coming Soon")}>System Configuration</button>

      </div>

      <button className="logout" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;
