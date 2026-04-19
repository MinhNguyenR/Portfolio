import axios from 'axios';

const getBaseURL = () => {
  let envUrl = import.meta.env.VITE_API_URL || 'https://portfolio-7aa9.onrender.com/api';
  // Xóa dấu gạch chéo thừa ở cuối nếu có
  envUrl = envUrl.replace(/\/+$/, '');
  
  // Đảm bảo luôn kết thúc bằng /api
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export default api;
