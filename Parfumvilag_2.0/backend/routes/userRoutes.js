// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
// MOST a Controllert importáljuk!
const UserController = require("../controllers/userController");
// A User modellre itt nincs szükségünk közvetlenül
// const User = require('../models/user'); // <-- TÖRÖLNI vagy kikommentelni

// GET /api/users/me - Lekéri a bejelentkezett felhasználó adatait
// Most már a UserController.getUserById ASYNC függvényét hívja
router.get("/me", authMiddleware, UserController.getUserById);

// PUT /api/users/me - Frissíti a bejelentkezett felhasználó adatait
// Most már a UserController.updateUser ASYNC függvényét hívja
router.put("/me", authMiddleware, UserController.updateUser);

module.exports = router;
