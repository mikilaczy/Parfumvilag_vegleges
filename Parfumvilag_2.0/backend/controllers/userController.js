// backend/controllers/userController.js
const User = require("../models/User");

// GET User Data (No changes needed here, assuming it works)
exports.getUserById = async (req, res, next) => {
  const userId = req.user.id; // From authMiddleware
  try {
    const user = await User.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "Felhasználó nem található!" });
    }
    res.status(200).json(user); // Send user data (without password)
  } catch (err) {
    console.error(`Error fetching user ${userId}:`, err);
    next(err); // Pass to central error handler
  }
};

// UPDATE User Data (Handles JSON body)
exports.updateUser = async (req, res, next) => {
  const userId = req.user.id;
  const userDataFromRequest = req.body;
  console.log(
    `CTRL: updateUser for ${userId} START. Data:`,
    userDataFromRequest
  ); // LOG 1

  if (!userDataFromRequest || typeof userDataFromRequest !== "object") {
    console.error(`CTRL: Invalid request body for user ${userId}`);
    return res.status(400).json({ error: "Érvénytelen kérés törzs." });
  }

  try {
    // 1. Update DB via Model
    console.log(`CTRL: Calling User.updateUser for ${userId}...`); // LOG 2
    const updateResult = await User.updateUser(userId, userDataFromRequest);
    console.log(
      `CTRL: User.updateUser finished for ${userId}. Result:`,
      updateResult
    ); // LOG 3

    // 2. Fetch FRESH data via Model
    console.log(`CTRL: Calling User.getUserById for ${userId} AFTER update...`); // LOG 4
    const updatedUser = await User.getUserById(userId);
    console.log(
      `CTRL: User.getUserById finished for ${userId}. Fetched:`,
      updatedUser
    ); // LOG 5 - LÁTOD EZT? TARTALMAZZA A KÉP URL-t?

    if (!updatedUser) {
      console.error(
        `CTRL: CRITICAL - Failed to fetch user ${userId} after update!`
      ); // LOG 6 (Hiba)
      // Biztosan küldjön választ hiba esetén is
      return res
        .status(500)
        .json({
          error: "Felhasználó frissítve, de az adatok újratöltése sikertelen.",
        });
    }

    // 3. Send SUCCESS response with FRESH data
    console.log(`CTRL: Sending SUCCESS response for user ${userId}.`); // LOG 7 - EZT LÁTOD?
    res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    console.error(
      `CTRL: CATCH BLOCK - Error during user update process for ${userId}:`,
      err
    ); // LOG 8 (Hiba)

    if (err.message === "Ez az email cím már foglalt!") {
      console.log(`CTRL: Sending 409 for duplicate email.`); // LOG 9 (Hiba)
      return res.status(409).json({ error: err.message });
    }

    // Küldjön általános hibát, ha nincs specifikus kezelés
    console.log(`CTRL: Sending 500 generic error.`); // LOG 10 (Hiba)
    res
      .status(500)
      .json({
        error:
          err.message || "Szerverhiba történt a felhasználó frissítésekor.",
      });
    // Vagy ha van next(): next(err);
  }
};
