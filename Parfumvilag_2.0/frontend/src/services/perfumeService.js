import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const getAllPerfumes = async ({
  query = "",
  brand = "",
  note = "",
  gender = "",
  sort = "name-asc",
  min_price, // Add min_price
  max_price, // Add max_price
  page = 1,
  per_page = 24,
}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/perfumes/all`, {
      params: {
        query,
        brand,
        note,
        gender,
        sort,
        min_price,
        max_price,
        page,
        per_page,
      }, // <-- Javított formázás
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      "Nem sikerült betölteni a parfümök listáját!";
    console.error("Hiba a getAllPerfumes-ben:", errorMessage);
    throw new Error(errorMessage);
  }
};
export const getRandomPerfumes = async (limit = 5) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/perfumes/random`, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching random perfumes:",
      error.response?.data || error.message
    );
    throw new Error("Nem sikerült betölteni a véletlen parfümöket.");
  }
};
export const getFeaturedPerfumes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/perfumes/featured`);
    console.log("API válasz (getFeaturedPerfumes):", response.data); // Ellenőrzés
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      "Nem sikerült betölteni a kiemelt parfümök listáját!";
    console.error("Hiba a getFeaturedPerfumes-ben:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const getPerfumeById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/perfumes/${id}`);
    console.log("API válasz (getPerfumeById):", response.data); // Ellenőrzés
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || "Parfüm nem található!";
    console.error("Hiba a getPerfumeById-ben:", errorMessage);
    throw new Error(errorMessage);
  }
};
export const toggleFavorite = async (perfumeId) => {
  try {
    const response = await axios.post(
      "/api/favorites/toggle",
      { perfume_id: perfumeId },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
export const getPriceRange = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/perfumes/price-range`);
    return response.data; // { minPrice: number, maxPrice: number }
  } catch (error) {
    console.error("Error fetching price range:", error);
    // Return default or throw
    return { minPrice: 0, maxPrice: 100000 }; // Default fallback
    // throw new Error("Nem sikerült lekérni az árintervallumot.");
  }
};
