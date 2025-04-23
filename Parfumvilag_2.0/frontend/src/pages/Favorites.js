import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import PerfumeCard from "../components/PerfumeCard";
import { getMyFavoritePerfumesDetails } from "../services/savedPerfumeService";
import { AuthContext } from "../App";
import "../style.css";

// A Kedvencek oldalt megjelenítő komponens
const Favorites = () => {
  // Kontextus és állapotok inicializálása
  const { isLoggedIn } = useContext(AuthContext); // Bejelentkezési állapot lekérdezése
  const [favoritePerfumes, setFavoritePerfumes] = useState([]); // Kedvenc parfümök adatainak tárolása
  const [loading, setLoading] = useState(true); // Töltési állapot jelzése
  const [error, setError] = useState(null); // Hibaüzenetek tárolása
  const navigate = useNavigate(); // Navigációs hook inicializálása

  // useEffect hook: Komponens beillesztésekor vagy függőségek változásakor fut le
  useEffect(() => {
    // Ellenőrzés: Ha a felhasználó nincs bejelentkezve, átirányítjuk a bejelentkezési oldalra
    if (!isLoggedIn) {
      navigate("/bejelentkezes");
      return; // Megállítjuk a hook további futását
    }

    // Aszinkron függvény a kedvenc parfümök részletes adatainak lekérésére
    const fetchFavoriteDetails = async () => {
      setLoading(true); // Töltési állapot bekapcsolása
      setError(null); // Korábbi hibaüzenetek törlése
      try {
        // Service függvény hívása a kedvencek adatainak lekéréséhez
        const perfumesData = await getMyFavoritePerfumesDetails();
        // Állapot frissítése a kapott adatokkal
        setFavoritePerfumes(perfumesData);
      } catch (err) {
        // Hiba kezelése: hiba logolása és hibaüzenet beállítása
        console.error("Hiba a kedvenc parfümök adatainak lekérésekor:", err);
        setError(err.message || "Nem sikerült betölteni a kedvenceket.");
        setFavoritePerfumes([]); // Hiba esetén üres listát állítunk be
      } finally {
        // Töltési állapot kikapcsolása minden esetben (siker vagy hiba)
        setLoading(false);
      }
    };

    // Adatlekérő függvény meghívása
    fetchFavoriteDetails();
    // Függőségek: a hook újra lefut, ha a 'isLoggedIn' vagy 'navigate' megváltozik
  }, [isLoggedIn, navigate]);

  // Feltételes renderelés: Töltési állapot megjelenítése
  if (loading) {
    return (
      <div className="container text-center p-5">
        <div className="spinner-border text-primary" role="status">
          {/* Bootstrap spinner */}
          <span className="visually-hidden">Kedvencek betöltése...</span>
          {/* Akadálymentes szöveg */}
        </div>
      </div>
    );
  }

  // Feltételes renderelés: Hibaüzenet megjelenítése
  if (error) {
    return (
      <div className="container my-5">
        <div className="alert alert-danger text-center">{error}</div>
        {/* Bootstrap alert */}
      </div>
    );
  }

  // Fő JSX struktúra: Kedvencek oldal tartalma
  return (
    <div className="favorites-page container my-5">
      {/* Fő konténer margóval */}
      <h1 className="text-center mb-4 section-title">Kedvenc Parfümjeim</h1>
      {/* Oldal címe */}
      {/* Feltételes renderelés: Ha nincs kedvenc parfüm */}
      {favoritePerfumes.length === 0 ? (
        <div id="noResults" className="text-center card p-4">
          {/* Üzenet konténere */}
          <i className="fas fa-heart-broken fa-3x mb-3 text-secondary"></i>
          {/* Törött szív ikon */}
          <h4>Nincsenek kedvenceid</h4>
          <p className="text-muted">
            Jelöld meg a parfümöket egy szívvel, hogy ide kerüljenek!
          </p>
        </div>
      ) : (
        // Feltételes renderelés: Ha vannak kedvenc parfümök, megjelenítjük a listát
        // Bootstrap rács (row) használata a kártyák elrendezéséhez, 'g-3' a térköz
        <div className="row g-3" id="perfumeList2">
          {/* Konténer a parfüm kártyákhoz */}
          {/* Végigmegyünk a 'favoritePerfumes' tömbön és minden elemhez renderelünk egy PerfumeCard-ot */}
          {favoritePerfumes.map((perfume) => (
            // Bootstrap oszlopok a reszponzív elrendezéshez és flexbox az igazításhoz
            <div
              key={perfume.id} // Egyedi kulcs a listaelemhez
              className="col-lg-3 col-md-4 col-sm-6 col-12 d-flex align-items-stretch" // Oszlopméretek és igazítás
            >
              {/* PerfumeCard komponens meghívása az aktuális parfüm adataival */}
              <PerfumeCard perfume={perfume} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
