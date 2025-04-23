// backend/controllers/reviewController.js
const Review = require("../models/Review"); // Az értékelés (Review) adatmodell betöltése

// Adott parfümhöz tartozó összes értékelés lekérdezése
exports.getReviewsForPerfume = async (req, res) => {
  const perfumeId = req.params.perfumeId; // Parfüm ID kinyerése az URL paraméterből
  if (!perfumeId) {
    // Ha hiányzik a parfüm ID, hibaüzenettel térünk vissza
    return res.status(400).json({ error: "Hiányzó perfumeId!" });
  }

  try {
    // Értékelések lekérdezése az adatmodell segítségével (aszinkron művelet)
    const reviews = await Review.getReviewsByPerfumeId(parseInt(perfumeId, 10));
    res.status(200).json(reviews); // Sikeres válasz: értékelések tömbje JSON formátumban
  } catch (err) {
    // Hiba logolása és általános adatbázis hiba küldése
    console.error(`Error fetching reviews for perfume ${perfumeId}:`, err);
    res
      .status(500)
      .json({ error: "Adatbázis hiba az értékelések lekérdezésekor." });
  }
};

// Új értékelés létrehozása egy adott parfümhöz
exports.createReview = async (req, res) => {
  const userId = req.user.id; // Felhasználó ID kinyerése a hitelesítési middleware-ből (feltételezzük, hogy van ilyen)
  const perfumeId = req.params.perfumeId; // Parfüm ID kinyerése az URL-ből

  // Értékelési adatok kinyerése a kérés törzséből (figyelve az adatbázis oszlopneveire)
  const {
    scent_trail_rating, // Illatcsík értékelése
    longevity_rating, // Tartósság értékelése
    value_rating, // Ár-érték arány értékelése
    overall_impression, // Összbenyomás értékelése
    review_text, // Szöveges értékelés
  } = req.body;

  // Alapvető validáció: kötelező mezők ellenőrzése
  if (
    scent_trail_rating == null ||
    longevity_rating == null ||
    value_rating == null ||
    overall_impression == null
  ) {
    return res
      .status(400)
      .json({ error: "Minden értékelési szempont (1-5) kitöltése kötelező!" });
  }
  // A szöveges rész lehet üres

  // Adatobjektum összeállítása a modell számára
  const reviewData = {
    perfume_id: parseInt(perfumeId, 10),
    user_id: userId,
    scent_trail_rating: parseInt(scent_trail_rating, 10),
    longevity_rating: parseInt(longevity_rating, 10),
    value_rating: parseInt(value_rating, 10),
    overall_impression: parseInt(overall_impression, 10),
    review_text: review_text || "", // Üres string, ha nincs megadva
  };

  try {
    // Értékelés létrehozása az adatmodell segítségével
    const result = await Review.createReview(reviewData);
    // Opciónálisan lekérdezzük a létrehozott értékelést a teljes adatokkal való visszatéréshez
    const newReview = await Review.getReviewById(result.insertId);

    // Sikeres létrehozás válasza (201 Created) az új értékelés adataival
    res.status(201).json({
      success: true,
      message: "Értékelés sikeresen létrehozva.",
      review: newReview,
    });
  } catch (err) {
    console.error(`Error creating review for perfume ${perfumeId}:`, err);
    // Specifikusabb hibakezelés (pl. validációs hibák a modellből)
    if (
      err.message.includes("Hiányzó adatok") ||
      err.message.includes("1 és 5 között")
    ) {
      return res.status(400).json({ error: err.message });
    }
    // Általános adatbázis hiba
    res
      .status(500)
      .json({ error: "Adatbázis hiba az értékelés létrehozásakor." });
  }
};

// Meglévő értékelés frissítése (az értékelés ID-ja szükséges)
exports.updateReview = async (req, res) => {
  const userId = req.user.id; // Felhasználó ID a hitelesítésből
  const reviewId = req.params.id; // Értékelés ID az URL-ből

  // Frissítendő adatok kinyerése a kérés törzséből
  const {
    scent_trail_rating,
    longevity_rating,
    value_rating,
    overall_impression,
    review_text,
  } = req.body;

  // Validáció itt is szükséges lehet (hasonlóan a 'createReview'-hoz)

  // Frissítendő adatokat tartalmazó objektum
  const reviewData = {
    scent_trail_rating: parseInt(scent_trail_rating, 10),
    longevity_rating: parseInt(longevity_rating, 10),
    value_rating: parseInt(value_rating, 10),
    overall_impression: parseInt(overall_impression, 10),
    review_text: review_text || "",
  };

  try {
    // Értékelés frissítése a modell segítségével (ellenőrzi a felhasználói jogosultságot is)
    const result = await Review.updateReview(
      parseInt(reviewId, 10),
      userId,
      reviewData
    );
    // Ellenőrizzük, hogy történt-e módosítás (létezett-e és volt-e jogosultság)
    if (result.affectedRows === 0) {
      return res
        .status(404) // Nem található vagy nincs jogosultság
        .json({
          error:
            "Értékelés nem található, vagy nincs jogosultságod a módosításhoz.",
        });
    }
    // Sikeres frissítés után lekérdezzük és visszaküldjük a frissített adatokat
    const updatedReview = await Review.getReviewById(parseInt(reviewId, 10));
    res.status(200).json({
      success: true,
      message: "Értékelés frissítve.",
      review: updatedReview,
    });
  } catch (err) {
    console.error(`Error updating review ${reviewId}:`, err);
    // Hibakezelés (pl. validáció, adatbázis hiba)
    res
      .status(500)
      .json({ error: "Adatbázis hiba az értékelés frissítésekor." });
  }
};

// Értékelés törlése (az értékelés ID-ja szükséges)
exports.deleteReview = async (req, res) => {
  const userId = req.user.id; // Felhasználó ID
  const reviewId = req.params.id; // Értékelés ID az URL-ből

  try {
    // Értékelés törlése a modell segítségével (ellenőrzi a jogosultságot)
    const result = await Review.deleteReview(parseInt(reviewId, 10), userId);
    // Ellenőrizzük, hogy történt-e törlés
    if (result.affectedRows === 0) {
      return res
        .status(404) // Nem található vagy nincs jogosultság
        .json({
          error:
            "Értékelés nem található, vagy nincs jogosultságod a törléshez.",
        });
    }
    // Sikeres törlés esetén üzenet küldése
    res
      .status(200)
      .json({ success: true, message: "Értékelés sikeresen törölve." });
  } catch (err) {
    console.error(`Error deleting review ${reviewId}:`, err);
    res.status(500).json({ error: "Adatbázis hiba az értékelés törlésekor." });
  }
};

// Egyetlen értékelés lekérdezése az ID alapján (hasznos lehet szerkesztéshez)
exports.getReviewById = async (req, res) => {
  const reviewId = req.params.id; // Értékelés ID az URL-ből
  try {
    const review = await Review.getReviewById(parseInt(reviewId, 10));
    // Ha nincs ilyen értékelés
    if (!review) {
      return res.status(404).json({ error: "Értékelés nem található." });
    }
    // Sikeres lekérdezés esetén az értékelés adatainak küldése
    res.status(200).json(review);
  } catch (err) {
    console.error(`Error fetching review ${reviewId}:`, err);
    res.status(500).json({ error: "Adatbázis hiba." });
  }
};

// getAllReviews - Összes értékelés lekérdezése (általában nincs rá szükség a frontend oldalon)
/*
exports.getAllReviews = (req, res) => {
  Review.getAllReviews((err, results) => { // Frissíteni kellene async/await-re
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
};
*/
