import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPerfumeById } from "../services/perfumeService";
import {
  getMyFavoriteIds,
  addFavorite,
  removeFavorite,
} from "../services/savedPerfumeService";
import {
  getReviewsForPerfume,
  deleteReview as deleteReviewService,
  updateReview as updateReviewService,
} from "../services/reviewService";
import { AuthContext } from "../App";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import "../style.css";

// Bejelentkezési felugró ablak komponens (külön tartva az átláthatóságért)
const LoginPromptModal = ({ onClose, onLoginRedirect }) => (
  <>
    {/* Áttetsző háttér, amelyre kattintva bezáródik */}
    <div className="login-prompt-overlay" onClick={onClose} />
    {/* Modal tartalma */}
    <div className="login-prompt">
      <button className="close-btn" onClick={onClose}>
        ×
      </button>
      <h3>Bejelentkezés szükséges</h3>
      <p>A funkció használatához be kell jelentkezned.</p>
      <button className="login-btn" onClick={onLoginRedirect}>
        Bejelentkezés
      </button>
      <button className="cancel-btn" onClick={onClose}>
        Mégse
      </button>
    </div>
  </>
);

// Parfüm részletes oldalát megjelenítő komponens
const PerfumeDetail = () => {
  const { id } = useParams(); // Parfüm ID kinyerése az URL paraméterből
  const { isLoggedIn, user } = useContext(AuthContext); // Bejelentkezési állapot és felhasználói adatok a kontextusból
  const navigate = useNavigate(); // Navigációs hook

  // Állapotok deklarálása
  const [perfume, setPerfume] = useState(null); // A megjelenített parfüm adatai
  const [reviews, setReviews] = useState([]); // Parfümhöz tartozó értékelések listája
  const [editingReview, setEditingReview] = useState(null); // A szerkesztés alatt álló értékelés adatai (vagy null)
  const [isFavorite, setIsFavorite] = useState(false); // Jelzi, hogy a parfüm kedvenc-e
  const [showLoginPrompt, setShowLoginPrompt] = useState(false); // Bejelentkezési felugró ablak láthatósága
  const [isImageZoomed, setIsImageZoomed] = useState(false); // Kép nagyított állapotának jelzése
  const [message, setMessage] = useState(""); // Általános üzenetek megjelenítésére (pl. kedvenc hozzáadva)

  // Töltési állapotok
  const [loadingPerfume, setLoadingPerfume] = useState(true); // Parfüm adatok betöltése folyamatban
  const [loadingReviews, setLoadingReviews] = useState(true); // Értékelések betöltése folyamatban
  const [loadingFavoriteCheck, setLoadingFavoriteCheck] = useState(false); // Kedvenc állapot ellenőrzése folyamatban
  const [loadingFavoriteToggle, setLoadingFavoriteToggle] = useState(false); // Kedvenc állapot váltása folyamatban

  // Hiba állapotok
  const [perfumeError, setPerfumeError] = useState(""); // Hiba a parfüm adatok betöltésekor
  const [reviewError, setReviewError] = useState(""); // Hiba az értékelések betöltésekor

  // --- Parfüm Adatainak Lekérése ---
  useEffect(() => {
    // ID validálása, mielőtt lekérdeznénk
    const currentId = parseInt(id, 10);
    if (isNaN(currentId)) {
      setPerfumeError("Érvénytelen parfüm azonosító.");
      setLoadingPerfume(false);
      setLoadingReviews(false); // Érvénytelen ID esetén értékeléseket sem töltünk
      return;
    }

    let isMounted = true; // Komponens beillesztettségének figyelése (cleanup function-höz)
    // Aszinkron függvény a parfüm adatainak lekérésére
    const fetchPerfumeData = async () => {
      console.log(`PerfumeDetail: Fetching perfume data for ID: ${currentId}`);
      setLoadingPerfume(true);
      setPerfumeError("");
      setPerfume(null); // Előző parfüm adatainak törlése ID változáskor
      try {
        const perfumeData = await getPerfumeById(currentId); // Service hívás
        if (isMounted) {
          console.log("PerfumeDetail: Perfume data received:", perfumeData);
          setPerfume(perfumeData); // Állapot frissítése
        }
      } catch (err) {
        console.error("Hiba a parfüm betöltésekor:", err);
        if (isMounted) {
          setPerfumeError(
            err.message || "A parfüm részleteinek betöltése sikertelen."
          ); // Hiba állapot beállítása
        }
      } finally {
        if (isMounted) {
          setLoadingPerfume(false); // Töltési állapot kikapcsolása
        }
      }
    };

    fetchPerfumeData(); // Függvény meghívása

    // Tisztító függvény: megakadályozza az állapotfrissítést, ha a komponens időközben unmountolódott
    return () => {
      isMounted = false;
    };
  }, [id]); // Függőség: Csak akkor fut újra, ha az URL-ből kapott 'id' megváltozik

  // --- Értékelések Lekérése ---
  // useCallback használata a fetchReviews függvény memoizálására, hogy ne jöjjön létre feleslegesen újra rendereléskor
  const fetchReviews = useCallback(async () => {
    const currentId = parseInt(id, 10);
    // Csak érvényes ID esetén futtatjuk
    if (isNaN(currentId)) {
      console.log("PerfumeDetail: Skipping review fetch - invalid ID.");
      setLoadingReviews(false); // Töltés befejezése
      return;
    }

    console.log(`PerfumeDetail: Fetching reviews for ID: ${currentId}`);
    setLoadingReviews(true);
    setReviewError("");
    try {
      const data = await getReviewsForPerfume(currentId); // Service hívás
      console.log("PerfumeDetail: Reviews data received:", data);
      setReviews(data || []); // Értékelések állapotának frissítése (üres tömb, ha nincs adat)
    } catch (err) {
      console.error("Hiba az értékelések betöltésekor:", err);
      setReviewError(err.message || "Hiba az értékelések betöltésekor.");
      setReviews([]); // Hiba esetén üres lista
    } finally {
      setLoadingReviews(false); // Töltési állapot kikapcsolása
      console.log("PerfumeDetail: Review fetch finished.");
    }
  }, [id]); // Függőség: Akkor hozza létre újra a függvényt, ha az 'id' változik

  // Értékelések lekérésének indítása, amikor az 'id' (és így a memoizált fetchReviews) változik
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]); // Függőség a memoizált fetchReviews függvény

  // --- Kezdeti Kedvenc Állapot Lekérése ---
  useEffect(() => {
    let isMounted = true;
    // Aszinkron függvény a kedvenc állapot ellenőrzésére
    const checkFavoriteStatus = async () => {
      // Csak bejelentkezett felhasználó és betöltött, érvényes parfüm ID esetén fut
      if (!isLoggedIn || !perfume || !perfume.id) return;

      console.log(
        `PerfumeDetail: Checking favorite status for perfume ID: ${perfume.id}`
      );
      setLoadingFavoriteCheck(true);
      try {
        const favoriteIds = await getMyFavoriteIds(); // Service hívás (feltételezi, hogy a tokent belsőleg kezeli)
        if (isMounted) {
          const currentPerfumeId = parseInt(perfume.id, 10);
          const isFav = favoriteIds.includes(currentPerfumeId); // Tartalmazza-e a lista az aktuális ID-t?
          console.log(`PerfumeDetail: Is favorite? ${isFav}`);
          setIsFavorite(isFav); // Kedvenc állapot beállítása
        }
      } catch (error) {
        console.error("Hiba a kedvenc állapot ellenőrzésekor:", error);
        // Opcionálisan hibaüzenet a felhasználónak
      } finally {
        if (isMounted) {
          setLoadingFavoriteCheck(false); // Ellenőrzés befejezése
        }
      }
    };

    checkFavoriteStatus(); // Függvény meghívása

    return () => {
      isMounted = false;
    }; // Tisztító függvény
  }, [isLoggedIn, perfume]); // Függőségek: Újra lefut, ha a bejelentkezési állapot vagy a parfüm adatok változnak

  // --- Eseménykezelők (useCallback-kel memoizálva a felesleges újradefiniálás elkerülésére) ---

  // Kedvenc állapot váltását kezelő függvény
  const handleToggleFavorite = useCallback(async () => {
    if (!isLoggedIn) {
      // Ha nincs bejelentkezve, modal megjelenítése
      setShowLoginPrompt(true);
      return;
    }
    // Ne fusson, ha már folyamatban van a váltás, vagy nincs parfüm adat
    if (loadingFavoriteToggle || !perfume || !perfume.id) return;

    setLoadingFavoriteToggle(true); // Töltés indítása
    setMessage(""); // Korábbi üzenet törlése
    const perfumeIdInt = parseInt(perfume.id, 10); // ID konvertálása számmá

    try {
      if (isFavorite) {
        // Ha jelenleg kedvenc -> eltávolítás
        await removeFavorite(perfumeIdInt);
        setIsFavorite(false);
        setMessage("Parfüm eltávolítva a kedvencekből.");
      } else {
        // Ha nem kedvenc -> hozzáadás
        await addFavorite(perfumeIdInt);
        setIsFavorite(true);
        setMessage("Parfüm hozzáadva a kedvencekhez.");
      }
      setTimeout(() => setMessage(""), 3000); // Üzenet eltüntetése 3 mp után
    } catch (error) {
      console.error("Hiba a kedvencek kezelésekor:", error);
      setMessage(
        `Hiba történt: ${
          error.message || "Nem sikerült módosítani a kedvencet."
        }`
      );
      setTimeout(() => setMessage(""), 5000); // Hibaüzenet eltüntetése 5 mp után
    } finally {
      setLoadingFavoriteToggle(false); // Töltés befejezése
    }
  }, [isLoggedIn, isFavorite, loadingFavoriteToggle, perfume]); // Függőségek

  // Új értékelés beküldése utáni kezelő
  const handleReviewSubmitted = useCallback((newReview) => {
    console.log("PerfumeDetail: handleReviewSubmitted called with:", newReview);
    // Új értékelés hozzáadása a lista elejére
    setReviews((prevReviews) => [newReview, ...prevReviews]);
    setEditingReview(null); // Szerkesztési mód kikapcsolása
    setMessage("Értékelés sikeresen elküldve!");
    setTimeout(() => setMessage(""), 3000);
    // Opcionális: Lista újratöltése a szerverről a konzisztencia érdekében: fetchReviews();
  }, []); // Nincs függőség, csak állapotot módosít

  // Értékelés szerkesztésének indítása
  const handleEditReview = useCallback((reviewToEdit) => {
    console.log(
      "PerfumeDetail: handleEditReview called for review:",
      reviewToEdit
    );
    setEditingReview(reviewToEdit); // Beállítja a szerkesztendő értékelést
    // Opcionális: Gördítés az űrlaphoz
    document
      .getElementById("review-form-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []); // Nincs függőség

  // Szerkesztés megszakítása
  const handleCancelEdit = useCallback(() => {
    console.log("PerfumeDetail: handleCancelEdit called");
    setEditingReview(null); // Szerkesztési mód kikapcsolása
  }, []); // Nincs függőség

  // Értékelés frissítése utáni kezelő (ezt a ReviewForm hívja meg)
  const handleUpdateReview = useCallback((updatedReviewData) => {
    console.log(
      "PerfumeDetail: handleUpdateReview called with:",
      updatedReviewData
    );
    // Frissíti az értékelést a listában
    setReviews((prevReviews) =>
      prevReviews.map((review) =>
        review.id === updatedReviewData.id ? updatedReviewData : review
      )
    );
    setEditingReview(null); // Szerkesztési mód kikapcsolása
    setMessage("Értékelés sikeresen frissítve!");
    setTimeout(() => setMessage(""), 3000);
    // Opcionális: Lista újratöltése a szerverről: fetchReviews();
  }, []); // Nincs függőség

  // Értékelés törlését kezelő függvény
  const handleDeleteReview = useCallback(async (reviewId) => {
    console.log("PerfumeDetail: handleDeleteReview called for ID:", reviewId);
    // Megerősítés kérése a felhasználótól
    if (!window.confirm("Biztosan törölni szeretnéd ezt az értékelést?")) {
      return;
    }
    setMessage("");
    // Opcionális: Törlési töltési állapot kezelése
    try {
      await deleteReviewService(reviewId); // Service hívás a törléshez
      // Értékelés eltávolítása a listából
      setReviews((prevReviews) => prevReviews.filter((r) => r.id !== reviewId));
      setMessage("Értékelés sikeresen törölve.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Hiba az értékelés törlésekor:", error);
      setMessage(
        `Hiba történt a törléskor: ${error.message || "Nem sikerült törölni."}`
      );
      setTimeout(() => setMessage(""), 5000);
    }
  }, []); // Nincs függőség

  // Kép nagyítás/bezárás kezelői
  const handleImageZoom = useCallback(() => setIsImageZoomed(true), []);
  const handleImageClose = useCallback(() => setIsImageZoomed(false), []);
  // Bejelentkezési prompt bezárás/átirányítás kezelői
  const handleCloseLoginPrompt = useCallback(
    () => setShowLoginPrompt(false),
    []
  );
  const handleLoginRedirect = useCallback(
    () => navigate("/bejelentkezes"),
    [navigate]
  ); // navigate függőség

  // --- Segédfüggvények ---
  // Ár formázása ("xxxx Ft-tól")
  const formattedPrice = () => {
    // Ellenőrzi, hogy van-e bolt adat
    if (!perfume || !perfume.stores || perfume.stores.length === 0) {
      return "Ár információ nem elérhető";
    }
    // Kinyeri és validálja az árakat
    const prices = perfume.stores
      .map((store) => Number(store.price))
      .filter((price) => !isNaN(price) && price > 0);

    if (prices.length === 0) {
      return "Ár információ nem elérhető";
    }

    const minPrice = Math.min(...prices); // Legkisebb ár kiválasztása
    // Formázás forintra, tizedesjegy nélkül
    const formatted = new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency: "HUF",
      maximumFractionDigits: 0,
    }).format(minPrice);
    return `${formatted}-tól`; // "-tól" hozzáadása
  };

  // --- Renderelési Logika ---
  return (
    <div className="perfume-detail-container">
      {/* Fő konténer */}
      <div className="container">
        {/* --- Vissza Gomb --- */}
        <button className="back-btn mb-3" onClick={() => navigate(-1)}>
          {/* Előző oldalra navigál */}← Vissza
        </button>
        {/* --- Parfüm Töltés / Hiba --- */}
        {loadingPerfume && (
          <div className="text-center text-muted my-5">
            Parfüm adatok betöltése...
          </div>
        )}
        {perfumeError && !loadingPerfume && (
          <div className="alert alert-danger text-center">{perfumeError}</div>
        )}
        {/* --- Parfüm Részletek Megjelenítése (ha betöltődött és nincs hiba) --- */}
        {perfume && !loadingPerfume && (
          <>
            {/* --- Parfüm Fejléc (Cím és Kedvenc Gomb) --- */}
            <div className="perfume-title-wrapper">
              <h1 className="perfume-title-top">{perfume.name}</h1>
              {/* Kedvenc Gomb */}
              <button
                className={`favorite-btn ${isFavorite ? "active" : ""} ${
                  loadingFavoriteCheck || loadingFavoriteToggle
                    ? "disabled"
                    : "" // Letiltva ellenőrzés vagy váltás alatt
                }`}
                onClick={handleToggleFavorite}
                disabled={loadingFavoriteCheck || loadingFavoriteToggle}
                aria-label={
                  // Akadálymentesítés
                  isFavorite
                    ? "Eltávolítás a kedvencekből"
                    : "Hozzáadás a kedvencekhez"
                }
              />
            </div>

            <div className="perfume-detail-content">
              {/* Fő tartalom rácsa/flexboxa */}
              {/* --- Kép Szekció --- */}
              <div className="perfume-image-wrapper">
                {/* Nagyított kép megjelenítése (ha aktív) */}
                {isImageZoomed ? (
                  <div
                    className="zoomed-image-container"
                    onClick={handleImageClose}
                  >
                    {/* Háttérre kattintva bezár */}
                    <img
                      src={
                        perfume.image_url ||
                        "https://via.placeholder.com/600?text=Nincs+kép"
                      }
                      alt={perfume.name}
                      className="zoomed-image"
                      onClick={(e) => e.stopPropagation()} // Képre kattintva nem záródik be
                    />
                    <button
                      className="close-zoom-btn"
                      onClick={handleImageClose}
                    ></button>
                    {/* Bezáró gomb */}
                  </div>
                ) : (
                  /* Normál kép (nagyítható) */
                  <img
                    src={
                      perfume.image_url ||
                      "https://via.placeholder.com/500?text=Nincs+kép"
                    }
                    alt={perfume.name}
                    className="perfume-image"
                    onClick={handleImageZoom} // Kattintásra nagyít
                    style={{ cursor: "zoom-in" }} // Kurzorként nagyító ikon
                  />
                )}
              </div>
              {/* --- Információk Szekció --- */}
              <div className="perfume-info">
                <p className="perfume-brand">
                  <strong>Márka:</strong> {perfume.brand_name || "Ismeretlen"}
                </p>
                <p className="perfume-gender">
                  <strong>Kategória: </strong>
                  {perfume.gender === "female"
                    ? "Női"
                    : perfume.gender === "male"
                    ? "Férfi"
                    : "Unisex"}
                </p>
                {/* Illatjegyek listázása */}
                <div className="perfume-notes mb-3">
                  <strong>Illatjegyek:</strong>
                  {perfume.notes && perfume.notes.length > 0 ? (
                    perfume.notes.map((note, index) => (
                      <span key={index} className="scent-tag">
                        {note}
                      </span>
                    )) // Címkék a jegyeknek
                  ) : (
                    <span className="text-muted">Nincsenek megadva</span>
                  )}
                </div>
                <p
                  className={`perfume-price ${
                    !perfume.stores || perfume.stores.length === 0
                      ? "text-muted"
                      : ""
                  }`}
                >
                  {/* Ár, szürke ha nincs adat */}
                  {formattedPrice()}
                </p>
                <p className="perfume-description">
                  <strong>Leírás: </strong>
                  {perfume.description || "Nincs leírás."}
                </p>
              </div>
              {/* --- Boltok Szekció --- */}
              {/* Megjelenítés csak ha vannak boltok */}
              {perfume.stores && perfume.stores.length > 0 && (
                <div className="stores-section">
                  <h2 className="stores-title">Elérhető webáruházak</h2>
                  <div className="stores-list">
                    {/* Boltok listázása */}
                    {perfume.stores.map((store, index) => (
                      <div key={index} className="store-item">
                        <span className="store-name">{store.store_name}</span>
                        <a
                          href={store.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="store-link"
                        >
                          Megnézem → {/* Link a bolt oldalára */}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Üzenet, ha nincsenek boltok */}
              {(!perfume.stores || perfume.stores.length === 0) && (
                <div className="stores-section">
                  <h2 className="stores-title">Elérhető webáruházak</h2>
                  <p className="no-stores text-muted">
                    Jelenleg nem listázott egy webáruházban sem.
                  </p>
                </div>
              )}
              {/* --- Értékelések Szekció --- */}
              <div className="reviews-section mt-4" id="review-form-section">
                {/* ID az űrlaphoz görgetéshez */}
                <h2 className="reviews-title">Értékelések</h2>
                {/* Értékelő Űrlap Terület */}
                {isLoggedIn ? ( // Csak bejelentkezett felhasználóknak
                  <ReviewForm
                    perfumeId={perfume.id} // Parfüm ID átadása
                    key={editingReview ? `edit-${editingReview.id}` : "new"} // Kulcs az űrlap újrarendereléséhez szerkesztéskor
                    initialData={editingReview} // Kezdeti adatok szerkesztéshez
                    onReviewSubmitted={handleReviewSubmitted} // Új értékelés beküldésekor hívódik
                    onReviewUpdated={handleUpdateReview} // Értékelés frissítésekor hívódik
                    onCancelEdit={handleCancelEdit} // Szerkesztés megszakításakor hívódik
                  />
                ) : (
                  // Üzenet kijelentkezett felhasználóknak (csak ha nem szerkesztünk éppen)
                  !editingReview && (
                    <p className="login-required-message">
                      Bejelentkezés szükséges az értékelés írásához.
                      <button
                        className="btn btn-link"
                        onClick={() => setShowLoginPrompt(true)}
                      >
                        Bejelentkezés
                      </button>
                    </p>
                  )
                )}
                {/* Értékelések Listája Terület */}
                {reviewError && !loadingReviews && (
                  <div className="alert alert-warning">{reviewError}</div>
                )}
                {/* Hibaüzenet */}
                {/* Értékelések listájának átadása a ReviewList komponensnek */}
                <ReviewList
                  reviews={reviews} // Az értékelések állapota
                  loading={loadingReviews} // Töltési állapot
                  currentUserId={user?.id} // Aktuális felhasználó ID-ja (szerkesztés/törlés jogosultsághoz)
                  onEdit={handleEditReview} // Szerkesztés gomb kezelője
                  onDelete={handleDeleteReview} // Törlés gomb kezelője
                />
              </div>
            </div>
          </>
        )}
        {/* Parfüm részletek renderelésének vége */}
        {/* --- Általános Üzenet Megjelenítő --- */}
        {message && (
          <div className="message-prompt">
            <p>{message}</p>
            <button onClick={() => setMessage("")}>Bezár</button>
          </div>
        )}
        {/* --- Bejelentkezési Felugró Ablak (feltételesen jelenik meg) --- */}
        {showLoginPrompt && (
          <LoginPromptModal
            onClose={handleCloseLoginPrompt}
            onLoginRedirect={handleLoginRedirect}
          />
        )}
      </div>
      {/* container vége */}
    </div> // perfume-detail-container vége
  );
};

export default PerfumeDetail;
