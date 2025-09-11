import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'https://crm-88d6.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
  Add a request interceptor to include the token in headers for every request.
  This is how the backend will know the user is authenticated.
*/
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;