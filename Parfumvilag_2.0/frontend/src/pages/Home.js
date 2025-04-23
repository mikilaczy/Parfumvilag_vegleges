import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PerfumeCard from "../components/PerfumeCard";
import { getRandomPerfumes } from "../services/perfumeService";
import "../style.css";

// A főoldalt (Home) megjelenítő komponens
const Home = () => {
  // Állapotok inicializálása
  const [randomPerfumes, setRandomPerfumes] = useState([]); // Véletlenszerűen kiválasztott parfümök tárolására
  const [error, setError] = useState(null); // Hibaüzenetek tárolására
  const [loading, setLoading] = useState(true); // Töltési állapot jelzésére (kezdetben true)

  // useEffect hook: A komponens beillesztésekor (mount) lefutó hatás
  useEffect(() => {
    // Aszinkron függvény a véletlenszerű parfümök lekéréséhez
    const fetchRandomPerfumes = async () => {
      setLoading(true); // Töltési állapot bekapcsolása
      setError(null); // Korábbi hibaüzenetek törlése
      try {
        // Service függvény hívása 4 véletlenszerű parfüm lekéréséhez
        const perfumesData = await getRandomPerfumes(4);
        // Állapot frissítése a kapott parfüm adatokkal
        setRandomPerfumes(perfumesData);
      } catch (err) {
        // Hiba kezelése: hiba logolása és hibaüzenet beállítása
        console.error("Error fetching random perfumes:", err);
        setError(
          err.message || "Nem sikerült betölteni az ajánlott parfümöket."
        );
        setRandomPerfumes([]); // Hiba esetén üres listát állítunk be
      } finally {
        // Töltési állapot kikapcsolása minden esetben (siker vagy hiba)
        setLoading(false);
      }
    };
    // Adatlekérő függvény meghívása
    fetchRandomPerfumes();
    // Az üres függőségi tömb ([]) biztosítja, hogy az effect csak egyszer fusson le, a komponens beillesztésekor
  }, []);

  // Komponens JSX struktúrája
  return (
    <div className="home-wrapper">
      {/* Fő burkoló elem az oldalhoz */}
      {/* Hero (Fő) Szekció */}
      <section className="hero-section">
        {/* A fő vizuális/bevezető szekció */}
        <div className="hero-content container">
          {/* Tartalom konténere Bootstrap segítségével */}
          <h1 className="display-4 fw-bold">Üdvözöljük a Parfümvilágban</h1>
          {/* Főcím */}
          <p className="lead col-lg-8 mx-auto">
            {/* Bevezető szöveg, középre igazítva nagyobb képernyőn */}
            Találd meg álmaid parfümjét ajánlásainkkal és
            árösszehasonlításainkkal – egyszerűen, gyorsan, stílusosan!
          </p>
          <div className="hero-actions d-grid gap-2 d-sm-flex justify-content-sm-center">
            {/* Gombok konténere, reszponzív elrendezéssel */}
            <Link to="/kereses" className="btn btn-primary btn-lg px-4 gap-3">
              {/* Link a keresés oldalra */}
              Keresés indítása
            </Link>
            <Link
              to="/katalogus" // Link a hírek (katalógus) oldalra
              className="btn btn-outline-secondary btn-lg px-4"
            >
              Hírek felfedezése
            </Link>
          </div>
        </div>
      </section>
      {/* Ajánlott Parfümök Szekció */}
      <section className="featured-section container my-5">
        {" "}
        {/* Kiemelt ajánlatok szekció konténere */}
        <h2 className="section-title text-center mb-4">
          Kiemelt Ajánlataink
        </h2>{" "}
        {/* Szekció címe */}
        {/* Töltési állapot megjelenítése */}
        {loading && (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              {/* Bootstrap spinner */}
              <span className="visually-hidden">Betöltés...</span>
              {/* Akadálymentes szöveg */}
            </div>
          </div>
        )}
        {/* Hibaüzenet megjelenítése */}
        {error && <div className="alert alert-danger text-center">{error}</div>}
        {/* Parfümök listájának megjelenítése, ha nem tölt és nincs hiba */}
        {!loading && !error && (
          // Bootstrap rács (row) a kártyák elrendezéséhez, 'g-3' a térköz
          <div className="row g-3" id="perfumeList2">
            {/* Konténer a parfüm kártyákhoz */}
            {/* Feltételes renderelés: Ha vannak ajánlott parfümök */}
            {randomPerfumes.length > 0 ? (
              // Végigmegyünk a 'randomPerfumes' tömbön és minden elemhez renderelünk egy PerfumeCard-ot
              randomPerfumes.map((perfume) => (
                // Bootstrap oszlopok a reszponzív elrendezéshez és flexbox az igazításhoz
                <div
                  key={perfume.id} // Egyedi kulcs a listaelemhez
                  className="col-lg-3 col-md-4 col-sm-6 col-12 d-flex align-items-stretch" // Oszlopméretek és igazítás
                >
                  {/* PerfumeCard komponens meghívása az aktuális parfüm adataival */}
                  <PerfumeCard perfume={perfume} />
                </div>
              ))
            ) : (
              // Feltételes renderelés: Ha nincsenek ajánlott parfümök
              <div className="col-12 text-center">
                <div id="noResults" className="card p-4">
                  {/* Üzenet konténere */}
                  <i className="fas fa-box-open fa-3x mb-3 text-secondary"></i>
                  {/* Nyitott doboz ikon */}
                  <h4>Nincs ajánlott parfüm</h4>
                  <p className="text-muted">
                    Jelenleg nem tudunk parfümöt ajánlani.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
