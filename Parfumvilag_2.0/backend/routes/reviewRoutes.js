const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/reviews/perfume/:perfumeId - Értékelések lekérése egy parfümhöz
router.get("/perfume/:perfumeId", reviewController.getReviewsForPerfume);

// POST /api/reviews/perfume/:perfumeId - Új értékelés létrehozása egy parfümhöz (védett)
router.post(
  "/perfume/:perfumeId",
  authMiddleware,
  reviewController.createReview
);

// GET /api/reviews/:id - Egy konkrét értékelés lekérése (pl. szerkesztéshez)
router.get("/:id", reviewController.getReviewById); // Lehet, hogy nem kell, vagy védeni kellene

// PUT /api/reviews/:id - Értékelés frissítése (védett)
router.put("/:id", authMiddleware, reviewController.updateReview);

// DELETE /api/reviews/:id - Értékelés törlése (védett)
router.delete("/:id", authMiddleware, reviewController.deleteReview);

// Az általános '/' lekérés valószínűleg nem szükséges
// router.get('/', reviewController.getAllReviews);

module.exports = router;
