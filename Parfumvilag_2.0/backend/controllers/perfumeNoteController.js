// backend/routes/perfumeRoutes.js
const express = require('express');
const router = express.Router();
const PerfumeController = require('../controllers/perfumeController');
const authMiddleware = require('../middleware/authMiddleware');

// Összes parfüm
router.get('/all', PerfumeController.getAllPerfumes);

// Kiemelt parfümök
router.get('/featured', PerfumeController.getFeaturedPerfumes);

// Parfüm azonosító alapján
router.get('/:id', PerfumeController.getPerfumeById);

// Parfüm létrehozása (védett útvonal)
router.post('/', authMiddleware, PerfumeController.createPerfume);

// Parfüm frissítése (védett útvonal)
router.put('/:id', authMiddleware, PerfumeController.updatePerfume);

// Parfüm törlése (védett útvonal)
router.delete('/:id', authMiddleware, PerfumeController.deletePerfume);

module.exports = router;