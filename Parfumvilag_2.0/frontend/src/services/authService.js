import axios from "axios";

// API végpont alap URL-je (környezeti változóban lenne jobb tárolni)
const API_BASE_URL = "http://localhost:5000/api";

// Regisztrációs API hívást végző aszinkron függvény
// Paraméterek: name (név), email, password
export const register = async (name, email, password) => {
  try {
    // POST kérés küldése a '/auth/register' végpontra a megadott adatokkal
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      name,
      email,
      password,
    });
    // Sikeres válasz esetén visszaadja a szerver által küldött adatokat (pl. felhasználó adatai, token)
    return response.data;
  } catch (error) {
    // Hiba esetén megpróbálja kinyerni a szerver specifikus hibaüzenetét,
    // vagy egy általános hibaüzenetet dob tovább a hívó felé.
    throw error.response?.data?.error || "Regisztráció sikertelen!";
  }
};

// Bejelentkezési API hívást végző aszinkron függvény
// Paraméterek: email, password
export const login = async (email, password) => {
  try {
    // POST kérés küldése a '/auth/login' végpontra a megadott adatokkal
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    // Sikeres válasz esetén visszaadja a szerver által küldött adatokat (pl. felhasználó adatai, token)
    return response.data;
  } catch (error) {
    // Hiba esetén megpróbálja kinyerni a szerver specifikus hibaüzenetét,

    throw error.response?.data?.error || "Bejelentkezés sikertelen!";
  }
};
