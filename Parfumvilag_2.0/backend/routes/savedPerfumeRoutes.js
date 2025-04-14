const express = require("express");
const router = express.Router();
const savedPerfumeController = require("../controllers/savedPerfumeController");
const authMiddleware = require("../middleware/authMiddleware"); // Middleware a védelemhez

// GET /api/saved-perfumes - Az aktuális felhasználó kedvenceinek lekérése (csak ID-k)
router.get("/", authMiddleware, savedPerfumeController.getSavedPerfumesByUser); // Új controller funkció

// POST /api/saved-perfumes - Kedvenc hozzáadása
router.post("/", authMiddleware, savedPerfumeController.createSavedPerfume);

// DELETE /api/saved-perfumes/:perfumeId - Kedvenc törlése perfume_id alapján
router.delete(
  "/:perfumeId",
  authMiddleware,
  savedPerfumeController.deleteSavedPerfumeByPerfumeId
); // Módosított controller funkció

module.exports = router;
