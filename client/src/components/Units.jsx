import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { createUnit, deleteUnit, fetchUnits, updateUnit } from "../api";
import Topbar from "./Topbar";

const Units = () => {
  const [units, setUnits] = useState([]);
  const [nama, setNama] = useState("");
  const [editId, setEditId] = useState(null);

  // Fetch units data
  const handleFetchUnits = async () => {
    try {
      const response = await fetchUnits();
      setUnits(response.data);
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  };

  // Handle adding a new unit
  const handleAddUnit = async () => {
    try {
      const response = await createUnit({ nama });
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
      const response = await updateUnit(editId, { nama });
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
      await deleteUnit(id);
      setUnits(units.filter((unit) => unit.id !== id));
    } catch (error) {
      console.error("Error deleting unit:", error);
    }
  };

  // Fetch units data on component mount
  useEffect(() => {
    handleFetchUnits();
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
        <div className="flex space-x-2 w-70">
          <button
            onClick={() => handleEditUnit(row)}
            className="px-2 text-sm py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteUnit(row.id)}
            className="px-2 text-sm py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "200px",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <Topbar />

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
