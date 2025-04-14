const express = require('express');
const router = express.Router();
const perfumeController = require('../controllers/perfumeController');

router.get('/', perfumeController.getAllPerfumes);
router.get('/:id', perfumeController.getPerfumeById);
router.post('/', perfumeController.createPerfume);
router.put('/:id', perfumeController.updatePerfume);
router.delete('/:id', perfumeController.deletePerfume);

module.exports = router;