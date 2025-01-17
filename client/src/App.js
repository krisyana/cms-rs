import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Units from "./components/Units";
import Stats from "./components/Stats";
import Jabatans from "./components/Jabatans";
import Employee from "./components/Employees";

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/units" element={<Units />} />
      <Route path="/employees" element={<Employee />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/jabatans" element={<Jabatans />} />
    </Routes>
  </Router>
);

export default App;
