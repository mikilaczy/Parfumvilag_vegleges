const { queryAsync } = require("./User"); // Használjuk a promisify helper-t

// Adott parfüm összes értékelésének lekérése, felhasználó nevével együtt
const getReviewsByPerfumeId = async (perfumeId) => {
  const sql = `
    SELECT r.*, u.name as author
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.perfume_id = ?
    ORDER BY r.created_at DESC
  `;
  return queryAsync(sql, [perfumeId]);
};

// Értékelés létrehozása
const createReview = async (reviewData) => {
  // Itt jönne a validáció (pl. hogy a ratingek 1-5 között vannak-e), bár a DB constraint is segít
  const {
    perfume_id,
    user_id,
    scent_trail_rating, // DB oszlop nevek
    longevity_rating,
    value_rating,
    overall_impression, // DB oszlop név
    review_text,
  } = reviewData;

  // Ellenőrizzük, hogy a kötelező mezők megvannak-e
  if (
    !perfume_id ||
    !user_id ||
    scent_trail_rating == null ||
    longevity_rating == null ||
    value_rating == null ||
    overall_impression == null
  ) {
    throw new Error("Hiányzó adatok az értékelés létrehozásához.");
  }

  // Ellenőrizzük a rating értékeket (opcionális, a DB is ellenőrzi)
  const ratings = [
    scent_trail_rating,
    longevity_rating,
    value_rating,
    overall_impression,
  ];
  if (ratings.some((r) => r < 1 || r > 5)) {
    throw new Error("Az értékeléseknek 1 és 5 között kell lenniük.");
  }

  const sql = `
    INSERT INTO reviews
    (perfume_id, user_id, scent_trail_rating, longevity_rating, value_rating, overall_impression, review_text)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    perfume_id,
    user_id,
    scent_trail_rating,
    longevity_rating,
    value_rating,
    overall_impression,
    review_text || null, // Lehet üres
  ];
  return queryAsync(sql, params);
};

// Értékelés frissítése (ha szükséges)
const updateReview = async (id, userId, reviewData) => {
  // Ellenőrizzük, hogy a user frissítheti-e ezt a review-t
  // ... (logika itt) ...

  const {
    scent_trail_rating,
    longevity_rating,
    value_rating,
    overall_impression,
    review_text,
  } = reviewData;

  // Hasonló validáció, mint a createReview-ban

  const sql = `
        UPDATE reviews SET
        scent_trail_rating = ?,
        longevity_rating = ?,
        value_rating = ?,
        overall_impression = ?,
        review_text = ?
        WHERE id = ? AND user_id = ?
    `;
  const params = [
    scent_trail_rating,
    longevity_rating,
    value_rating,
    overall_impression,
    review_text || null,
    id,
    userId,
  ];
  return queryAsync(sql, params);
};

// Értékelés törlése (ha szükséges)
const deleteReview = async (id, userId) => {
  // Ellenőrizzük, hogy a user törölheti-e ezt a review-t
  // ... (logika itt) ...
  return queryAsync("DELETE FROM reviews WHERE id = ? AND user_id = ?", [
    id,
    userId,
  ]);
};

// Egy adott értékelés lekérése ID alapján (pl. szerkesztéshez)
const getReviewById = async (id) => {
  const results = await queryAsync("SELECT * FROM reviews WHERE id = ?", [id]);
  return results.length > 0 ? results[0] : null;
};

module.exports = {
  getReviewsByPerfumeId,
  createReview,
  updateReview,
  deleteReview,
  getReviewById,
  // getAllReviews valószínűleg nem kell
};
