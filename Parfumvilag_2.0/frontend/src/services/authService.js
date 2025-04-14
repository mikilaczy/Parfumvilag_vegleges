// frontend/src/services/authService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const register = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Regisztráció sikertelen!';
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Bejelentkezés sikertelen!';
  }
};