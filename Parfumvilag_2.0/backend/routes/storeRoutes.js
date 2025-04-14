const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', storeController.getAllStores);
router.get('/:id', storeController.getStoreById);
router.post('/', authMiddleware, storeController.createStore);
router.put('/:id', authMiddleware, storeController.updateStore);
router.delete('/:id', authMiddleware, storeController.deleteStore);

module.exports = router;