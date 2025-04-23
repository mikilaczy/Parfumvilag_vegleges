const jwt = require("jsonwebtoken"); // JSON Web Token (JWT) létrehozásához és ellenőrzéséhez szükséges csomag
require("dotenv").config(); // Környezeti változók betöltése (pl. a JWT titkos kulcs)

// Függvény JWT generálásához egy adott felhasználói ID alapján
const generateToken = (userId) => {
  // Létrehoz egy JWT-t, amely tartalmazza a felhasználó ID-ját (`id`).
  // Az aláíráshoz a .env fájlban definiált titkos kulcsot (`JWT_SECRET`) használja.
  // A token 1 óra múlva lejár (`expiresIn: '1h'`).
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Függvény egy meglévő JWT ellenőrzéséhez és dekódolásához
const verifyToken = (token) => {
  try {
    // Megpróbálja ellenőrizni a tokent a titkos kulccsal.
    // Ha a token érvényes, visszaadja a dekódolt adatokat (payload).
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Ha a token érvénytelen (pl. lejárt, rossz aláírás), null értéket ad vissza.
    return null;
  }
};

module.exports = { generateToken, verifyToken };
