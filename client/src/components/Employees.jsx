import React, { useState, useEffect } from "react";
import {
  fetchUnits,
  createUnit,
  fetchJabatans,
  createJabatan,
  fetchemployees,
  createEmployee,
  deleteEmployee,
  updateEmployee,
} from "../api";
import CreatableSelect from "react-select/creatable";
import DataTable from "react-data-table-component";
import Topbar from "./Topbar";

const Employee = () => {
  const [employees, setEmployees] = useState([]);
  const [jabatans, setJabatans] = useState([]);
  const [units, setUnits] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null); // Track the employee being edited

  const [newEmployee, setNewEmployee] = useState({
    nama: "",
    username: "",
    password: "",
    unitName: "",
    jabatan: [],
    tanggalBergabung: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingUnit, setLoadingUnit] = useState(false);
  const [loadingJab, setLoadingJab] = useState(false);

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
        jabatansData.data?.map((jabatan) => ({
          value: jabatan.nama,
          label: jabatan.nama,
        }))
      );
      setUnits(
        UnitsData.data?.map((unit) => ({
          value: unit.nama,
          label: unit.nama,
        }))
      );
      setLoading(false);
    };
    loadInitialData();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (editingEmployee) {
      // Update existing employee
      const updatedData = {
        ...newEmployee,
        id: editingEmployee.id,
        unitName: newEmployee.unitName?.value,
        jabatan: newEmployee.jabatan?.map((val) => val.value),
      };
      const { data } = await updateEmployee(updatedData.id, updatedData);
      setEmployees(employees.map((emp) => (emp.id === data.id ? data : emp)));
    } else {
      // Create new employee
      const { data } = await createEmployee({
        ...newEmployee,
        unitName: newEmployee.unitName?.value,
        jabatan: newEmployee.jabatan?.map((val) => val.value),
        tanggalBergabung: new Date(),
      });
      setEmployees([...employees, data]);
    }

    // Reset form and state
    setNewEmployee({
      nama: "",
      username: "",
      password: "",
      unitName: "",
      jabatan: [],
      tanggalBergabung: "",
    });
    setEditingEmployee(null);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      nama: employee.nama,
      username: employee.username,
      password: "", // Password will remain empty for security
      unitName: units.find((unit) => unit.value === employee.unitName),
      jabatan: employee.jabatans?.map((jabatan) => ({
        value: jabatan.nama,
        label: jabatan.nama,
      })),
      tanggalBergabung: employee.tanggalBergabung,
    });
  };

  const handleDelete = async (id) => {
    await deleteEmployee(id);
    setEmployees(employees.filter((unit) => unit.id !== id));
  };

  const handleJabatanCreate = async (inputValue) => {
    setLoadingJab(true);
    const { data } = await createJabatan({ nama: inputValue });
    const newJabatanOption = { value: data.nama, label: data.nama };
    setJabatans([...jabatans, newJabatanOption]);
    setLoadingJab(false);

    return newJabatanOption;
  };

  const handleUnitCreate = async (inputValue) => {
    setLoadingUnit(true);
    const { data } = await createUnit({ nama: inputValue });
    const newUnitOption = { value: data.nama, label: data.nama };
    setUnits([...units, newUnitOption]);
    setLoadingUnit(false);

    return data.nama;
  };

  const columns = [
    { name: "Name", selector: (row) => row.nama, sortable: true },
    { name: "Username", selector: (row) => row.username, sortable: true },
    { name: "Unit", selector: (row) => row.unitName, sortable: true },
    {
      name: "Jabatan",
      cell: (row) => {
        const jabatanArray = row.jabatans?.map((val) => val.nama);

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
          <span className="text-gray-700">{jabatanArray}</span>
        );
      },
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-white bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
        <Topbar />
        <h2 className="text-2xl font-bold mb-6">
          {editingEmployee ? "Edit Employee" : "Add Employee"}
        </h2>

        <form
          className="mb-6 grid grid-cols-1 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateOrUpdate();
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
          />
          <CreatableSelect
            isMulti
            isLoading={loadingJab}
            options={jabatans}
            value={newEmployee.jabatan}
            onChange={(selected) =>
              setNewEmployee({ ...newEmployee, jabatan: selected })
            }
            onCreateOption={async (inputValue) => {
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
          />
          <CreatableSelect
            options={units}
            isLoading={loadingUnit}
            value={newEmployee.unitName}
            onChange={(selected) => {
              setNewEmployee({ ...newEmployee, unitName: selected });
            }}
            onCreateOption={async (inputValue) => {
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
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editingEmployee ? "Update Employee" : "Add Employee"}
          </button>
        </form>

        <DataTable
          columns={columns}
          data={employees}
          progressPending={loading}
          pagination
          className="border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  );
};

export default Employee;
