// frontend/src/services/reviewService.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api"; // Vagy a te URL-ed

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return { headers: { "x-auth-token": token } };
};

// Értékelések lekérése egy adott parfümhöz
export const getReviewsForPerfume = async (perfumeId) => {
  try {
    // Nem szükséges auth ehhez az endpoint-hoz, ha publikusak az értékelések
    const response = await axios.get(
      `${API_BASE_URL}/reviews/perfume/${perfumeId}`
    );
    return response.data; // Visszaadja az értékelések tömbjét
  } catch (error) {
    console.error(
      `Error fetching reviews for perfume ${perfumeId}:`,
      error.response?.data || error.message
    );
    throw (
      error.response?.data ||
      new Error("Nem sikerült lekérni az értékeléseket.")
    );
  }
};

// Új értékelés létrehozása
export const createReview = async (perfumeId, reviewData) => {
  const config = getAuthConfig();
  if (!config) throw new Error("Bejelentkezés szükséges az értékeléshez.");

  // Küldendő adatok (backend controller elvárásai szerint)
  const dataToSend = {
    scent_trail_rating: reviewData.sillage, // Map frontend state to backend names
    longevity_rating: reviewData.longevity,
    value_rating: reviewData.value,
    overall_impression: reviewData.overall,
    review_text: reviewData.comment,
  };

  try {
    const response = await axios.post(
      `${API_BASE_URL}/reviews/perfume/${perfumeId}`,
      dataToSend,
      config
    );
    return response.data; // { success: true, message: '...', review: {...} }
  } catch (error) {
    console.error(
      "Error creating review:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || new Error("Nem sikerült elküldeni az értékelést.")
    );
  }
};

// Értékelés frissítése (ha kell)
export const updateReview = async (reviewId, reviewData) => {
  const config = getAuthConfig();
  if (!config) throw new Error("Bejelentkezés szükséges.");

  const dataToSend = {
    scent_trail_rating: reviewData.sillage,
    longevity_rating: reviewData.longevity,
    value_rating: reviewData.value,
    overall_impression: reviewData.overall,
    review_text: reviewData.comment,
  };

  try {
    const response = await axios.put(
      `${API_BASE_URL}/reviews/${reviewId}`,
      dataToSend,
      config
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error updating review ${reviewId}:`,
      error.response?.data || error.message
    );
    throw (
      error.response?.data ||
      new Error("Nem sikerült frissíteni az értékelést.")
    );
  }
};

// Értékelés törlése (ha kell)
export const deleteReview = async (reviewId) => {
  const config = getAuthConfig();
  if (!config) throw new Error("Bejelentkezés szükséges.");

  try {
    const response = await axios.delete(
      `${API_BASE_URL}/reviews/${reviewId}`,
      config
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting review ${reviewId}:`,
      error.response?.data || error.message
    );
    throw (
      error.response?.data || new Error("Nem sikerült törölni az értékelést.")
    );
  }
};

// Nincs szükség getAllReviews, getReviewById frontend service-re általában,
// hacsak nincs szerkesztés/törlés funkció.
