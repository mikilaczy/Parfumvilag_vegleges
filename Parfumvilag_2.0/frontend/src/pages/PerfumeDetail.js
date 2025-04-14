// --- START OF FILE PerfumeDetail.js ---

import React, { useState, useEffect, useContext, useCallback } from "react"; // Added useCallback
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
  updateReview as updateReviewService
} from "../services/reviewService";
import { AuthContext } from "../App";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import "../style.css";

// Login Prompt Modal Component (kept separate for clarity)
const LoginPromptModal = ({ onClose, onLoginRedirect }) => (
  <>
    <div className="login-prompt-overlay" onClick={onClose} />
    <div className="login-prompt">
      <button className="close-btn" onClick={onClose}>
        ×
      </button>
      <h3>Bejelentkezés szükséges</h3>
      <p>
        A funkció használatához be kell jelentkezned.
      </p>
      <button className="login-btn" onClick={onLoginRedirect}>
        Bejelentkezés
      </button>
      <button className="cancel-btn" onClick={onClose}>
        Mégse
      </button>
    </div>
  </>
);


const PerfumeDetail = () => {
  const { id } = useParams();
  const { isLoggedIn, user } = useContext(AuthContext); // Removed token, usually not needed directly if services handle it
  const navigate = useNavigate();

  // State declarations
  const [perfume, setPerfume] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null); // null | reviewObject
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [message, setMessage] = useState("");

  // Loading states
  const [loadingPerfume, setLoadingPerfume] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingFavoriteCheck, setLoadingFavoriteCheck] = useState(false);
  const [loadingFavoriteToggle, setLoadingFavoriteToggle] = useState(false);

  // Error states
  const [perfumeError, setPerfumeError] = useState("");
  const [reviewError, setReviewError] = useState("");

  // --- Fetch Perfume Data ---
  useEffect(() => {
    // Ensure ID is valid before fetching
    const currentId = parseInt(id, 10);
    if (isNaN(currentId)) {
        setPerfumeError("Érvénytelen parfüm azonosító.");
        setLoadingPerfume(false);
        setLoadingReviews(false); // Don't attempt to load reviews for invalid ID
        return;
    }

    let isMounted = true;
    const fetchPerfumeData = async () => {
      console.log(`PerfumeDetail: Fetching perfume data for ID: ${currentId}`);
      setLoadingPerfume(true);
      setPerfumeError("");
      setPerfume(null); // Reset perfume data on ID change
      try {
        const perfumeData = await getPerfumeById(currentId);
        if (isMounted) {
            console.log("PerfumeDetail: Perfume data received:", perfumeData);
            setPerfume(perfumeData);
        }
      } catch (err) {
        console.error("Hiba a parfüm betöltésekor:", err);
        if (isMounted) {
            setPerfumeError(err.message || "A parfüm részleteinek betöltése sikertelen.");
        }
      } finally {
        if (isMounted) {
            setLoadingPerfume(false);
        }
      }
    };

    fetchPerfumeData();

    return () => { isMounted = false; }; // Cleanup function
  }, [id]); // Dependency: Only re-run if the ID from URL changes

  // --- Fetch Reviews ---
  // Use useCallback to memoize fetchReviews unless id changes
  const fetchReviews = useCallback(async () => {
    const currentId = parseInt(id, 10);
    if (isNaN(currentId) || !perfume) { // Also wait for perfume data to exist? Or fetch independently? Let's fetch independently.
        if (isNaN(currentId)) return; // Only proceed if ID is valid
        console.log("PerfumeDetail: Skipping review fetch - invalid ID or perfume not loaded yet.");
        // If perfume must be loaded first, add !perfume check above and trigger fetchReviews in perfume's useEffect success block
    };

    console.log(`PerfumeDetail: Fetching reviews for ID: ${currentId}`);
    setLoadingReviews(true);
    setReviewError("");
    try {
      const data = await getReviewsForPerfume(currentId);
      console.log("PerfumeDetail: Reviews data received:", data);
      // Ensure component is still mounted before setting state
      // This check might be redundant if useCallback handles it, but good practice
      setReviews(data || []); // Set state directly in the component where it's defined
    } catch (err) {
      console.error("Hiba az értékelések betöltésekor:", err);
      setReviewError(err.message || "Hiba az értékelések betöltésekor.");
      setReviews([]); // Clear reviews on error
    } finally {
        setLoadingReviews(false);
        console.log("PerfumeDetail: Review fetch finished.");
    }
  }, [id]); // Dependency: Only recreate fetchReviews if id changes

  // Trigger review fetch when ID changes
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]); // Depend on the memoized fetchReviews function

  // --- Fetch Initial Favorite Status ---
  useEffect(() => {
    let isMounted = true;
    const checkFavoriteStatus = async () => {
      // Requires login, valid perfume ID, and loaded perfume data
      if (!isLoggedIn || !perfume || !perfume.id) return;

      console.log(`PerfumeDetail: Checking favorite status for perfume ID: ${perfume.id}`);
      setLoadingFavoriteCheck(true);
      try {
        const favoriteIds = await getMyFavoriteIds(); // Assuming this uses the token internally
        if (isMounted) {
          const currentPerfumeId = parseInt(perfume.id, 10);
          const isFav = favoriteIds.includes(currentPerfumeId);
          console.log(`PerfumeDetail: Is favorite? ${isFav}`);
          setIsFavorite(isFav);
        }
      } catch (error) {
        console.error("Hiba a kedvenc állapot ellenőrzésekor:", error);
        // Optionally show a user message
      } finally {
        if (isMounted) {
          setLoadingFavoriteCheck(false);
        }
      }
    };

    checkFavoriteStatus();

    return () => { isMounted = false; }; // Cleanup
  }, [isLoggedIn, perfume]); // Re-run when login status or perfume data changes

  // --- Handlers (Memoized with useCallback) ---

  const handleToggleFavorite = useCallback(async () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    if (loadingFavoriteToggle || !perfume || !perfume.id) return;

    setLoadingFavoriteToggle(true);
    setMessage("");
    const perfumeIdInt = parseInt(perfume.id, 10);

    try {
      if (isFavorite) {
        await removeFavorite(perfumeIdInt);
        setIsFavorite(false);
        setMessage("Parfüm eltávolítva a kedvencekből.");
      } else {
        await addFavorite(perfumeIdInt);
        setIsFavorite(true);
        setMessage("Parfüm hozzáadva a kedvencekhez.");
      }
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Hiba a kedvencek kezelésekor:", error);
      setMessage(`Hiba történt: ${error.message || "Nem sikerült módosítani a kedvencet."}`);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setLoadingFavoriteToggle(false);
    }
  }, [isLoggedIn, isFavorite, loadingFavoriteToggle, perfume]);

  const handleReviewSubmitted = useCallback((newReview) => {
    console.log("PerfumeDetail: handleReviewSubmitted called with:", newReview);
    setReviews((prevReviews) => [newReview, ...prevReviews]);
    setEditingReview(null); // Ensure edit mode is off
    setMessage("Értékelés sikeresen elküldve!");
    setTimeout(() => setMessage(""), 3000);
    // Optionally re-fetch reviews to ensure consistency: fetchReviews();
  }, []); // No dependencies needed if it only sets state

  const handleEditReview = useCallback((reviewToEdit) => {
    console.log("PerfumeDetail: handleEditReview called for review:", reviewToEdit);
    setEditingReview(reviewToEdit);
    // Scroll to form
    document.getElementById('review-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []); // No dependencies needed

  const handleCancelEdit = useCallback(() => {
    console.log("PerfumeDetail: handleCancelEdit called");
    setEditingReview(null);
  }, []); // No dependencies needed

  const handleUpdateReview = useCallback((updatedReviewData) => {
    console.log("PerfumeDetail: handleUpdateReview called with:", updatedReviewData);
    setReviews(prevReviews =>
      prevReviews.map(review =>
        review.id === updatedReviewData.id ? updatedReviewData : review
      )
    );
    setEditingReview(null);
    setMessage("Értékelés sikeresen frissítve!");
    setTimeout(() => setMessage(""), 3000);
     // Optionally re-fetch reviews: fetchReviews();
  }, []); // No dependencies needed if it only sets state

  const handleDeleteReview = useCallback(async (reviewId) => {
    console.log("PerfumeDetail: handleDeleteReview called for ID:", reviewId);
    if (!window.confirm("Biztosan törölni szeretnéd ezt az értékelést?")) {
      return;
    }
    setMessage("");
    // Consider adding a loading state for deletion
    try {
      await deleteReviewService(reviewId);
      setReviews((prevReviews) => prevReviews.filter((r) => r.id !== reviewId));
      setMessage("Értékelés sikeresen törölve.");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Hiba az értékelés törlésekor:", error);
      setMessage(`Hiba történt a törléskor: ${error.message || "Nem sikerült törölni."}`);
      setTimeout(() => setMessage(""), 5000);
    }
  }, []); // No dependencies needed

  const handleImageZoom = useCallback(() => setIsImageZoomed(true), []);
  const handleImageClose = useCallback(() => setIsImageZoomed(false), []);
  const handleCloseLoginPrompt = useCallback(() => setShowLoginPrompt(false), []);
  const handleLoginRedirect = useCallback(() => navigate("/bejelentkezes"), [navigate]);

  // --- Helper Functions ---
  const formattedPrice = () => {
    if (!perfume || !perfume.stores || perfume.stores.length === 0) {
      return "Ár információ nem elérhető";
    }
    const prices = perfume.stores
      .map((store) => Number(store.price))
      .filter((price) => !isNaN(price) && price > 0); // Filter out invalid/zero prices

    if (prices.length === 0) {
      return "Ár információ nem elérhető";
    }

    const minPrice = Math.min(...prices);
    const formatted = new Intl.NumberFormat("hu-HU", { style: 'currency', currency: 'HUF', maximumFractionDigits: 0 }).format(minPrice);
    return `${formatted}-tól`; // Format as currency
  };

  // --- Render Logic ---
  return (
    <div className="perfume-detail-container">
      <div className="container">
        {/* --- Back Button --- */}
        <button className="back-btn mb-3" onClick={() => navigate(-1)}>
          ← Vissza
        </button>

        {/* --- Loading / Error for Perfume --- */}
        {loadingPerfume && (
          <div className="text-center text-muted my-5">Parfüm adatok betöltése...</div>
        )}
        {perfumeError && !loadingPerfume && (
          <div className="alert alert-danger text-center">{perfumeError}</div>
        )}

        {/* --- Render Perfume Details When Loaded --- */}
        {perfume && !loadingPerfume && (
          <>
            {/* --- Perfume Header --- */}
            <div className="perfume-title-wrapper">
              <h1 className="perfume-title-top">{perfume.name}</h1>
              {/* Favorite Button - Conditionally render if logged in? Or show login prompt */}
              <button
                className={`favorite-btn ${isFavorite ? "active" : ""} ${
                  loadingFavoriteCheck || loadingFavoriteToggle ? "disabled" : "" // Disable during check and toggle
                }`}
                onClick={handleToggleFavorite}
                disabled={loadingFavoriteCheck || loadingFavoriteToggle}
                aria-label={
                  isFavorite
                    ? "Eltávolítás a kedvencekből"
                    : "Hozzáadás a kedvencekhez"
                }
              />
            </div>

            <div className="perfume-detail-content">
              {/* --- Image Section --- */}
              <div className="perfume-image-wrapper">
                {isImageZoomed ? (
                  <div className="zoomed-image-container" onClick={handleImageClose}>
                    <img
                      src={perfume.image_url || "https://via.placeholder.com/600?text=Nincs+kép"}
                      alt={perfume.name}
                      className="zoomed-image"
                      onClick={(e) => e.stopPropagation()} // Prevent closing on image click
                    />
                    <button className="close-zoom-btn" onClick={handleImageClose}> × </button>
                  </div>
                ) : (
                  <img
                    src={perfume.image_url || "https://via.placeholder.com/500?text=Nincs+kép"}
                    alt={perfume.name}
                    className="perfume-image"
                    onClick={handleImageZoom}
                    style={{ cursor: "zoom-in" }}
                  />
                )}
              </div>

              {/* --- Info Section --- */}
              <div className="perfume-info">
                <p className="perfume-brand"><strong>Márka:</strong> {perfume.brand_name || "Ismeretlen"}</p>
                <p className="perfume-gender"><strong>Kategória:</strong> {perfume.gender === "female" ? "Női" : perfume.gender === "male" ? "Férfi" : "Unisex"}</p>
                <div className="perfume-notes mb-3"> {/* Wrap notes for better spacing */}
                    <strong>Illatjegyek:</strong>{" "}
                    {perfume.notes && perfume.notes.length > 0
                      ? perfume.notes.map((note, index) => (<span key={index} className="scent-tag">{note}</span>))
                      : <span className="text-muted">Nincsenek megadva</span>}
                </div>
                <p className={`perfume-price ${!perfume.stores || perfume.stores.length === 0 ? "text-muted" : ""}`}>
                    {formattedPrice()}
                </p>
                <p className="perfume-description"><strong>Leírás:</strong> {perfume.description || "Nincs leírás."}</p>
              </div>

              {/* --- Stores Section --- */}
              {perfume.stores && perfume.stores.length > 0 && (
                 <div className="stores-section">
                  <h2 className="stores-title">Elérhető webáruházak</h2>
                    <div className="stores-list">
                      {perfume.stores.map((store, index) => (
                        <div key={index} className="store-item">
                          <span className="store-name">{store.store_name}</span>
                          <a href={store.url} target="_blank" rel="noopener noreferrer" className="store-link">
                            Megnézem →
                          </a>
                        </div>
                      ))}
                    </div>
                </div>
              )}
              {(!perfume.stores || perfume.stores.length === 0) && (
                 <div className="stores-section">
                     <h2 className="stores-title">Elérhető webáruházak</h2>
                     <p className="no-stores text-muted">Jelenleg nem listázott egy webáruházban sem.</p>
                 </div>
              )}


              {/* --- Reviews Section --- */}
              <div className="reviews-section mt-4" id="review-form-section">
                <h2 className="reviews-title">Értékelések</h2>

                {/* Review Form Area */}
                {isLoggedIn ? (
                    <ReviewForm
                        perfumeId={perfume.id} // Use perfume.id here
                        key={editingReview ? `edit-${editingReview.id}` : 'new'}
                        initialData={editingReview}
                        onReviewSubmitted={handleReviewSubmitted}
                        onReviewUpdated={handleUpdateReview}
                        onCancelEdit={handleCancelEdit}
                    />
                ) : (
                    // Show login message only if not editing
                    !editingReview && (
                        <p className="login-required-message">
                        Bejelentkezés szükséges az értékelés írásához.
                        <button className="btn btn-link" onClick={() => setShowLoginPrompt(true)}>
                            Bejelentkezés
                        </button>
                        </p>
                    )
                )}

                {/* Review List Area */}
                {reviewError && !loadingReviews && <div className="alert alert-warning">{reviewError}</div>}
                {/* Pass reviews state directly */}
                <ReviewList
                    reviews={reviews}
                    loading={loadingReviews}
                    currentUserId={user?.id} // Pass the current user's ID
                    onEdit={handleEditReview}
                    onDelete={handleDeleteReview}
                />
              </div>
            </div>
          </>
        )} {/* End of rendering perfume details */}

        {/* --- General Message Prompt --- */}
        {message && (
          <div className="message-prompt">
            <p>{message}</p>
            <button onClick={() => setMessage("")}>Bezár</button>
          </div>
        )}

        {/* --- Login Prompt Modal --- */}
        {showLoginPrompt && (
          <LoginPromptModal
            onClose={handleCloseLoginPrompt}
            onLoginRedirect={handleLoginRedirect}
          />
        )}
      </div> {/* End of container */}
    </div> // End of perfume-detail-container
  );
};

export default PerfumeDetail;
// --- END OF FILE PerfumeDetail.js ---