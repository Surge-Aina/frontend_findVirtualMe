import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API || "http://localhost:5000",
});

export default API;
