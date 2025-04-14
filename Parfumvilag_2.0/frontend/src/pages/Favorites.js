import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import PerfumeCard from "../components/PerfumeCard";
import { getMyFavoritePerfumesDetails } from "../services/savedPerfumeService";
import { AuthContext } from "../App";
import "../style.css"; // Ensure styles are imported

const Favorites = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const [favoritePerfumes, setFavoritePerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/bejelentkezes");
      return;
    }

    const fetchFavoriteDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const perfumesData = await getMyFavoritePerfumesDetails();
        setFavoritePerfumes(perfumesData);
      } catch (err) {
        console.error("Hiba a kedvenc parfümök adatainak lekérésekor:", err);
        setError(err.message || "Nem sikerült betölteni a kedvenceket.");
        setFavoritePerfumes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteDetails();
  }, [isLoggedIn, navigate]);

  if (loading) {
    return (
      <div className="container text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Kedvencek betöltése...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="favorites-page container my-5">
      <h1 className="text-center mb-4 section-title">Kedvenc Parfümjeim</h1>
      {favoritePerfumes.length === 0 ? (
        <div id="noResults" className="text-center card p-4">
          <i className="fas fa-heart-broken fa-3x mb-3 text-secondary"></i>
          <h4>Nincsenek kedvenceid</h4>
          <p className="text-muted">
            Jelöld meg a parfümöket egy szívvel, hogy ide kerüljenek!
          </p>
        </div>
      ) : (
        // Alkalmazzuk az id="perfumeList"-et és a g-3 gap-et
        <div className="row g-3" id="perfumeList2">
          {favoritePerfumes.map((perfume) => (
            // Használjuk a Bootstrap oszlopokat és a stretch igazítást
            <div
              key={perfume.id}
              className="col-lg-3 col-md-4 col-sm-6 col-12 d-flex align-items-stretch"
            >
              <PerfumeCard perfume={perfume} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
