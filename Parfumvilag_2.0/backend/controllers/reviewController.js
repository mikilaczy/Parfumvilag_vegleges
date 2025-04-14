// backend/controllers/reviewController.js
const Review = require("../models/Review");

// Get all reviews for a specific perfume
exports.getReviewsForPerfume = async (req, res) => {
  const perfumeId = req.params.perfumeId; // Get perfumeId from URL
  if (!perfumeId) {
    return res.status(400).json({ error: "Hiányzó perfumeId!" });
  }

  try {
    const reviews = await Review.getReviewsByPerfumeId(parseInt(perfumeId, 10));
    res.status(200).json(reviews); // Send back the array of reviews
  } catch (err) {
    console.error(`Error fetching reviews for perfume ${perfumeId}:`, err);
    res
      .status(500)
      .json({ error: "Adatbázis hiba az értékelések lekérdezésekor." });
  }
};

// Create a new review for a specific perfume
exports.createReview = async (req, res) => {
  const userId = req.user.id; // From authMiddleware
  const perfumeId = req.params.perfumeId; // Get perfumeId from URL

  // Get review data from request body, matching DB column names
  const {
    scent_trail_rating, // Match DB column names
    longevity_rating,
    value_rating,
    overall_impression,
    review_text,
  } = req.body;

  // Basic validation
  if (
    scent_trail_rating == null ||
    longevity_rating == null ||
    value_rating == null ||
    overall_impression == null
  ) {
    return res
      .status(400)
      .json({ error: "Minden értékelési szempont (1-5) kitöltése kötelező!" });
  }
  // A text lehet üres

  const reviewData = {
    perfume_id: parseInt(perfumeId, 10),
    user_id: userId,
    scent_trail_rating: parseInt(scent_trail_rating, 10),
    longevity_rating: parseInt(longevity_rating, 10),
    value_rating: parseInt(value_rating, 10),
    overall_impression: parseInt(overall_impression, 10),
    review_text: review_text || "", // Default to empty string if null/undefined
  };

  try {
    const result = await Review.createReview(reviewData);
    // Optionally fetch the created review to return it
    const newReview = await Review.getReviewById(result.insertId); // Get the full review data

    res
      .status(201)
      .json({
        success: true,
        message: "Értékelés sikeresen létrehozva.",
        review: newReview,
      });
  } catch (err) {
    console.error(`Error creating review for perfume ${perfumeId}:`, err);
    // Handle specific errors like validation errors if the model throws them
    if (
      err.message.includes("Hiányzó adatok") ||
      err.message.includes("1 és 5 között")
    ) {
      return res.status(400).json({ error: err.message });
    }
    res
      .status(500)
      .json({ error: "Adatbázis hiba az értékelés létrehozásakor." });
  }
};

// Update an existing review (requires review ID)
exports.updateReview = async (req, res) => {
  const userId = req.user.id;
  const reviewId = req.params.id; // Get review ID from URL

  const {
    scent_trail_rating,
    longevity_rating,
    value_rating,
    overall_impression,
    review_text,
  } = req.body;

  // Validation... (similar to create)

  const reviewData = {
    scent_trail_rating: parseInt(scent_trail_rating, 10),
    longevity_rating: parseInt(longevity_rating, 10),
    value_rating: parseInt(value_rating, 10),
    overall_impression: parseInt(overall_impression, 10),
    review_text: review_text || "",
  };

  try {
    const result = await Review.updateReview(
      parseInt(reviewId, 10),
      userId,
      reviewData
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({
          error:
            "Értékelés nem található, vagy nincs jogosultságod a módosításhoz.",
        });
    }
    const updatedReview = await Review.getReviewById(parseInt(reviewId, 10));
    res
      .status(200)
      .json({
        success: true,
        message: "Értékelés frissítve.",
        review: updatedReview,
      });
  } catch (err) {
    console.error(`Error updating review ${reviewId}:`, err);
    // Handle validation errors etc.
    res
      .status(500)
      .json({ error: "Adatbázis hiba az értékelés frissítésekor." });
  }
};

// Delete a review (requires review ID)
exports.deleteReview = async (req, res) => {
  const userId = req.user.id;
  const reviewId = req.params.id; // Get review ID from URL

  try {
    const result = await Review.deleteReview(parseInt(reviewId, 10), userId);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({
          error:
            "Értékelés nem található, vagy nincs jogosultságod a törléshez.",
        });
    }
    res
      .status(200)
      .json({ success: true, message: "Értékelés sikeresen törölve." });
  } catch (err) {
    console.error(`Error deleting review ${reviewId}:`, err);
    res.status(500).json({ error: "Adatbázis hiba az értékelés törlésekor." });
  }
};

// Get a single review by its ID (might not be needed for frontend display, but useful for editing)
exports.getReviewById = async (req, res) => {
  const reviewId = req.params.id;
  try {
    const review = await Review.getReviewById(parseInt(reviewId, 10));
    if (!review) {
      return res.status(404).json({ error: "Értékelés nem található." });
    }
    res.status(200).json(review);
  } catch (err) {
    console.error(`Error fetching review ${reviewId}:`, err);
    res.status(500).json({ error: "Adatbázis hiba." });
  }
};

// getAllReviews - valószínűleg nem kell, de meghagyom kommentben
/*
exports.getAllReviews = (req, res) => {
  Review.getAllReviews((err, results) => { // Needs update to use queryAsync
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
};
*/
