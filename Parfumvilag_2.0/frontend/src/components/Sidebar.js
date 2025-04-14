// src/components/Sidebar.js
import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom"; // Csak useSearchParams kell
import { getPriceRange } from "../services/perfumeService"; // Szükséges a getPriceRange

const Sidebar = () => {
  // Hookok
  const [searchParams, setSearchParams] = useSearchParams();
  // const navigate = useNavigate(); // Valószínűleg nem kell

  // State inicializálása - Stringekkel a konzisztencia érdekében
  const [brandFilter, setBrandFilter] = useState(
    searchParams.get("brand") || ""
  );
  const [scentFilter, setScentFilter] = useState(
    searchParams.get("note") || ""
  );
  const [genderFilter, setGenderFilter] = useState(
    searchParams.get("gender") || ""
  );
  const [sortOption, setSortOption] = useState(
    searchParams.get("sort") || "name-asc"
  );
  const [minPriceFilter, setMinPriceFilter] = useState(
    searchParams.get("min_price") || ""
  );
  const [maxPriceFilter, setMaxPriceFilter] = useState(
    searchParams.get("max_price") || ""
  );

  // Adatok és állapotok
  const [brands, setBrands] = useState([]);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [actualMin, setActualMin] = useState(0);
  const [actualMax, setActualMax] = useState(100000);

  // UI állapotok
  const [isOpen, setIsOpen] = useState(window.innerWidth > 991); // Desktopon nyitva kezdjen
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [brandSearchTerm, setBrandSearchTerm] = useState("");
  const [noteSearchTerm, setNoteSearchTerm] = useState("");

  // Fetch data effect (brands, notes, price range)
  useEffect(() => {
    setError(null);
    let isMounted = true;

    // Fetch Brands
    fetch("http://localhost:5000/api/brands")
      .then((res) =>
        res.ok ? res.json() : Promise.reject("Brands fetch failed")
      )
      .then((data) => isMounted && setBrands(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Hiba a márkák betöltésekor:", err);
        if (isMounted)
          setError(
            (prev) => (prev ? prev + "\n" : "") + "Márkák betöltése sikertelen."
          );
      });

    // Fetch Notes
    fetch("http://localhost:5000/api/notes")
      .then((res) =>
        res.ok ? res.json() : Promise.reject("Notes fetch failed")
      )
      .then((data) => isMounted && setNotes(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Hiba az illatjegyek betöltésekor:", err);
        if (isMounted)
          setError(
            (prev) =>
              (prev ? prev + "\n" : "") + "Illatjegyek betöltése sikertelen."
          );
      });

    // Fetch Price Range
    getPriceRange()
      .then((rangeData) => {
        if (isMounted) {
          const min = rangeData.minPrice || 0;
          const max = rangeData.maxPrice || 100000;
          setPriceRange({ min, max });
          setActualMin(min);
          setActualMax(max);
          // Kezdőértékek beállítása a betöltött range és URL alapján
          const urlMin = searchParams.get("min_price");
          const urlMax = searchParams.get("max_price");
          // Fontos: Stringként állítjuk be, mert az input value stringet vár
          setMinPriceFilter(urlMin !== null ? urlMin : String(min));
          setMaxPriceFilter(urlMax !== null ? urlMax : String(max));
        }
      })
      .catch((err) => {
        console.error("Failed to load price range, using defaults.", err);
        if (isMounted) {
          setError(
            (prev) =>
              (prev ? prev + "\n" : "") + "Árintervallum betöltése sikertelen."
          );
          // Hiba esetén is próbáljuk beállítani a filtereket (URL vagy default)
          const urlMin = searchParams.get("min_price");
          const urlMax = searchParams.get("max_price");
          setMinPriceFilter(urlMin !== null ? urlMin : String(priceRange.min)); // priceRange defaultot használunk
          setMaxPriceFilter(urlMax !== null ? urlMax : String(priceRange.max));
        }
      });

    return () => {
      isMounted = false;
    };
  }, []); // Csak mountkor fusson

  // Handle window resize effect
  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWindowWidth(currentWidth);
      // Sidebar automatikus nyitása/zárása átméretezéskor
      if (currentWidth > 991) {
        setIsOpen(true); // Desktop nézetben legyen nyitva
      } else {
        // Mobilon hagyjuk az aktuális állapotot, hacsak nem volt épp nyitva és átméreteztük desktopra
        // Ezt a részt finomítani lehetne, de a toggle gomb a fő vezérlő mobilon
      }
    };
    window.addEventListener("resize", handleResize);
    // Kezdő állapot beállítása
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Memoized filtered lists for dropdowns
  const filteredBrands = useMemo(() => {
    if (!brandSearchTerm) return brands;
    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase())
    );
  }, [brands, brandSearchTerm]);

  const filteredNotes = useMemo(() => {
    if (!noteSearchTerm) return notes;
    return notes.filter((note) =>
      note.name.toLowerCase().includes(noteSearchTerm.toLowerCase())
    );
  }, [notes, noteSearchTerm]);

  // Update URL search params on filter/sort change
  const applyFilters = () => {
    const queryParams = new URLSearchParams(); // Mindig újraépítjük

    // Rendezés (csak ha nem az alapértelmezett)
    if (sortOption && sortOption !== "name-asc") {
      queryParams.set("sort", sortOption);
    }

    // Oldalszám mindig 1 új szűrésnél/rendezésnél
    queryParams.set("page", "1");

    // Aktív szűrők hozzáadása
    if (brandFilter) queryParams.set("brand", brandFilter);
    if (scentFilter) queryParams.set("note", scentFilter);
    if (genderFilter) queryParams.set("gender", genderFilter);

    // Árszűrők hozzáadása, ha érvényesek és *különböznek* az aktuális min/max-tól
    // Ez megakadályozza a felesleges paramétereket, ha a csúszka a végállásban van
    const minVal = parseFloat(minPriceFilter);
    const maxVal = parseFloat(maxPriceFilter);
    if (!isNaN(minVal) && minVal > actualMin) {
      queryParams.set("min_price", String(minVal));
    }
    if (!isNaN(maxVal) && maxVal < actualMax) {
      queryParams.set("max_price", String(maxVal));
    }

    console.log("Setting search params:", queryParams.toString());
    setSearchParams(queryParams); // URL frissítése

    // Sidebar bezárása mobilon
    if (windowWidth <= 991) setIsOpen(false);
  };

  // Clear all filters and reset URL
  const clearFilters = () => {
    // Reset state
    setBrandFilter("");
    setScentFilter("");
    setGenderFilter("");
    setSortOption("name-asc");
    setMinPriceFilter(String(actualMin)); // Vissza a betöltött min-re
    setMaxPriceFilter(String(actualMax)); // Vissza a betöltött max-ra
    setBrandSearchTerm("");
    setNoteSearchTerm("");

    // Reset URL (csak page=1)
    const queryParams = new URLSearchParams({ page: "1" });

    console.log(
      "Clearing filters, setting search params:",
      queryParams.toString()
    );
    setSearchParams(queryParams);

    if (windowWidth <= 991) setIsOpen(false);
  };

  // Toggle sidebar visibility on mobile
  const toggleSidebar = () => setIsOpen(!isOpen);

  // Dynamic sidebar class
  const sidebarClass = `sidebar d-flex flex-column ${
    windowWidth <= 991 && !isOpen ? "hidden" : ""
  }`;

  // Slider input handlers to ensure min <= max
  const handleMinPriceChange = (e) => {
    const newVal = parseInt(e.target.value, 10);
    const currentMax = parseInt(maxPriceFilter || actualMax, 10);
    // Set min to the new value, but not higher than current max
    setMinPriceFilter(String(Math.min(newVal, currentMax)));
  };

  const handleMaxPriceChange = (e) => {
    const newVal = parseInt(e.target.value, 10);
    const currentMin = parseInt(minPriceFilter || actualMin, 10);
    // Set max to the new value, but not lower than current min
    setMaxPriceFilter(String(Math.max(newVal, currentMin)));
  };

  return (
    <>
      {/* Toggle Button (Mobile) */}
      {windowWidth <= 991 && (
        <button
          className="filter-toggle btn btn-sm btn-primary shadow-sm"
          onClick={toggleSidebar}
        >
          <i className={`fas ${isOpen ? "fa-times" : "fa-filter"} me-1`}></i>
          {isOpen ? "Bezárás" : "Szűrők"}
        </button>
      )}

      {/* Sidebar Content */}
      <div className={sidebarClass}>
        <h5 className="mb-3 border-bottom pb-2">Szűrők és Rendezés</h5>
        {error && <div className="alert alert-warning small p-2">{error}</div>}

        {/* Sort */}
        <div className="mb-3">
          <label htmlFor="sort" className="form-label form-label-sm">
            Rendezés
          </label>
          <select
            id="sort"
            className="form-select form-select-sm"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="name-asc">Név (A-Z)</option>
            <option value="name-desc">Név (Z-A)</option>
            <option value="price-asc">Ár (növekvő)</option>
            <option value="price-desc">Ár (csökkenő)</option>
          </select>
        </div>

        {/* Price Range Sliders */}
        <div className="mb-3">
          <label
            htmlFor="minPrice"
            className="form-label form-label-sm d-block"
          >
            {" "}
            {/* d-block a jobb törésért */}
            Min Ár:{" "}
            <span className="fw-bold">
              {Number(minPriceFilter || actualMin).toLocaleString("hu-HU")} Ft
            </span>
          </label>
          <input
            type="range"
            className="form-range"
            id="minPrice"
            min={actualMin}
            max={actualMax}
            step="1000" // Lehet dinamikusabb lépésköz is
            value={minPriceFilter || actualMin}
            onChange={handleMinPriceChange}
          />
        </div>
        <div className="mb-4">
          {" "}
          {/* Nagyobb térköz az ár után */}
          <label
            htmlFor="maxPrice"
            className="form-label form-label-sm d-block"
          >
            Max Ár:{" "}
            <span className="fw-bold">
              {Number(maxPriceFilter || actualMax).toLocaleString("hu-HU")} Ft
            </span>
          </label>
          <input
            type="range"
            className="form-range"
            id="maxPrice"
            min={actualMin}
            max={actualMax}
            step="1000"
            value={maxPriceFilter || actualMax}
            onChange={handleMaxPriceChange}
          />
        </div>

        {/* Brand Filter */}
        <div className="mb-3 filter-dropdown">
          <label htmlFor="brand" className="form-label form-label-sm">
            Márka
          </label>
          <input
            type="text"
            className="form-control form-control-sm mb-1"
            placeholder="Márka keresése..."
            value={brandSearchTerm}
            onChange={(e) => setBrandSearchTerm(e.target.value)}
          />
          <select
            id="brand"
            className="form-select form-select-sm"
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
          >
            <option value="">Összes márka</option>
            {filteredBrands.map((brand) => (
              <option key={brand.id} value={brand.name}>
                {brand.name}
              </option>
            ))}
            {brands.length > 0 &&
              filteredBrands.length === 0 &&
              brandSearchTerm && (
                <option value="" disabled>
                  Nincs találat
                </option>
              )}
          </select>
        </div>

        {/* Scent (Note) Filter */}
        <div className="mb-3 filter-dropdown">
          <label htmlFor="scent" className="form-label form-label-sm">
            Illatjegy
          </label>
          <input
            type="text"
            className="form-control form-control-sm mb-1"
            placeholder="Illatjegy keresése..."
            value={noteSearchTerm}
            onChange={(e) => setNoteSearchTerm(e.target.value)}
          />
          <select
            id="scent"
            className="form-select form-select-sm"
            value={scentFilter}
            onChange={(e) => setScentFilter(e.target.value)}
          >
            <option value="">Összes illatjegy</option>
            {filteredNotes.map((note) => (
              <option key={note.id} value={note.name}>
                {note.name}
              </option>
            ))}
            {notes.length > 0 &&
              filteredNotes.length === 0 &&
              noteSearchTerm && (
                <option value="" disabled>
                  Nincs találat
                </option>
              )}
          </select>
        </div>

        {/* Gender Filter */}
        <div className="mb-3">
          <label htmlFor="gender" className="form-label form-label-sm">
            Nem
          </label>
          <select
            id="gender"
            className="form-select form-select-sm"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="">Összes</option>
            <option value="male">Férfi</option>
            <option value="female">Női</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-3 border-top">
          {" "}
          {/* Alulra igazítás és elválasztó */}
          <button
            className="btn btn-primary btn-sm w-100 mb-2"
            onClick={applyFilters}
          >
            Szűrés és Rendezés
          </button>
          <button
            className="btn btn-outline-secondary btn-sm w-100"
            onClick={clearFilters}
          >
            Szűrők törlése
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
