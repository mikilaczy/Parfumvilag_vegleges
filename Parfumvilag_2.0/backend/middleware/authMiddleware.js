const jwt = require("jsonwebtoken"); // JSON Web Token kezeléséhez szükséges csomag
require("dotenv").config(); // Környezeti változók betöltése (pl. a JWT titkos kulcs)

// Hitelesítési middleware függvény
const authMiddleware = (req, res, next) => {
  // Token kinyerése a kérés 'x-auth-token' fejlécéből
  const token = req.header("x-auth-token");

  // Ellenőrzés, hogy van-e token a kérésben
  if (!token) {
    // Ha nincs token, 401-es (Unauthorized) hibát küldünk
    return res.status(401).json({ error: "Nincs hitelesítési token!" });
  }

  try {
    // Token ellenőrzése és dekódolása a környezeti változóban tárolt titkos kulccsal
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // A dekódolt felhasználói adatokat (itt csak az ID-t) hozzáadjuk a kérés (req) objektumhoz
    req.user = { id: decoded.id };
    // Továbbadjuk a vezérlést a következő middleware-nek vagy útvonal-kezelőnek
    next();
  } catch (error) {
    // Ha a token érvénytelen (lejárt, rossz aláírás stb.), 401-es hibát küldünk
    res.status(401).json({ error: "Token érvénytelen!" });
  }
};

// A middleware függvény exportálása, hogy máshol is használható legyen
module.exports = authMiddleware;
