import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // .env에서 설정
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;