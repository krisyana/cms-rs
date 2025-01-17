import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">Dashboard</h1>
      <nav className="bg-white shadow-md rounded-md p-4 w-full max-w-md mb-8">
        <ul className="flex flex-col space-y-4">
          <li>
            <Link
              to="/employees"
              className="block px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-md"
            >
              Manage Employees
            </Link>
          </li>
          <li>
            <Link
              to="/units"
              className="block px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-md"
            >
              Manage Units
            </Link>
          </li>
          <li>
            <Link
              to="/jabatans"
              className="block px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-md"
            >
              Manage Jabatans
            </Link>
          </li>
          <li>
            <Link
              to="/stats"
              className="block px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-md"
            >
              View Stats
            </Link>
          </li>
        </ul>
      </nav>
      <button
        onClick={handleLogout}
        className="px-6 py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
