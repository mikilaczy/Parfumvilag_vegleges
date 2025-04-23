import React, { useState, useContext } from "react"; // React és hook-ok importálása
import { AuthContext } from "../App"; // Globális autentikációs kontextus importálása
import { createReview } from "../services/reviewService"; // Értékelés létrehozó service függvény importálása

// Értékelő űrlap komponens
// - perfumeId: Az értékelendő parfüm ID-ja.
// - onReviewSubmitted: Callback függvény, ami az értékelés sikeres beküldése után hívódik meg.
const ReviewForm = ({ perfumeId, onReviewSubmitted }) => {
  // Kontextus és állapotok inicializálása
  const { isLoggedIn } = useContext(AuthContext); // Bejelentkezési állapot lekérdezése a kontextusból
  // Értékelési kategóriák állapotának kezelése (0-5 skála)
  const [ratings, setRatings] = useState({
    sillage: 0, // Illatfelhő
    longevity: 0, // Tartósság
    value: 0, // Ár/érték arány
    overall: 0, // Összbenyomás
  });
  const [comment, setComment] = useState(""); // Szöveges vélemény állapota
  const [error, setError] = useState(""); // Hibaüzenet állapota
  const [success, setSuccess] = useState(""); // Sikerüzenet állapota
  const [loading, setLoading] = useState(false); // Töltési állapot (API hívás alatt)

  // Értékelés változását kezelő függvény (csúszkákhoz)
  const handleRatingChange = (category, value) => {
    // Biztosítja, hogy az érték 0 és 5 között legyen
    const numValue = Math.max(0, Math.min(5, parseInt(value, 10)));
    // Frissíti a ratings állapotot az adott kategóriánál
    setRatings({ ...ratings, [category]: numValue });
  };

  // Űrlap beküldését kezelő aszinkron függvény
  const handleSubmit = async (e) => {
    e.preventDefault(); // Alapértelmezett űrlap beküldés megakadályozása
    // Ellenőrzés: Csak bejelentkezett felhasználó értékelhet
    if (!isLoggedIn) {
      setError("Be kell jelentkezni az értékeléshez!");
      return;
    }

    // Validáció: Minden értékelési szempontot ki kell tölteni (minimum 1 csillag)
    if (Object.values(ratings).some((rating) => rating === 0)) {
      setError("Kérlek, adj értékelést minden szempontra (minimum 1)!");
      return;
    }
    // Validáció: A szöveges vélemény kitöltése kötelező
    if (!comment.trim()) {
      setError("Kérlek, írj véleményt!");
      return;
    }

    // Hiba- és sikerüzenetek törlése, töltési állapot beállítása
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Adatok összeállítása a service függvény számára

      const reviewData = {
        scent_trail_rating: ratings.sillage,
        longevity_rating: ratings.longevity,
        value_rating: ratings.value,
        overall_impression: ratings.overall,
        review_text: comment, // Győződj meg róla, hogy a backend ezt a nevet várja!
      };

      const result = await createReview(perfumeId, reviewData); // API hívás az értékelés létrehozására

      // Sikeres beküldés utáni teendők
      setSuccess("Értékelés sikeresen beküldve!");
      // Űrlap visszaállítása alaphelyzetbe
      setRatings({ sillage: 0, longevity: 0, value: 0, overall: 0 });
      setComment("");

      // Szülő komponens (PerfumeDetail) értesítése az új értékelésről (lista frissítéséhez)
      if (onReviewSubmitted) {
        onReviewSubmitted(result.review); // Visszaadja az új értékelés adatait
      }

      // Sikerüzenet eltüntetése késleltetéssel
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      // Hiba kezelése sikertelen beküldés esetén
      setError(err.message || "Hiba történt az értékelés beküldésekor!");
      // Hibaüzenet eltüntetése késleltetéssel
      setTimeout(() => setError(""), 7000);
    } finally {
      // Töltési állapot visszaállítása minden esetben
      setLoading(false);
    }
  };

  // Ha a felhasználó nincs bejelentkezve, az űrlap nem jelenik meg
  // A PerfumeDetail komponens kezeli a bejelentkezésre ösztönző üzenetet.
  if (!isLoggedIn) {
    return null; // Vagy itt is megjeleníthető egy egyszerű üzenet.
  }

  // Komponens JSX struktúrája
  return (
    <form className="review-form-custom" onSubmit={handleSubmit}>
      {" "}
      {/* Egyedi stílusosztály az űrlaphoz */}
      <h4 className="mb-3">Írj értékelést!</h4>
      {/* Hiba- és sikerüzenetek megjelenítése */}
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {/* Értékelő csúszkák */}
      {/* Illatfelhő (Sillage) */}
      <div className="review-form-section">
        <label htmlFor="sillageRating" className="form-label">
          Illatfelhő (Sillage):
        </label>
        <input
          type="range" // Csúszka típus
          id="sillageRating"
          min="0"
          max="5"
          step="1" // Lépésköz
          value={ratings.sillage} // Jelenlegi érték az állapotból
          onChange={(e) => handleRatingChange("sillage", e.target.value)} // Változáskezelő
          className="rating-slider" // Stílusosztály
          disabled={loading} // Letiltva API hívás alatt
        />
        <span className="slider-value">{ratings.sillage}/5</span>{" "}
        {/* Érték megjelenítése */}
      </div>
      {/* Tartósság (Longevity) */}
      <div className="review-form-section">
        <label htmlFor="longevityRating" className="form-label">
          Tartósság (Longevity):
        </label>
        <input
          type="range"
          id="longevityRating"
          min="0"
          max="5"
          step="1"
          value={ratings.longevity}
          onChange={(e) => handleRatingChange("longevity", e.target.value)}
          className="rating-slider"
          disabled={loading}
        />
        <span className="slider-value">{ratings.longevity}/5</span>
      </div>
      {/* Ár/Érték arány (Value) */}
      <div className="review-form-section">
        <label htmlFor="valueRating" className="form-label">
          Ár/Érték arány (Value):
        </label>
        <input
          type="range"
          id="valueRating"
          min="0"
          max="5"
          step="1"
          value={ratings.value}
          onChange={(e) => handleRatingChange("value", e.target.value)}
          className="rating-slider"
          disabled={loading}
        />
        <span className="slider-value">{ratings.value}/5</span>
      </div>
      {/* Összbenyomás (Overall) */}
      <div className="review-form-section">
        <label htmlFor="overallRating" className="form-label">
          Összbenyomás (Overall):
        </label>
        <input
          type="range"
          id="overallRating"
          min="0"
          max="5"
          step="1"
          value={ratings.overall}
          onChange={(e) => handleRatingChange("overall", e.target.value)}
          className="rating-slider"
          disabled={loading}
        />
        <span className="slider-value">{ratings.overall}/5</span>
      </div>
      {/* Szöveges vélemény (Textarea) */}
      <div className="review-form-section">
        <label htmlFor="reviewComment" className="form-label">
          Vélemény:
        </label>
        <textarea
          id="reviewComment"
          className="form-control" // Bootstrap stílusosztály
          value={comment} // Érték az állapotból
          onChange={(e) => setComment(e.target.value)} // Változáskezelő
          placeholder="Írd ide a véleményed..." // Segítő szöveg
          rows="4" // Sorok száma (növelve a jobb használhatóságért)
          required // HTML5 validáció: kötelező mező
          disabled={loading} // Letiltva API hívás alatt
        />
      </div>
      {/* Beküldés gomb */}
      <button type="submit" className="btn-submit mt-2" disabled={loading}>
        {/* Gomb szövege a töltési állapottól függően */}
        {loading ? "Küldés..." : "Értékelés beküldése"}
      </button>
    </form>
  );
};

export default ReviewForm;
