// backend/controllers/userController.js
const User = require("../models/User"); // Felhasználó (User) adatmodell betöltése

// GET Felhasználói adatok lekérdezése ID alapján
exports.getUserById = async (req, res, next) => {
  const userId = req.user.id; // Felhasználó ID kinyerése a hitelesítési middleware-ből
  try {
    // Felhasználó adatainak lekérdezése a modell segítségével
    const user = await User.getUserById(userId);
    if (!user) {
      // Ha a felhasználó nem található
      return res.status(404).json({ error: "Felhasználó nem található!" });
    }
    // Sikeres válasz: felhasználói adatok küldése (jelszó nélkül)
    res.status(200).json(user);
  } catch (err) {
    // Hiba logolása és továbbadása a központi hibakezelőnek
    console.error(`Error fetching user ${userId}:`, err);
    next(err);
  }
};

// UPDATE Felhasználói adatok frissítése (JSON kérés törzs alapján)
exports.updateUser = async (req, res, next) => {
  const userId = req.user.id; // Felhasználó ID a hitelesítésből
  const userDataFromRequest = req.body; // Frissítendő adatok a kérés törzséből
  console.log(
    `CTRL: updateUser for ${userId} START. Data:`,
    userDataFromRequest
  ); // LOG 1

  // Ellenőrizzük, hogy a kérés törzse érvényes objektum-e
  if (!userDataFromRequest || typeof userDataFromRequest !== "object") {
    console.error(`CTRL: Invalid request body for user ${userId}`);
    return res.status(400).json({ error: "Érvénytelen kérés törzs." });
  }

  try {
    // 1. Adatbázis frissítése a modell segítségével
    console.log(`CTRL: Calling User.updateUser for ${userId}...`); // LOG 2
    const updateResult = await User.updateUser(userId, userDataFromRequest);
    console.log(
      `CTRL: User.updateUser finished for ${userId}. Result:`,
      updateResult
    ); // LOG 3

    // 2. Friss adatok lekérdezése a modell segítségével (a válaszhoz)
    console.log(`CTRL: Calling User.getUserById for ${userId} AFTER update...`); // LOG 4
    const updatedUser = await User.getUserById(userId);
    console.log(
      `CTRL: User.getUserById finished for ${userId}. Fetched:`,
      updatedUser
    ); // LOG 5 - LÁTOD EZT? TARTALMAZZA A KÉP URL-t?

    // Ellenőrzés, hogy sikerült-e lekérdezni a frissített adatokat
    if (!updatedUser) {
      console.error(
        `CTRL: CRITICAL - Failed to fetch user ${userId} after update!`
      ); // LOG 6 (Hiba)
      // Kritikus hiba: a frissítés látszólag sikerült, de az új adatok nem olvashatók
      return res.status(500).json({
        error: "Felhasználó frissítve, de az adatok újratöltése sikertelen.",
      });
    }

    // 3. Sikeres válasz küldése a friss felhasználói adatokkal
    console.log(`CTRL: Sending SUCCESS response for user ${userId}.`); // LOG 7 - EZT LÁTOD?
    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    // Hibakezelés a frissítési folyamat során
    console.error(
      `CTRL: CATCH BLOCK - Error during user update process for ${userId}:`,
      err
    ); // LOG 8 (Hiba)

    // Specifikus hiba kezelése: foglalt e-mail cím
    if (err.message === "Ez az email cím már foglalt!") {
      console.log(`CTRL: Sending 409 for duplicate email.`); // LOG 9 (Hiba)
      return res.status(409).json({ error: err.message }); // 409 Conflict státuszkód
    }

    // Általános szerverhiba küldése, ha nincs specifikusabb kezelés
    console.log(`CTRL: Sending 500 generic error.`); // LOG 10 (Hiba)
    res.status(500).json({
      error: err.message || "Szerverhiba történt a felhasználó frissítésekor.",
    });
    // Alternatíva központi hibakezelő használata esetén: next(err);
  }
};
