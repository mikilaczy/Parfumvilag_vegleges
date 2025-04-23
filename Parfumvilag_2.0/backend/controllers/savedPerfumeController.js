// backend/controllers/savedPerfumeController.js
const SavedPerfume = require("../models/SavedPerfume"); // A mentett parfüm (SavedPerfume) adatmodell betöltése

// Controller függvény a bejelentkezett felhasználó mentett parfümjeinek (csak az ID-k) lekérdezésére
exports.getSavedPerfumesByUser = async (req, res) => {
  const userId = req.user.id; // Felhasználó ID kinyerése a hitelesítési middleware-ből
  try {
    // Mentett parfümök lekérdezése a felhasználó ID alapján
    const results = await SavedPerfume.getSavedPerfumesByUserId(userId);
    // Eredmények átalakítása: csak a parfüm ID-kat tartalmazó tömb létrehozása
    const perfumeIds = results.map((row) => row.perfume_id);
    res.status(200).json(perfumeIds); // Sikeres válasz: parfüm ID-k tömbje JSON formátumban
  } catch (err) {
    // Hiba logolása és általános adatbázis hiba küldése
    console.error("Error fetching saved perfumes:", err);
    res
      .status(500)
      .json({ error: "Adatbázis hiba a kedvencek lekérdezésekor." });
  }
};

// Controller függvény új mentett parfüm (kedvenc) hozzáadásához
exports.createSavedPerfume = async (req, res) => {
  const userId = req.user.id; // Felhasználó ID a hitelesítésből
  const { perfume_id } = req.body; // Parfüm ID kinyerése a kérés törzséből

  // Validáció: parfüm ID meglétének ellenőrzése
  if (!perfume_id) {
    return res.status(400).json({ error: "Hiányzó perfume_id!" });
  }

  try {
    // Mentett parfüm létrehozása a modell segítségével (ellenőrzi, hogy létezik-e már)
    const result = await SavedPerfume.createSavedPerfume(
      userId,
      parseInt(perfume_id, 10)
    );
    // Sikeres hozzáadás esetén
    if (result.affectedRows > 0) {
      res
        .status(201) // Created státuszkód
        .json({
          success: true,
          message: "Kedvenc hozzáadva.",
          id: result.insertId, // Az új rekord ID-ja a saved_perfumes táblában
        });
    } else if (result.message === "Already saved") {
      // Ha már létezik a kedvenc
      res
        .status(200) // OK státuszkód (nem hiba, de nem is hozott létre újat)
        .json({
          success: false,
          message: "Ez a parfüm már a kedvenceid között van.",
        });
    } else {
      // Váratlan eset kezelése
      res
        .status(500)
        .json({ error: "Ismeretlen hiba történt a hozzáadás során." });
    }
  } catch (err) {
    // Hiba logolása és általános adatbázis hiba küldése
    console.error("Error creating saved perfume:", err);
    res.status(500).json({ error: "Adatbázis hiba a kedvenc hozzáadásakor." });
  }
};

// Controller függvény mentett parfüm törléséhez a parfüm ID alapján
exports.deleteSavedPerfumeByPerfumeId = async (req, res) => {
  const userId = req.user.id; // Felhasználó ID a hitelesítésből
  const perfumeId = req.params.perfumeId; // Parfüm ID kinyerése az URL paraméterből

  // Validáció: parfüm ID meglétének ellenőrzése
  if (!perfumeId) {
    return res.status(400).json({ error: "Hiányzó perfumeId!" });
  }

  try {
    // Mentett parfüm törlése a modell segítségével (user ID és parfüm ID alapján)
    const result = await SavedPerfume.deleteSavedPerfumeByPerfumeId(
      userId,
      parseInt(perfumeId, 10)
    );
    // Ellenőrizzük, hogy történt-e törlés (létezett-e a kedvenc ennél a felhasználónál)
    if (result.affectedRows === 0) {
      return res
        .status(404) // Nem található státuszkód
        .json({ error: "A kedvenc nem található vagy már törölve lett." });
    }
    // Sikeres törlés esetén üzenet küldése
    res
      .status(200)
      .json({ success: true, message: "Kedvenc sikeresen törölve." });
  } catch (err) {
    // Hiba logolása és általános adatbázis hiba küldése
    console.error("Error deleting saved perfume:", err);
    res.status(500).json({ error: "Adatbázis hiba a kedvenc törlésekor." });
  }
};

// Controller függvény mentett parfüm törléséhez a 'saved_perfumes' tábla saját ID-ja alapján
// (Figyelem: Jogosultság ellenőrzése ajánlott ebben a verzióban!)
exports.deleteSavedPerfume = async (req, res) => {
  const userId = req.user.id; // Felhasználó ID (jogosultsághoz kell)
  const savedPerfumeId = req.params.id; // A 'saved_perfumes' rekord ID-ja az URL-ből

  try {
    // TODO: Itt ellenőrizni kellene, hogy a user tényleg birtokolja-e ezt a saved_perfume rekordot!
    // Pl. lekérdezni a user_id-t a savedPerfumeId alapján és összevetni a req.user.id-val.
    // Ha nem egyezik -> 403 Forbidden válasz.

    // Törlés a modell segítségével a saved_perfumes rekord ID alapján
    const result = await SavedPerfume.deleteSavedPerfumeById(savedPerfumeId);
    // Ellenőrizzük, hogy történt-e törlés
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Mentett parfüm nem található!" });
    }
    // Sikeres törlés esetén üzenet küldése
    res
      .status(200)
      .json({ success: true, message: "Mentett parfüm sikeresen törölve!" });
  } catch (err) {
    // Hiba logolása és általános adatbázis hiba küldése
    console.error("Error deleting saved perfume by internal ID:", err);
    res.status(500).json({ error: "Adatbázis hiba a törléskor." });
  }
};
