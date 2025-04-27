import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllPerfumes } from "../services/perfumeService";
import Sidebar from "../components/Sidebar";
import PerfumeCard from "../components/PerfumeCard";
import "../style.css";

// Lapozó gomb segédkomponens
const PageButton = ({
  page,
  currentPage,
  onClick,
  isDisabled = false,
  children,
}) => (
  <li
    className={`page-item ${currentPage === page ? "active" : ""} ${
      // Aktív vagy letiltott állapot osztályai
      isDisabled ? "disabled" : ""
    }`}
  >
    <button
      className="page-link"
      onClick={() => !isDisabled && onClick(page)} // Kattintás eseménykezelő (csak ha nincs letiltva)
      disabled={isDisabled} // Gomb letiltása
    >
      {children || page} {/* Gomb tartalma: ikon vagy oldalszám */}
    </button>
  </li>
);

// Keresési oldalt megjelenítő komponens
const Search = () => {
  // Hook-ok inicializálása
  const [searchParams, setSearchParams] = useSearchParams(); // URL paraméterek olvasása és írása
  // Állapotok
  const [perfumes, setPerfumes] = useState([]); // Talált parfümök listája
  const [loading, setLoading] = useState(true); // Töltési állapot jelzése
  const [error, setError] = useState(""); // Hibaüzenetek tárolása
  const [totalPages, setTotalPages] = useState(1); // Összes oldalszám a lapozáshoz
  // Jelenlegi oldal kinyerése az URL-ből (alapértelmezett: 1)
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  // Keresőkifejezés állapotának kezelése, szinkronban az URL-lel
  const [searchTerm, setSearchTerm] = useState(searchParams.get("query") || "");
  // Ablak szélességének figyelése a reszponzív lapozóhoz
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Effect az ablak átméretezésének figyelésére
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    // Tisztítás: eseményfigyelő eltávolítása
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Effect a parfümök lekérésére, amikor az URL paraméterek (searchParams) változnak
  useEffect(() => {
    const fetchPerfumes = async () => {
      setLoading(true); // Töltés indítása
      setError(""); // Hiba törlése
      try {
        // Paraméter objektum összeállítása az aktuális URL paraméterekből
        const params = {
          query: searchParams.get("query") || "",
          brand: searchParams.get("brand") || "",
          note: searchParams.get("note") || "",
          gender: searchParams.get("gender") || "",
          sort: searchParams.get("sort") || "name-asc",
          min_price: searchParams.get("min_price"),
          max_price: searchParams.get("max_price"),
          page: searchParams.get("page") || "1",
          per_page: 24, // Oldalanként megjelenített parfümök száma
        };
        console.log("Search.js: Fetching perfumes with params:", params); // Logolás fejlesztéshez
        // API hívás a parfümök lekérésére a paraméterekkel
        const response = await getAllPerfumes(params);
        // Állapotok frissítése a kapott válasszal
        setPerfumes(response.perfumes || []);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        console.error("Search.js: Error fetching perfumes:", err); // Hiba logolása
        setError(err.message || "Hiba a parfümök betöltésekor."); // Hiba állapot beállítása
        setPerfumes([]); // Lista kiürítése hiba esetén
        setTotalPages(1); // Oldalszám visszaállítása
      } finally {
        setLoading(false); // Töltés befejezése
      }
    };
    fetchPerfumes(); // Lekérdező függvény meghívása
  }, [searchParams]); // Függőség: Csak akkor fut újra, ha a searchParams megváltozik

  // Keresőkifejezés input mező változását kezelő függvény
  const handleSearchTermChange = (e) => setSearchTerm(e.target.value);

  // Keresés gombra vagy Enter leütésre lefutó függvény
  const handleSearchSubmit = () => {
    const newParams = new URLSearchParams(searchParams); // Új paraméter objektum létrehozása
    if (searchTerm.trim()) {
      // Ha van keresőkifejezés (spéciusokat levágva)
      newParams.set("query", searchTerm.trim()); // Beállítja a 'query' paramétert
    } else {
      newParams.delete("query"); // Ha üres, törli a 'query' paramétert
    }
    newParams.set("page", "1"); // Kereséskor mindig az első oldalra ugrik
    setSearchParams(newParams); // Frissíti az URL paramétereket (ez triggereli az useEffect-et)
  };

  // Lapozást kezelő függvény
  const handlePageChange = (page) => {
    // Biztosítja, hogy az új oldalszám érvényes tartományban legyen
    const newPage = Math.max(1, Math.min(page, totalPages));
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(newPage)); // Beállítja az új 'page' paramétert
    setSearchParams(newParams); // Frissíti az URL-t
    window.scrollTo({ top: 0, behavior: "smooth" }); // Oldal tetejére görgetés
  };

  // Dinamikusan generálja a megjelenítendő oldalszámokat a lapozóhoz
  const getPageNumbers = () => {
    const pages = [];
    // Megjelenítendő gombok száma ablakmérettől függően
    const maxPagesToShow = windowWidth < 576 ? 3 : 5;
    const halfPages = Math.floor(maxPagesToShow / 2);
    let startPage, endPage;

    // Logika a kezdő és végoldal meghatározására (középre igazított lapozó)
    if (totalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = totalPages;
    } else if (currentPage <= halfPages + 1) {
      startPage = 1;
      endPage = maxPagesToShow;
    } else if (currentPage + halfPages >= totalPages) {
      startPage = totalPages - maxPagesToShow + 1;
      endPage = totalPages;
    } else {
      startPage = currentPage - halfPages;
      endPage = currentPage + halfPages;
    }
    // Oldalszámok tömb feltöltése
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    // Visszaadja az oldalszámokat és hogy kell-e ellipsis (...) a szélekre
    return {
      pages,
      showStartEllipsis: startPage > 1,
      showEndEllipsis: endPage < totalPages,
    };
  };

  // Oldalszámok és ellipsis állapotok kinyerése
  const {
    pages: pageNumbers,
    showStartEllipsis,
    showEndEllipsis,
  } = getPageNumbers();
  // Dinamikus bal oldali padding a fő tartalomhoz (sidebar miatt)
  const mainContentPaddingLeft = windowWidth > 991 ? "250px" : "0";

  // Komponens JSX struktúrája
  return (
    <div className="d-lg-flex">
      {" "}
      {/* Flexbox konténer nagy képernyőn (Sidebar + Fő tartalom) */}
      <Sidebar /> {/* Oldalsáv komponens */}
      {/* Fő tartalmi terület */}
      <div
        className="flex-grow-1 main-content-area"
        style={{
          paddingLeft: mainContentPaddingLeft, // Dinamikus padding
          transition: "padding-left 0.3s ease-in-out", // Animáció a padding változásához
          minHeight: "calc(100vh - 70px)", // Minimális magasság (teljes képernyő - navbar magassága)
        }}
      >
        <div className="container-fluid py-4 px-lg-4 px-md-3 px-sm-2 px-1">
          {/* Fluid konténer padding-ekkel */}
          {/* Kereső input mező sor */}
          <div className="row justify-content-center mb-4 mb-lg-5">
            <div className="col-md-10 col-lg-8 col-xl-6">
              <div className="input-group shadow-sm">
                {/* Input group Bootstrap */}
                <input
                  type="text"
                  className="form-control form-control-lg" // Nagyobb input mező
                  placeholder="Keresés parfümre..."
                  value={searchTerm}
                  onChange={handleSearchTermChange} // Keresőkifejezés változásának kezelése
                  onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()} // Enter leütésére keresés indítása
                  aria-label="Parfüm keresése"
                />
                <button
                  className="btn btn-primary px-3" // Keresés gomb
                  onClick={handleSearchSubmit}
                  aria-label="Keresés"
                >
                  <i className="fas fa-search"></i> {/* Keresés ikon */}
                </button>
              </div>
            </div>
          </div>
          {/* Töltésjelző */}
          {loading && (
            <div className="text-center py-5 my-5">
              <div
                className="spinner-border text-primary" // Bootstrap spinner
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Parfümök betöltése...</span>
              </div>
            </div>
          )}
          {/* Hibaüzenet */}
          {error && !loading && (
            <div className="alert alert-danger text-center col-md-8 mx-auto">
              {error}
            </div>
          )}
          {/* Parfümök listája (ha nem tölt és nincs hiba) */}
          {!loading && !error && (
            // Konténer a parfüm kártyáknak. A #perfumeList ID-t célozza a CSS a grid/flexbox elrendezéshez.
            <div id="perfumeList" className="perfume-list-container-search">
              {/* Nincs találat üzenet */}
              {perfumes.length === 0 ? (
                <div
                  id="noResults"
                  className="text-center card border-0 shadow-sm p-4 p-md-5 my-4 mx-auto"
                  style={{ maxWidth: "500px" }}
                >
                  <i className="fas fa-box-open fa-3x mb-3 text-secondary opacity-50"></i>
                  <h4 className="text-muted">Nincs Találat</h4>
                  <p className="mb-0 text-muted">
                    A megadott feltételekkel nem található parfüm. Próbálj más
                    szűrőket!
                  </p>
                </div>
              ) : (
                // Parfüm kártyák megjelenítése
                perfumes.map((p) => <PerfumeCard key={p.id} perfume={p} />)
              )}
            </div>
          )}
          {/* Lapozó (csak akkor jelenik meg, ha nem tölt, nincs hiba, és több mint 1 oldal van) */}
          {!loading && !error && totalPages > 1 && (
            <nav
              className="mt-5 d-flex justify-content-center"
              aria-label="Perfume pagination"
            >
              <ul className="pagination pagination-sm shadow-sm">
                {/* Kisebb méretű lapozó */}
                {/* Előző oldal gomb */}
                <PageButton
                  page={currentPage - 1}
                  currentPage={currentPage}
                  onClick={handlePageChange}
                  isDisabled={currentPage === 1} // Letiltva az első oldalon
                >
                  « {/* Előző ikon */}
                </PageButton>
                {/* Ellipsis és első oldal gomb (ha szükséges) */}
                {showStartEllipsis && (
                  <>
                    <PageButton
                      page={1}
                      currentPage={currentPage}
                      onClick={handlePageChange}
                    />
                    <li className="page-item disabled">
                      <span className="page-link px-2">...</span>
                    </li>
                  </>
                )}
                {/* Oldalszám gombok */}
                {pageNumbers.map((page) => (
                  <PageButton
                    key={page}
                    page={page}
                    currentPage={currentPage}
                    onClick={handlePageChange}
                  />
                ))}
                {/* Ellipsis és utolsó oldal gomb (ha szükséges) */}
                {showEndEllipsis && (
                  <>
                    <li className="page-item disabled">
                      <span className="page-link px-2">...</span>
                    </li>
                    <PageButton
                      page={totalPages}
                      currentPage={currentPage}
                      onClick={handlePageChange}
                    />
                  </>
                )}
                {/* Következő oldal gomb */}
                <PageButton
                  page={currentPage + 1}
                  currentPage={currentPage}
                  onClick={handlePageChange}
                  isDisabled={currentPage === totalPages} // Letiltva az utolsó oldalon
                >
                  » {/* Következő ikon */}
                </PageButton>
              </ul>
            </nav>
          )}
          {/* Opcionális: Lapozó információs szöveg */}
          {!loading && !error && totalPages > 0 && perfumes.length > 0 && (
            <div className="text-center text-muted small mt-2 mb-4">
              {currentPage}. oldal / {totalPages}
            </div>
          )}
        </div>
        {/* Container-fluid vége */}
      </div>
      {/* Fő tartalmi terület vége */}
    </div> // d-lg-flex vége
  );
};

export default Search;
