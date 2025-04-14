// frontend/src/components/PerfumeCard.js
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../App"; // AuthContext importálása
import {
  getMyFavoriteIds,
  addFavorite,
  removeFavorite,
} from "../services/savedPerfumeService";
import "../style.css";

// Login Prompt Modal Component (Simple Example)
const LoginPromptModal = ({ onClose, onLoginRedirect }) => (
  <>
    <div className="login-prompt-overlay" onClick={onClose} />
    <div className="login-prompt">
      <button className="close-btn" onClick={onClose}>
        ×
      </button>
      <h3>Bejelentkezés szükséges</h3>
      <p>Be kell jelentkezni a kedvencek kezeléséhez.</p>
      <div className="d-flex justify-content-center mt-3">
        {" "}
        {/* Buttons centered */}
        <button className="login-btn me-2" onClick={onLoginRedirect}>
          {" "}
          {/* Added margin */}
          Bejelentkezés
        </button>
        <button className="cancel-btn" onClick={onClose}>
          Mégse
        </button>
      </div>
    </div>
  </>
);

const PerfumeCard = ({ perfume, onFavoriteChange }) => {
  // Destructuring perfume properties with defaults
  const {
    id,
    name = "Ismeretlen Parfüm",
    brand_name: brand,
    price,
    image_url,
  } = perfume || {};

  // Auth context and navigation
  const { isLoggedIn, token, logout } = useContext(AuthContext); // Get logout from context
  const navigate = useNavigate();

  // Component state
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false); // Loading state specifically for toggle action

  // Format price function
  const formattedPrice = () => {
    if (price === undefined || price === null) {
      return "Ár információ nem elérhető";
    }
    // Format with HUF currency, no fraction digits
    return new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency: "HUF",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Effect to check initial favorite status
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const checkIfFavorite = async () => {
      // Skip check if not logged in or perfume ID is missing
      if (!isLoggedIn || !id) {
        if (isMounted) setIsFavorite(false); // Ensure it's false if not logged in
        return;
      }

      // No visual loading indicator for the initial check needed here
      // setLoadingFavorite(true); // <-- Removed

      try {
        // console.log(`PerfumeCard (${id}): Checking favorite status...`);
        const favoriteIds = await getMyFavoriteIds(); // Fetch user's favorite IDs
        if (isMounted) {
          const fav = favoriteIds.includes(id);
          // console.log(`PerfumeCard (${id}): Is favorite? ${fav}`);
          setIsFavorite(fav); // Update local state based on fetched data
        }
      } catch (error) {
        console.error(
          `PerfumeCard (${id}): Hiba a kedvenc állapot ellenőrzésekor:`,
          error
        );

        // Check if the error indicates an invalid/expired token
        if (error && error.error === "Token érvénytelen!") {
          console.warn(
            `PerfumeCard (${id}): Invalid token detected during check. Logging out.`
          );
          if (isMounted) {
            logout(); // Call context logout function
            // No need to navigate here, protected routes or App.js will handle redirection
          }
        } else if (isMounted) {
          // Handle other errors (e.g., network error) - maybe log or ignore
          console.error(
            `PerfumeCard (${id}): Other error checking favorite status:`,
            error.message
          );
          // Keep isFavorite as false in case of non-auth errors during check
          setIsFavorite(false);
        }
      } finally {
        // No loading state to reset here for the initial check
        // setLoadingFavorite(false); // <-- Removed
      }
    };

    checkIfFavorite(); // Run the check function

    return () => {
      isMounted = false;
    };
  }, [id, isLoggedIn, token, logout]);

 
  const handleToggleFavorite = async (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

  
    if (loadingFavorite || !id) return;

    setLoadingFavorite(true); 

    try {
      let nowFavorite;
      
      if (isFavorite) {
        await removeFavorite(id); 
        nowFavorite = false;
      } else {
        await addFavorite(id); 
        nowFavorite = true;
      }

      setIsFavorite(nowFavorite);

      
      if (onFavoriteChange) {
        onFavoriteChange(id, nowFavorite);
      }
    } catch (error) {
      console.error(
        `PerfumeCard (${id}): Hiba a kedvencek kezelésekor:`,
        error
      );

  
      if (error && error.error === "Token érvénytelen!") {
        console.warn(
          `PerfumeCard (${id}): Invalid token detected on toggle. Logging out.`
        );
        logout(); 
      } else {
      
        alert(
          `Hiba: ${error.message || "Nem sikerült módosítani a kedvencet."}`
        );
      }
    } finally {
      setLoadingFavorite(false); // Stop loading indicator regardless of outcome
    }
  };

  // JSX for the component
  return (
    <>
      {/* Perfume Card Structure */}
      <div className="perfume-card h-100">
        {/* Link wrapping the main content */}
        <Link
          to={`/parfume/${id}`} // Navigate to detail page on click
          className="perfume-card-link d-flex flex-column h-100"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          {/* Perfume Image */}
          <img
            src={image_url || "https://via.placeholder.com/220x200?text=Parfüm"} // Placeholder image
            alt={name}
            className="perfume-card-img" // Ensure CSS handles height/object-fit
          />
          {/* Card Body */}
          <div className="perfume-card-body d-flex flex-column flex-grow-1 justify-content-between">
            {/* Top part of the body (Title, Brand, Price) */}
            <div>
              <h3 className="perfume-card-title">{name}</h3>
              {/* Display brand if available */}
              {brand && (
                <p className="perfume-card-subtitle text-muted small mb-1">
                  {brand}
                </p>
              )}
              <p className="perfume-card-text">{formattedPrice()}</p>
            </div>
            {/* Bottom part could contain other info or actions if needed */}
          </div>
        </Link>

        {/* Favorite Button (positioned absolutely via CSS) */}
        <button
          className={`favorite-btn ${isFavorite ? "active" : ""} ${
            loadingFavorite ? "disabled" : "" // Add disabled class when loading
          }`}
          onClick={handleToggleFavorite}
          disabled={loadingFavorite} // Disable button during API call
          aria-label={
            isFavorite
              ? "Eltávolítás a kedvencekből"
              : "Hozzáadás a kedvencekhez"
          }
          // The heart icon (♥) is added via CSS ::before pseudo-element
        />
      </div>

      {/* Login Prompt Modal (conditionally rendered) */}
      {showLoginPrompt && (
        <LoginPromptModal
          onClose={() => setShowLoginPrompt(false)} // Handler to close the modal
          onLoginRedirect={() => navigate("/bejelentkezes")} // Handler to redirect to login
        />
      )}
    </>
  );
};

export default PerfumeCard;
