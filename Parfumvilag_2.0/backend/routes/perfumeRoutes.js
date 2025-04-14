const express = require("express");
const router = express.Router();
const PerfumeController = require("../controllers/perfumeController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/batch", PerfumeController.getPerfumesByIds);
console.log("--- perfumeRoutes.js loaded ---"); // Eljut ide?

// ... esetleges router.use middleware ...
console.log("Middleware added (if any)");

router.get("/price-range", (req, res, next) => {
  // Ideiglenes log a controller előtt
  console.log(">>> GET /price-range route matched <<<");
  PerfumeController.getPriceRange(req, res, next); // Hívjuk az igazi controllert
});
router.get("/all", PerfumeController.getAllPerfumes);
router.get("/random", PerfumeController.getRandomPerfumes);
router.get("/featured", PerfumeController.getFeaturedPerfumes); // Might need adjustment based on DB
router.get("/:id", PerfumeController.getPerfumeById);
router.get("/price-range", PerfumeController.getPriceRange);

module.exports = router;
