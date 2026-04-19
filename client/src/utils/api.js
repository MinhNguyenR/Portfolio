import axios from 'axios';

const api = axios.create({
  // Ưu tiên biến môi trường, sau đó đến URL production bạn đã cung cấp, cuối cùng mới là path tương đối
  baseURL: import.meta.env.VITE_API_URL || 'https://portfolio-7aa9.onrender.com/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
