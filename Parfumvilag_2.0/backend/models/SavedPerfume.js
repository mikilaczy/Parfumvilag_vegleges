// backend/models/SavedPerfume.js
const { queryAsync } = require("./User"); // Használjuk a promisify helper-t

// Adott felhasználó összes kedvencének (perfume_id) lekérése
const getSavedPerfumesByUserId = async (userId) => {
  // Ensure no LIMIT clause here unless intended
  return queryAsync(
    "SELECT perfume_id FROM saved_perfumes WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  ); // Add ordering maybe
};

// Ellenőrzi, hogy egy adott parfüm kedvenc-e egy felhasználónál
const isPerfumeSaved = async (userId, perfumeId) => {
  const result = await queryAsync(
    "SELECT id FROM saved_perfumes WHERE user_id = ? AND perfume_id = ?",
    [userId, perfumeId]
  );
  return result.length > 0;
};

// Kedvenc létrehozása
const createSavedPerfume = async (userId, perfumeId) => {
  // Előbb ellenőrizzük, hogy nem létezik-e már
  const existing = await isPerfumeSaved(userId, perfumeId);
  if (existing) {
    // Már létezik, nem kell újra hozzáadni, visszaadhatunk egy jelzést vagy a meglévőt
    console.log(`Perfume ${perfumeId} already saved for user ${userId}`);
    return { affectedRows: 0, message: "Already saved" }; // Vagy dobhatunk hibát
  }
  return queryAsync(
    "INSERT INTO saved_perfumes (user_id, perfume_id) VALUES (?, ?)",
    [userId, perfumeId]
  );
};

// Kedvenc törlése perfume_id és user_id alapján
const deleteSavedPerfumeByPerfumeId = async (userId, perfumeId) => {
  return queryAsync(
    "DELETE FROM saved_perfumes WHERE user_id = ? AND perfume_id = ?",
    [userId, perfumeId]
  );
};

// (A régi ID alapján törlés megmaradhat, ha kell máshol)
const deleteSavedPerfumeById = async (id) => {
  return queryAsync("DELETE FROM saved_perfumes WHERE id = ?", [id]);
};

module.exports = {
  getSavedPerfumesByUserId,
  isPerfumeSaved,
  createSavedPerfume,
  deleteSavedPerfumeByPerfumeId,
  deleteSavedPerfumeById,
  // getAllSavedPerfumes, getSavedPerfumeById - valószínűleg nem kellenek globálisan
};
