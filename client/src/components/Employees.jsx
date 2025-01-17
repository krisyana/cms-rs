import React, { useState, useEffect } from "react";
import {
  fetchUnits,
  createUnit,
  deleteUnit,
  fetchJabatans,
  createJabatan,
  fetchemployees,
  createEmployee,
} from "../api";
import AsyncCreatableSelect from "react-select/async-creatable";
import DataTable from "react-data-table-component";

const Employee = () => {
  const [employess, setEmployees] = useState([]);
  const [jabatans, setJabatans] = useState([]);
  const [units, setUnits] = useState([]);

  const [newEmployee, setNewEmployee] = useState({
    nama: "",
    username: "",
    password: "",
    unitName: "",
    jabatan: [],
    tanggalBergabung: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      const [employeeData, UnitsData, jabatansData] = await Promise.all([
        fetchemployees(),
        fetchUnits(),
        fetchJabatans(),
      ]);
      setEmployees(employeeData.data);
      setJabatans(
        jabatansData.data.map((jabatan) => ({
          value: jabatan.id,
          label: jabatan.nama,
        }))
      );
      setUnits(
        UnitsData.data.map((unit) => ({
          value: unit.id,
          label: unit.nama,
        }))
      );
      setLoading(false);
    };
    loadInitialData();
  }, []);

  const handleCreate = async () => {
    const { data } = await createEmployee(newEmployee);
    setEmployees([...employess, data]);
    setNewEmployee({
      nama: "",
      username: "",
      password: "",
      unitName: "",
      jabatan: [],
      tanggalBergabung: "",
    });
  };

  const handleDelete = async (id) => {
    await deleteUnit(id);
    setEmployees(employess.filter((unit) => unit.id !== id));
  };

  const handleJabatanCreate = async (inputValue) => {
    const { data } = await createJabatan({ nama: inputValue });
    const newJabatanOption = { value: data.id, label: data.nama };
    setJabatans([...jabatans, newJabatanOption]);
    return newJabatanOption;
  };

  const handleUnitCreate = async (inputValue) => {
    const { data } = await createUnit({ nama: inputValue });
    const newJabatanOption = { value: data.nama, label: data.nama };
    setJabatans([...jabatans, newJabatanOption]);
    return newJabatanOption;
  };

  const columns = [
    { name: "Name", selector: (row) => row.nama, sortable: true },
    { name: "Username", selector: (row) => row.username, sortable: true },
    { name: "Unit", selector: (row) => row.unitName, sortable: true },
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
        <h2 className="text-2xl font-bold mb-6">Manage employess</h2>

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
            value={newEmployee.nama}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, nama: e.target.value })
            }
            className="border border-gray-300 rounded-lg p-2"
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={newEmployee.username}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, username: e.target.value })
            }
            className="border border-gray-300 rounded-lg p-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={newEmployee.password}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, password: e.target.value })
            }
            className="border border-gray-300 rounded-lg p-2"
            required
          />
          <AsyncCreatableSelect
            isMulti
            options={jabatans}
            value={newEmployee.jabatan}
            onChange={(selected) =>
              setNewEmployee({ ...newEmployee, jabatan: selected })
            }
            onCreateOption={async (inputValue) => {
              // Only create a new jabatan if inputValue is not empty
              if (inputValue.trim()) {
                const newOption = await handleJabatanCreate(inputValue);
                setNewEmployee({
                  ...newEmployee,
                  jabatan: [...newEmployee.jabatan, newOption],
                });
              }
            }}
            className="border border-gray-300 rounded-lg"
            placeholder="Select or create Jabatans"
            isClearable
            isSearchable
            noOptionsMessage={() => "No results found"}
            createOptionPosition="first"
            getNewOptionData={(inputValue) => inputValue} // Provides the input text for new option
          />
          <AsyncCreatableSelect
            options={units}
            value={newEmployee.unit}
            onChange={(selected) =>
              setNewEmployee({ ...newEmployee, unitName: selected })
            }
            onCreateOption={async (inputValue) => {
              // Only create a new unit if inputValue is not empty
              if (inputValue.trim()) {
                await handleUnitCreate(inputValue);
                setNewEmployee({
                  ...newEmployee,
                  unitName: inputValue,
                });
              }
            }}
            className="border border-gray-300 rounded-lg"
            placeholder="Select or create Unit"
            isClearable
            isSearchable
            noOptionsMessage={() => "No results found"}
            createOptionPosition="first"
            getNewOptionData={(inputValue) => inputValue} // Provides the input text for new option
          />
          <input
            type="date"
            value={newEmployee.tanggalBergabung}
            onChange={(e) =>
              setNewEmployee({
                ...newEmployee,
                tanggalBergabung: e.target.value,
              })
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
          data={employess}
          progressPending={loading}
          pagination
          className="border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  );
};

export default Employee;
