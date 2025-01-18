import React from "react";
import { useNavigate } from "react-router-dom";

const Topbar = ({ title }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    navigate("/"); // Redirect to login page
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard"); // Redirect to dashboard
  };

  return (
    <div className="flex justify-between items-center bg-gray-100 p-4 rounded-md shadow-md mb-6">
      <button
        onClick={handleBackToDashboard}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        Back to Dashboard
      </button>
      <h1 className="text-lg font-semibold text-gray-700">{title}</h1>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default Topbar;
