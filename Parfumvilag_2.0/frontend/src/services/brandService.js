import axios from "axios";

// Márkákkal kapcsolatos API végpontok alap URL-je
const API_BASE_URL = "http://localhost:5000/api/brands";

// Összes márka lekérdezése a backendtől
export const getAllBrands = async () => {
  try {
    // GET kérés küldése az '/all' végpontra
    const response = await axios.get(`${API_BASE_URL}/all`);
    // Sikeres válasz esetén visszaadja a kapott adatokat (márkák listája)
    return response.data;
  } catch (error) {
    // Hiba esetén egy általános hibaüzenetet dob
    throw new Error("Nem sikerült betölteni a márkákat!");
  }
};

// Egy specifikus márka lekérdezése ID alapján
const getBrandById = async (id) => {
  try {
    // GET kérés küldése a '/api/brands/:id' végpontra (Figyelem: az URL relatív, lehet, hogy API_BASE_URL kellene ide)
    const response = await axios.get(`/api/brands/${id}`);
    // Visszaadja a kapott márka adatokat
    return response.data;
  } catch (error) {
    // Hiba esetén továbbdobja a szerver által küldött hibaadatokat
    throw error.response.data;
  }
};

// Új márka létrehozása
const createBrand = async (brand) => {
  try {
    // POST kérés küldése a '/api/brands' végpontra az új márka adataival (Figyelem: relatív URL)
    const response = await axios.post("/api/brands", brand);
    // Visszaadja a létrehozott márka adatait (általában ID-val kiegészítve)
    return response.data;
  } catch (error) {
    // Hiba esetén továbbdobja a szerver által küldött hibaadatokat
    throw error.response.data;
  }
};

// Meglévő márka frissítése ID alapján
const updateBrand = async (id, brand) => {
  try {
    // PUT kérés küldése a '/api/brands/:id' végpontra a frissítendő adatokkal (Figyelem: relatív URL)
    const response = await axios.put(`/api/brands/${id}`, brand);
    // Visszaadja a frissített márka adatait
    return response.data;
  } catch (error) {
    // Hiba esetén továbbdobja a szerver által küldött hibaadatokat
    throw error.response.data;
  }
};

// Márka törlése ID alapján
const deleteBrand = async (id) => {
  try {
    // DELETE kérés küldése a '/api/brands/:id' végpontra (Figyelem: relatív URL)
    const response = await axios.delete(`/api/brands/${id}`);
    // Visszaadja a szerver válaszát (pl. sikerüzenet)
    return response.data;
  } catch (error) {
    // Hiba esetén továbbdobja a szerver által küldött hibaadatokat
    throw error.response.data;
  }
};

export { getBrandById, createBrand, updateBrand, deleteBrand };
