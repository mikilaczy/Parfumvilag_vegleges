// frontend/src/services/savedPerfumeService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // Vagy ahogy nálad van

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No auth token found");
    // Itt akár hibát is dobhatnánk, vagy null-t adunk vissza,
    // hogy a hívó tudja kezelni a be nem jelentkezett állapotot.
    return null;
  }
  return {
    headers: { "x-auth-token": token }, // Vagy 'Authorization': `Bearer ${token}` a backend beállítástól függően
  };
};

// Felhasználó kedvenc parfüm ID-inak lekérése
export const getMyFavoriteIds = async () => {
  const config = getAuthConfig();
  if (!config) throw new Error("Bejelentkezés szükséges.");

  try {
    const response = await axios.get(`${API_BASE_URL}/saved-perfumes`, config);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching favorite IDs:",
      error.response?.data || error.message // Logolás marad
    );
    // Dobd tovább az error.response?.data objektumot, ha van, különben egy új Error-t
    throw (
      error.response?.data || new Error("Nem sikerült lekérni a kedvenceket.")
    );
  }
};

// Kedvenc hozzáadása
export const addFavorite = async (perfumeId) => {
  const config = getAuthConfig();
  if (!config) throw new Error("Bejelentkezés szükséges.");

  try {
    const response = await axios.post(
      `${API_BASE_URL}/saved-perfumes`,
      { perfume_id: perfumeId },
      config
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error adding favorite:",
      error.response?.data || error.message
    );
    // Dobd tovább a backend hibát vagy egy újat
    throw (
      error.response?.data ||
      new Error("Nem sikerült hozzáadni a kedvencekhez.")
    );
  }
};

// Kedvenc eltávolítása
export const removeFavorite = async (perfumeId) => {
  const config = getAuthConfig();
  if (!config) throw new Error("Bejelentkezés szükséges.");

  try {
    const response = await axios.delete(
      `${API_BASE_URL}/saved-perfumes/${perfumeId}`,
      config
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error removing favorite:",
      error.response?.data || error.message
    );
    // Dobd tovább a backend hibát vagy egy újat
    throw (
      error.response?.data ||
      new Error("Nem sikerült eltávolítani a kedvencekből.")
    );
  }
};

// Kedvenc parfümök teljes adatainak lekérése (ha szükséges a Favorites oldalon)
export const getMyFavoritePerfumesDetails = async () => {
  const config = getAuthConfig(); // Still need token to get IDs first
  if (!config) throw new Error("Bejelentkezés szükséges.");

  try {
    const favoriteIds = await getMyFavoriteIds(); // Fetches IDs for the user
    console.log("Fetched favorite IDs for batch:", favoriteIds);

    if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) {
      return [];
    }

    // Use the new batch endpoint
    const response = await axios.get(`${API_BASE_URL}/perfumes/batch`, {
      params: { ids: favoriteIds.join(",") }, // Send IDs as comma-separated string
      // No auth config needed here if the /batch endpoint is public
    });

    console.log("Batch fetch results:", response.data);
    return response.data || []; // Return the array of perfume objects
  } catch (error) {
    console.error(
      "Error fetching favorite perfume details (batch):",
      error.response?.data || error.message
    );
    throw (
      error.response?.data ||
      new Error("Nem sikerült lekérni a kedvenc parfümök adatait.")
    );
  }
};
