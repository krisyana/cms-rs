import React, { useState, useEffect } from "react";
import { fetchStats } from "../api";
import DataTable from "react-data-table-component";

const Stats = () => {
  const [stats, setStats] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStats = async () => {
      const { data } = await fetchStats();
      setStats(data);
      setFilteredData(data.topLoginUsers); // Default to full dataset
      setLoading(false);
    };
    getStats();
  }, []);

  const handleFilter = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    const filtered = stats.topLoginUsers.filter((user) => {
      const loginDate = new Date(user.loginDate); // Assuming `loginDate` is part of `topLoginUsers`
      const start = new Date(startDate);
      const end = new Date(endDate);
      return loginDate >= start && loginDate <= end;
    });

    setFilteredData(filtered);
  };

  const columns = [
    {
      name: "Unit ID",
      selector: (row) => row.unitId,
      sortable: true,
    },
    {
      name: "Logins",
      selector: (row) => row.loginCount,
      sortable: true,
    },
    {
      name: "Last Login Date",
      selector: (row) => row.loginDate,
      sortable: true,
      format: (row) => new Date(row.loginDate).toLocaleDateString(), // Format date
    },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-500 text-lg">Loading stats...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Statistics
        </h2>
        <div className="mb-6">
          <p className="text-lg text-gray-700">
            <span className="font-semibold">Total Units:</span>{" "}
            {stats.unitCount}
          </p>
          <p className="text-lg text-gray-700">
            <span className="font-semibold">Total Jabatans:</span>{" "}
            {stats.jabatanCount}
          </p>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Top Login Users
        </h3>

        {/* Date Range Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-end">
          <div className="flex flex-col">
            <label htmlFor="startDate" className="text-sm text-gray-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="endDate" className="text-sm text-gray-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <button
            onClick={handleFilter}
            className="bg-blue-500 items-end h-8 mb-2 px-4 text-sm text-indigo-100 transition-colors duration-150 bg-indigo-700 rounded-lg focus:shadow-outline hover:bg-indigo-800"
          >
            Filter
          </button>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredData}
          pagination
          responsive
          striped
          highlightOnHover
          className="rounded-lg border border-gray-300"
        />
      </div>
    </div>
  );
};

export default Stats;
