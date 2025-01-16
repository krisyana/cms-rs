import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000", // Your Express API URL
});

// Attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Auth endpoints
export const login = (credentials) => API.post("/login", credentials);

// Units endpoints
export const fetchUnits = () => API.get("/units");
export const createUnit = (unitData) => API.post("/units", unitData);
export const updateUnit = (id, unitData) => API.put(`/units/${id}`, unitData);
export const deleteUnit = (id) => API.delete(`/units/${id}`);

// Jabatan endpoints
export const fetchJabatans = () => API.get("/jabatan");
export const createJabatan = (jabatanData) => API.post("/jabatan", jabatanData);
export const updateJabatan = (id, jabatanData) =>
  API.put(`/jabatan/${id}`, jabatanData);
export const deleteJabatan = (id) => API.delete(`/jabatan/${id}`);

// Stats endpoint
export const fetchStats = (filters) => API.get("/stats", { params: filters });
