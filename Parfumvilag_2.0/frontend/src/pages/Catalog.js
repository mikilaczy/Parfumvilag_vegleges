import React, { useState, useEffect } from "react";
import axios from "axios";
import "../style.css";

// A hírek katalógusát megjelenítő komponens
const Catalog = () => {
  // Állapotok inicializálása
  const [news, setNews] = useState([]); // Hírek tárolására szolgáló tömb
  const [error, setError] = useState(null); // Hibaüzenetek tárolására

  // NewsAPI kulcs (érdemes lenne környezeti változóba tenni)
  const API_KEY = "001f49d7cbf241f1bfeed545c38a76c2";
  // NewsAPI URL összeállítása a kulccsal és szűrési feltételekkel
  // A `q` paraméter a keresőszó ("perfume").
  // A `NOT (...)` rész sok kulcsszót kizár a találatokból a relevánsabb eredmények érdekében.
  // `language=en` - Angol nyelvű hírek keresése.
  // `sortBy=relevancy` - Relevancia szerinti rendezés.
  const API_URL = `https://newsapi.org/v2/everything?q=perfume NOT (concert OR Genius OR novelist OR Trump OR Orders OR walmart OR habit OR Delicious OR PNOĒS OR Sophie OR Pizza OR Sci-Fi OR Logitech OR Watch OR Shoes OR Message OR Apothecary OR weekend OR Beauty OR Nightstand OR Reeves OR Shoe OR 韓国 OR Card OR Alba OR Apple OR Egyptian OR BWS OR Captain OR Recipe OR books OR Crossword OR rubbish OR Tea OR Candle OR Wine OR J-Pop OR robbers OR Newborn OR Bella OR Snacks OR Chronological OR Sexuality OR Stepsister OR Amazon OR Strange OR cheating)&language=en&sortBy=relevancy&apiKey=${API_KEY}`;

  // useEffect hook: A komponens beillesztésekor (mount) lefutó hatás
  useEffect(() => {
    // Aszinkron függvény a hírek lekéréséhez
    const fetchNews = async () => {
      try {
        // GET kérés küldése az API URL-re
        const response = await axios.get(API_URL);
        // Az API válaszából kinyerjük a cikkeket és csak az első 12-t tartjuk meg
        const articles = response.data.articles.slice(0, 12);
        // Frissítjük a 'news' állapotot a lekérdezett cikkekkel
        setNews(articles);
      } catch (err) {
        // Hiba esetén beállítjuk a hibaüzenetet és logoljuk a konzolra
        setError(
          "A hírek betöltése nem sikerült. Kérlek, próbáld újra később!"
        );
        console.error("Hiba a hírek lekérésekor:", err);
      }
    };
    // A hírek lekérését végző függvény meghívása
    fetchNews();
    // A dependency array ([API_URL]) biztosítja, hogy az effect csak akkor fusson le újra, ha az URL megváltozik (ebben az esetben csak egyszer, a mount-kor)
  }, [API_URL]);

  // Komponens JSX struktúrája
  return (
    <div className="container my-5">
      {/* Bootstrap konténer margóval */}
      <h1 className="text-center mb-5">Parfüm Hírek</h1> {/* Oldal címe */}
      {/* Hibaüzenet megjelenítése, ha van hiba */}
      {error && <div className="alert alert-danger">{error}</div>}
      {/* Hírek konténere, Bootstrap rács (row) használatával */}
      <div id="news-container" className="row g-4">
        {/* `g-4` a kártyák közötti térköz */}
        {/* Feltételes renderelés: Ha vannak hírek, megjelenítjük őket */}
        {news.length > 0 ? (
          // Végigmegyünk a 'news' tömbön és minden cikkhez létrehozunk egy kártyát
          news.map((article, index) => (
            // Bootstrap oszlopok a reszponzivitásért (különböző képernyőméreteken más oszlopszám)
            <div key={index} className="col-md-4 col-sm-6 col-12">
              {/* Újrahasznosított 'perfume-card' stílusosztály a konzisztens megjelenésért */}
              <div className="perfume-card">
                {/* Kép megjelenítése, placeholder képpel ha nincs elérhető */}
                <img
                  src={
                    article.urlToImage ||
                    "https://via.placeholder.com/220x220?text=Nincs+kép"
                  }
                  alt={article.title} // Kép alternatív szövege
                  className="card-img-top" // Bootstrap kép stílus
                  style={{ height: "220px", objectFit: "cover" }} // Inline stílus a magasság és képillesztés beállításához
                />
                {/* Kártya törzse */}
                <div
                  className="perfume-card-body"
                  style={{
                    minHeight: "180px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Flexbox a tartalom elosztásához */}
                  <div>
                    {/* Felső rész: cím és leírás */}
                    <h5
                      className="perfume-card-title"
                      style={{
                        fontSize: "1.6rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {/* Cím stílusai (túlcsordulás kezelése) */}
                      {article.title}
                    </h5>
                    <p
                      className="perfume-card-text"
                      style={{
                        fontSize: "0.95rem",
                        height: "60px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {/* Leírás stílusai (túlcsordulás kezelése) */}
                      {article.description || "Nincs elérhető leírás."}{" "}
                      {/* Leírás vagy alapértelmezett szöveg */}
                    </p>
                  </div>
                  {/* "Tovább olvasom" gomb, ami az eredeti cikkre mutat */}
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary"
                  >
                    Tovább olvasom
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          // Feltételes renderelés: Ha nincs hír (vagy hiba történt a betöltéskor és üres a lista)
          <div id="noResults" className="text-center">
            {" "}
            {/* Középre igazított tartalom */}
            <i className="fas fa-search fa-3x mb-3"></i> {/* Keresés ikon */}
            <h4>{error ? "Hiba történt" : "Nincs találat"}</h4>{" "}
            {/* Cím a helyzettől függően */}
            <p>
              {error || "Jelenleg nem állnak rendelkezésre releváns hírek."}
            </p>{" "}
            {/* Leírás a helyzettől függően */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
