import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllPerfumes } from "../services/perfumeService";
import Sidebar from "../components/Sidebar";
import PerfumeCard from "../components/PerfumeCard";
import "../style.css"; // Ensure styles are imported

// Helper for Pagination Buttons
const PageButton = ({
  page,
  currentPage,
  onClick,
  isDisabled = false,
  children,
}) => (
  <li
    className={`page-item ${currentPage === page ? "active" : ""} ${
      isDisabled ? "disabled" : ""
    }`}
  >
    <button
      className="page-link"
      onClick={() => !isDisabled && onClick(page)}
      disabled={isDisabled}
    >
      {children || page}
    </button>
  </li>
);

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [perfumes, setPerfumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("query") || "");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchPerfumes = async () => {
      setLoading(true);
      setError("");
      try {
        const params = {
          query: searchParams.get("query") || "",
          brand: searchParams.get("brand") || "",
          note: searchParams.get("note") || "",
          gender: searchParams.get("gender") || "",
          sort: searchParams.get("sort") || "name-asc",
          min_price: searchParams.get("min_price"),
          max_price: searchParams.get("max_price"),
          page: searchParams.get("page") || "1",
          per_page: 24,
        };
        console.log("Search.js: Fetching perfumes with params:", params);
        const response = await getAllPerfumes(params);
        setPerfumes(response.perfumes || []);
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        console.error("Search.js: Error fetching perfumes:", err);
        setError(err.message || "Hiba a parfümök betöltésekor.");
        setPerfumes([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchPerfumes();
  }, [searchParams]); // Most már csak a searchParams-tól függ

  const handleSearchTermChange = (e) => setSearchTerm(e.target.value);

  const handleSearchSubmit = () => {
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newParams.set("query", searchTerm.trim());
    } else {
      newParams.delete("query");
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", String(newPage));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = windowWidth < 576 ? 3 : 5;
    const halfPages = Math.floor(maxPagesToShow / 2);
    let startPage, endPage;
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
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return {
      pages,
      showStartEllipsis: startPage > 1,
      showEndEllipsis: endPage < totalPages,
    };
  };

  const {
    pages: pageNumbers,
    showStartEllipsis,
    showEndEllipsis,
  } = getPageNumbers();
  const mainContentPaddingLeft = windowWidth > 991 ? "250px" : "0";

  return (
    <div className="d-lg-flex">
      <Sidebar />
      <div
        className="flex-grow-1 main-content-area"
        style={{
          paddingLeft: mainContentPaddingLeft,
          transition: "padding-left 0.3s ease-in-out",
          minHeight: "calc(100vh - 70px)",
        }}
      >
        <div className="container-fluid py-4 px-lg-4 px-md-3 px-sm-2 px-1">
          {/* Search Input Row */}
          <div className="row justify-content-center mb-4 mb-lg-5">
            <div className="col-md-10 col-lg-8 col-xl-6">
              <div className="input-group shadow-sm">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Keresés parfümre..."
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                  onKeyPress={(e) => e.key === "Enter" && handleSearchSubmit()}
                  aria-label="Parfüm keresése"
                />
                <button
                  className="btn btn-primary px-3"
                  onClick={handleSearchSubmit}
                  aria-label="Keresés"
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="text-center py-5 my-5">
              <div
                className="spinner-border text-primary"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Parfümök betöltése...</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div className="alert alert-danger text-center col-md-8 mx-auto">
              {error}
            </div>
          )}

          {/* --- VISSZAÁLLÍTOTT Perfume List --- */}
          {/* Itt most a div#perfumeList tartalmazza közvetlenül a kártyákat */}
          {/* A layoutért (grid, flexbox) a te style.css-ed felelős, ami az #perfumeList ID-t célozza */}
          {!loading && !error && (
            <div id="perfumeList" className="perfume-list-container-search">
              {" "}
              {/* Add extra class if needed */}
              {perfumes.length === 0 ? (
                // No results message - lehet, hogy ezt is az #perfumeList-en belül kell megjeleníteni a CSS miatt
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
                // Display Perfume Cards - Direct children
                perfumes.map((p) => <PerfumeCard key={p.id} perfume={p} />)
              )}
            </div>
          )}
          {/* --- VISSZAÁLLÍTOTT LISTA VÉGE --- */}

          {/* Pagination - Only render if not loading, no error, and more than one page */}
          {!loading && !error && totalPages > 1 && (
            <nav
              className="mt-5 d-flex justify-content-center"
              aria-label="Perfume pagination"
            >
              <ul className="pagination pagination-sm shadow-sm">
                {/* Previous Button */}
                <PageButton
                  page={currentPage - 1}
                  currentPage={currentPage}
                  onClick={handlePageChange}
                  isDisabled={currentPage === 1}
                >
                  «
                </PageButton>

                {/* First Page & Ellipsis */}
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

                {/* Page Numbers */}
                {pageNumbers.map((page) => (
                  <PageButton
                    key={page}
                    page={page}
                    currentPage={currentPage}
                    onClick={handlePageChange}
                  />
                ))}

                {/* End Ellipsis & Last Page */}
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

                {/* Next Button */}
                <PageButton
                  page={currentPage + 1}
                  currentPage={currentPage}
                  onClick={handlePageChange}
                  isDisabled={currentPage === totalPages}
                >
                  »
                </PageButton>
              </ul>
            </nav>
          )}

          {/* Optional: Pagination Info Text */}
          {!loading && !error && totalPages > 0 && perfumes.length > 0 && (
            <div className="text-center text-muted small mt-2 mb-4">
              {currentPage}. oldal / {totalPages}
            </div>
          )}
        </div>{" "}
        {/* End Container-fluid */}
      </div>{" "}
      {/* End Main Content Area */}
    </div> // End d-lg-flex
  );
};

export default Search;
