import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/brands"; // Ellenőrizd a portot
export const getAllBrands = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/all`);
    return response.data;
  } catch (error) {
    throw new Error("Nem sikerült betölteni a márkákat!");
  }
};

const getBrandById = async (id) => {
  try {
    const response = await axios.get(`/api/brands/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const createBrand = async (brand) => {
  try {
    const response = await axios.post("/api/brands", brand);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const updateBrand = async (id, brand) => {
  try {
    const response = await axios.put(`/api/brands/${id}`, brand);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const deleteBrand = async (id) => {
  try {
    const response = await axios.delete(`/api/brands/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export { getBrandById, createBrand, updateBrand, deleteBrand };
