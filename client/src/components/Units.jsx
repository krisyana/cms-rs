import React, { useState, useEffect } from "react";
import {
  fetchUnits,
  createUnit,
  deleteUnit,
  fetchJabatans,
  createJabatan,
} from "../api";
import Select from "react-select";
import DataTable from "react-data-table-component";

const Units = () => {
  const [units, setUnits] = useState([]);
  const [jabatans, setJabatans] = useState([]);
  const [newUnit, setNewUnit] = useState({
    nama: "",
    username: "",
    password: "",
    unit: "",
    jabatan: [],
    tanggalBergabung: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const [unitsData, jabatansData] = await Promise.all([
        fetchUnits(),
        fetchJabatans(),
      ]);
      setUnits(unitsData.data);
      setJabatans(
        jabatansData.data.map((jabatan) => ({
          value: jabatan.id,
          label: jabatan.nama,
        }))
      );
      setLoading(false);
    };
    loadInitialData();
  }, []);

  const handleCreate = async () => {
    const { data } = await createUnit(newUnit);
    setUnits([...units, data]);
    setNewUnit({
      nama: "",
      username: "",
      password: "",
      unit: "",
      jabatan: [],
      tanggalBergabung: "",
    });
  };

  const handleDelete = async (id) => {
    await deleteUnit(id);
    setUnits(units.filter((unit) => unit.id !== id));
  };

  const handleJabatanCreate = async (inputValue) => {
    const { data } = await createJabatan({ nama: inputValue });
    const newJabatanOption = { value: data.id, label: data.nama };
    setJabatans([...jabatans, newJabatanOption]);
    return newJabatanOption;
  };

  const columns = [
    { name: "Name", selector: (row) => row.nama, sortable: true },
    { name: "Username", selector: (row) => row.username, sortable: true },
    { name: "Unit", selector: (row) => row.unit, sortable: true },
    {
      name: "Jabatan",
      cell: (row) => {
        // Check if jabatan is a string and try to parse it into an array
        let jabatanArray = row.jabatan;
        if (typeof jabatanArray === "string") {
          try {
            jabatanArray = JSON.parse(jabatanArray);
          } catch (error) {
            console.error("Error parsing jabatan:", error);
          }
        }

        return Array.isArray(jabatanArray) ? (
          <div className="space-y-1 py-1">
            {jabatanArray.map((jabatanItem, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-800 p-2 rounded-md shadow-sm"
              >
                {jabatanItem}
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-700">{jabatanArray}</span> // Fallback if jabatan isn't an array
        );
      },
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => handleDelete(row.id)}
          className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Manage Units</h2>

        <form
          className="mb-6 grid grid-cols-1 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <input
            type="text"
            placeholder="Name"
            value={newUnit.nama}
            onChange={(e) => setNewUnit({ ...newUnit, nama: e.target.value })}
            className="border border-gray-300 rounded-lg p-2"
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={newUnit.username}
            onChange={(e) =>
              setNewUnit({ ...newUnit, username: e.target.value })
            }
            className="border border-gray-300 rounded-lg p-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newUnit.password}
            onChange={(e) =>
              setNewUnit({ ...newUnit, password: e.target.value })
            }
            className="border border-gray-300 rounded-lg p-2"
            required
          />
          <input
            type="text"
            placeholder="Unit"
            value={newUnit.unit}
            onChange={(e) => setNewUnit({ ...newUnit, unit: e.target.value })}
            className="border border-gray-300 rounded-lg p-2"
            required
          />
          <Select
            isMulti
            options={jabatans}
            value={newUnit.jabatan}
            onChange={(selected) =>
              setNewUnit({ ...newUnit, jabatan: selected })
            }
            onCreateOption={async (inputValue) => {
              // Only create a new jabatan if inputValue is not empty
              if (inputValue.trim()) {
                const newOption = await handleJabatanCreate(inputValue);
                setNewUnit({
                  ...newUnit,
                  jabatan: [...newUnit.jabatan, newOption],
                });
              }
            }}
            className="border border-gray-300 rounded-lg"
            placeholder="Select or create Jabatans"
            isClearable
            isSearchable
            noOptionsMessage={() => "No results found"}
            createOptionPosition="first" // Ensures new option is added first
            getNewOptionData={(inputValue) => inputValue} // Provides the input text for new option
          />
          <input
            type="date"
            value={newUnit.tanggalBergabung}
            onChange={(e) =>
              setNewUnit({ ...newUnit, tanggalBergabung: e.target.value })
            }
            className="border border-gray-300 rounded-lg p-2"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Unit
          </button>
        </form>

        <DataTable
          columns={columns}
          data={units}
          progressPending={loading}
          pagination
          className="border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  );
};

export default Units;
