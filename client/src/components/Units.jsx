import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

const Units = () => {
  const [units, setUnits] = useState([]);
  const [nama, setNama] = useState("");
  const [editId, setEditId] = useState(null);

  const API_URL = "http://localhost:3000/units"; // Update the endpoint to match your API URL for units
  const token = localStorage.getItem("authToken");

  // Fetch units data
  const fetchUnits = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnits(response.data);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  // Handle adding a new unit
  const handleAddUnit = async () => {
    try {
      const response = await axios.post(
        API_URL,
        { nama },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnits([...units, response.data]);
      setNama("");
    } catch (error) {
      console.error("Error adding unit:", error);
    }
  };

  // Handle editing an existing unit
  const handleEditUnit = (unit) => {
    setEditId(unit.id);
    setNama(unit.nama);
  };

  // Handle updating the unit
  const handleUpdateUnit = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/${editId}`,
        { nama },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUnits(
        units.map((unit) => (unit.id === editId ? response.data : unit))
      );
      setEditId(null);
      setNama("");
    } catch (error) {
      console.error("Error updating unit:", error);
    }
  };

  // Handle deleting a unit
  const handleDeleteUnit = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnits(units.filter((unit) => unit.id !== id));
    } catch (error) {
      console.error("Error deleting unit:", error);
    }
  };

  // Fetch units data on component mount
  useEffect(() => {
    fetchUnits();
  }, []);

  // Define columns for the DataTable
  const columns = [
    {
      name: "ID",
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: "Name",
      selector: (row) => row.nama,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditUnit(row)}
            className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteUnit(row.id)}
            className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-700">Manage Units</h1>
      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Enter unit name"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
        />
        {editId ? (
          <button
            onClick={handleUpdateUnit}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Update
          </button>
        ) : (
          <button
            onClick={handleAddUnit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add
          </button>
        )}
      </div>

      {/* DataTable */}
      <DataTable
        title="Unit List"
        columns={columns}
        data={units}
        pagination
        highlightOnHover
        striped
        responsive
        className="rounded-lg border border-gray-300"
      />
    </div>
  );
};

export default Units;
