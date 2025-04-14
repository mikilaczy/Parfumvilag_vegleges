// frontend/src/services/userService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000"; // Próbáld meg így?

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("userService: No auth token found");
    return null;
  }
  return {
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": token,
    },
  };
};

export const getUser = async () => {
  const config = getAuthConfig();
  console.log("[getUser] Fetching...");
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/users/me`,
      config || {}
    ); // Teljes útvonal
    console.log("[getUser] Success:", response.data);
    return response.data;
  } catch (error) {
    console.error("[getUser] Error:", error.response?.data || error.message);
    // Dobd tovább a hibát
    throw (
      error.response?.data ||
      new Error(
        error.message || "Nem sikerült betölteni a felhasználó adatait!"
      )
    );
  }
};

export const updateUser = async (userData) => {
  const config = getAuthConfig();
  if (!config) {
    console.error("[updateUser] Auth config failed.");
    throw new Error("Nem sikerült hitelesíteni a felhasználót a frissítéshez.");
  }

  console.log(
    "[updateUser] Attempting PUT request to:",
    `${API_BASE_URL}/users/me`
  );
  console.log("[updateUser] Sending data:", userData);
  console.log("[updateUser] Using config:", config);

  try {
    const response = await axios.put(
      `${API_BASE_URL}/api/users/me`,
      userData,
      config
    ); // Teljes útvonal
    console.log(
      "[updateUser] PUT Request successful! Response status:",
      response.status
    );
    console.log("[updateUser] Response data:", response.data);
    // Fontos: A Promise itt resolve-olódik
    return response.data; // Visszaadjuk a választ
  } catch (error) {
    console.error("[updateUser] PUT Request failed!");
    console.error("[updateUser] Error status:", error.response?.status);
    console.error("[updateUser] Error data:", error.response?.data);
    console.error("[updateUser] Full error:", error);
    // Fontos: A Promise itt reject-elődni fog
    throw new Error(
      error.response?.data?.error ||
        "Nem sikerült frissíteni a felhasználói adatokat!"
    );
  }
};
