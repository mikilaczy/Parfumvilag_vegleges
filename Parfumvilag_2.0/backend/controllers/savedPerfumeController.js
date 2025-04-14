// backend/controllers/savedPerfumeController.js
const SavedPerfume = require("../models/SavedPerfume");

// Controller function to get saved perfume IDs for the logged-in user
exports.getSavedPerfumesByUser = async (req, res) => {
  const userId = req.user.id; // From authMiddleware
  try {
    const results = await SavedPerfume.getSavedPerfumesByUserId(userId);
    // Csak az ID-kat küldjük vissza egy egyszerű tömbben
    const perfumeIds = results.map((row) => row.perfume_id);
    res.status(200).json(perfumeIds);
  } catch (err) {
    console.error("Error fetching saved perfumes:", err);
    res
      .status(500)
      .json({ error: "Adatbázis hiba a kedvencek lekérdezésekor." });
  }
};

// Controller function to add a saved perfume
exports.createSavedPerfume = async (req, res) => {
  const userId = req.user.id; // From authMiddleware
  const { perfume_id } = req.body;

  if (!perfume_id) {
    return res.status(400).json({ error: "Hiányzó perfume_id!" });
  }

  try {
    const result = await SavedPerfume.createSavedPerfume(
      userId,
      parseInt(perfume_id, 10)
    );
    if (result.affectedRows > 0) {
      res
        .status(201)
        .json({
          success: true,
          message: "Kedvenc hozzáadva.",
          id: result.insertId,
        });
    } else if (result.message === "Already saved") {
      res
        .status(200)
        .json({
          success: false,
          message: "Ez a parfüm már a kedvenceid között van.",
        });
    } else {
      // Váratlan eset
      res
        .status(500)
        .json({ error: "Ismeretlen hiba történt a hozzáadás során." });
    }
  } catch (err) {
    console.error("Error creating saved perfume:", err);
    res.status(500).json({ error: "Adatbázis hiba a kedvenc hozzáadásakor." });
  }
};

// Controller function to delete a saved perfume by perfumeId
exports.deleteSavedPerfumeByPerfumeId = async (req, res) => {
  const userId = req.user.id; // From authMiddleware
  const perfumeId = req.params.perfumeId; // Get perfumeId from URL parameter

  if (!perfumeId) {
    return res.status(400).json({ error: "Hiányzó perfumeId!" });
  }

  try {
    const result = await SavedPerfume.deleteSavedPerfumeByPerfumeId(
      userId,
      parseInt(perfumeId, 10)
    );
    if (result.affectedRows === 0) {
      // Lehet, hogy nem is volt kedvenc, vagy más useré volt
      return res
        .status(404)
        .json({ error: "A kedvenc nem található vagy már törölve lett." });
    }
    res
      .status(200)
      .json({ success: true, message: "Kedvenc sikeresen törölve." });
  } catch (err) {
    console.error("Error deleting saved perfume:", err);
    res.status(500).json({ error: "Adatbázis hiba a kedvenc törlésekor." });
  }
};

// A régi deleteSavedPerfume (ID alapján) megmaradhat, ha szükséges
exports.deleteSavedPerfume = async (req, res) => {
  const userId = req.user.id;
  const savedPerfumeId = req.params.id; // SavedPerfume tábla ID-ja

  try {
    // Itt ellenőrizni kellene, hogy a user tényleg birtokolja-e ezt a saved_perfume rekordot!
    // Pl. SELECT user_id FROM saved_perfumes WHERE id = ?
    // Ha a user_id nem egyezik req.user.id-val -> 403 Forbidden

    const result = await SavedPerfume.deleteSavedPerfumeById(savedPerfumeId);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Mentett parfüm nem található!" });
    }
    res
      .status(200)
      .json({ success: true, message: "Mentett parfüm sikeresen törölve!" });
  } catch (err) {
    console.error("Error deleting saved perfume by internal ID:", err);
    res.status(500).json({ error: "Adatbázis hiba a törléskor." });
  }
};
