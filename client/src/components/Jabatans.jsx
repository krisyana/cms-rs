import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";

const Jabatans = () => {
  const [jabatans, setJabatans] = useState([]);
  const [nama, setNama] = useState("");
  const [editId, setEditId] = useState(null);

  const API_URL = "http://localhost:3000/jabatan";
  const token = localStorage.getItem("authToken");

  const fetchJabatans = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJabatans(response.data);
    } catch (error) {
      console.error("Error fetching jabatans:", error);
    }
  };

  const handleAddJabatan = async () => {
    try {
      const response = await axios.post(
        API_URL,
        { nama },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJabatans([...jabatans, response.data]);
      setNama("");
    } catch (error) {
      console.error("Error adding jabatan:", error);
    }
  };

  const handleEditJabatan = (jabatan) => {
    setEditId(jabatan.id);
    setNama(jabatan.nama);
  };

  const handleUpdateJabatan = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/${editId}`,
        { nama },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJabatans(
        jabatans.map((jabatan) =>
          jabatan.id === editId ? response.data : jabatan
        )
      );
      setEditId(null);
      setNama("");
    } catch (error) {
      console.error("Error updating jabatan:", error);
    }
  };

  const handleDeleteJabatan = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJabatans(jabatans.filter((jabatan) => jabatan.id !== id));
    } catch (error) {
      console.error("Error deleting jabatan:", error);
    }
  };

  useEffect(() => {
    fetchJabatans();
  }, []);

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
            onClick={() => handleEditJabatan(row)}
            className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteJabatan(row.id)}
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
      <h1 className="text-2xl font-bold mb-6 text-gray-700">Manage Jabatans</h1>
      <div className="flex space-x-4 mb-6">
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Enter jabatan name"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
        />
        {editId ? (
          <button
            onClick={handleUpdateJabatan}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Update
          </button>
        ) : (
          <button
            onClick={handleAddJabatan}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add
          </button>
        )}
      </div>

      {/* DataTable */}
      <DataTable
        title="Jabatan List"
        columns={columns}
        data={jabatans}
        pagination
        highlightOnHover
        striped
        responsive
        className="rounded-lg border border-gray-300"
      />
    </div>
  );
};

export default Jabatans;
