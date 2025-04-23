import React, { useState, useEffect, useContext } from "react"; // React és hook-ok importálása
import { Link, NavLink, useNavigate } from "react-router-dom"; // Navigációhoz szükséges komponensek és hook
import { AuthContext } from "../App"; // Globális autentikációs kontextus importálása
import "../style.css"; // Stíluslap importálása

// A Navbar (navigációs sáv) komponens definíciója
const Navbar = () => {
  // Állapotok és függvények kinyerése a globális AuthContext-ből
  const { isLoggedIn, user, logout } = useContext(AuthContext);
  // Lokális állapot a mobil menü nyitottságának kezelésére
  const [isOpen, setIsOpen] = useState(false);
  // Lokális állapot az ablak szélességének tárolására (reszponzivitáshoz)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  // Navigációs hook programozott átirányításhoz
  const navigate = useNavigate();

  // Effect hook az ablak átméretezésének figyelésére
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth); // Frissíti az ablak szélességét
    window.addEventListener("resize", handleResize); // Eseményfigyelő hozzáadása
    // Tisztító függvény: eseményfigyelő eltávolítása a komponens eltávolításakor
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Üres függőségi tömb: csak a komponens beillesztésekor fut le

  // Kijelentkezést kezelő függvény
  const handleLogout = () => {
    // Megerősítő párbeszédablak
    if (window.confirm("Biztosan ki szeretne lépni?")) {
      logout(); // Kontextusban definiált kijelentkeztető függvény hívása
      navigate("/"); // Átirányítás a főoldalra
      setIsOpen(false); // Mobil menü bezárása, ha nyitva volt
    }
  };

  // Mobil menü nyitását/zárását váltó függvény
  const toggleMenu = () => setIsOpen(!isOpen);

  // Mobil menü bezárását végző függvény (linkekre kattintáskor hívódik meg)
  const closeMenu = () => {
    if (windowWidth <= 991) {
      // Csak akkor zár be, ha mobil nézetben van (991px töréspont)
      setIsOpen(false);
    }
  };

  // Profilkép URL meghatározása, alapértelmezett ikonnal ha nincs kép
  const profileImageUrl = user?.profile_picture_url; // Felhasználó profilkép URL-je (opcionális láncolással)
  const showProfileImage = isLoggedIn && profileImageUrl; // Igaz, ha be van jelentkezve ÉS van profilkép URL
  const showProfileIcon = isLoggedIn && !profileImageUrl; // Igaz, ha be van jelentkezve ÉS nincs profilkép URL

  return (
    <nav className="navbar navbar-dark">
      {/* Navigációs sáv fő eleme */}
      <div className="container">
        {/* Tartalom középre igazításához */}
        <div className="navbar-content">
          {/* Tartalom flexibilis elrendezéséhez */}
          {/* Hamburger menü gomb (csak mobil nézetben jelenik meg) */}
          {windowWidth <= 991 && (
            <button className="navbar-toggler" onClick={toggleMenu}>
              {/* Az ikon a menü nyitott/zárt állapota szerint változik */}
              <i className={`fas ${isOpen ? "fa-times" : "fa-bars"}`}></i>{" "}
            </button>
          )}
          {/* Márka/Logó link */}
          <Link className="navbar-brand" to="/" onClick={closeMenu}>
            Parfümvilág
          </Link>
          {/* Navigációs linkek (összecsukható rész) */}
          {/* A `nav-links` és `active` osztályok vezérlik a mobil menü megjelenését */}
          <div
            className={`nav-links ${
              windowWidth <= 991 ? (isOpen ? "active" : "") : "d-flex" // Mobil/desktop nézet közötti váltás
            }`}
            id="navbarNav" // Bootstrap JS-hez szükséges lehet (bár itt CSS-alapú a működés)
          >
            {/* Bal oldali navigációs linkek */}
            <ul className="navbar-nav navbar-left">
              <li className="nav-item">
                <NavLink // Aktív link kiemeléséhez NavLink használata
                  className={
                    ({ isActive }) => `nav-link ${isActive ? "active" : ""}` // Aktív állapot osztály hozzáadása
                  }
                  to="/katalogus" // Cél útvonal
                  onClick={closeMenu} // Menü bezárása mobil nézetben kattintáskor
                >
                  Hírek
                </NavLink>
              </li>
              {/* További bal oldali linkek hasonlóan */}
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  to="/kereses"
                  onClick={closeMenu}
                >
                  Keresés
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "active" : ""}`
                  }
                  to="/rolunk"
                  onClick={closeMenu}
                >
                  Rólunk
                </NavLink>
              </li>
              {/* Kedvencek link csak bejelentkezett felhasználóknak */}
              {isLoggedIn && (
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link ${isActive ? "active" : ""}`
                    }
                    to="/kedvencek"
                    onClick={closeMenu}
                  >
                    Kedvencek
                  </NavLink>
                </li>
              )}
            </ul>

            {/* Jobb oldali elemek (Bejelentkezés/Profil/Kijelentkezés) */}
            <ul className="navbar-nav navbar-right">
              {/* Feltételes megjelenítés: Bejelentkezett felhasználó */}
              {isLoggedIn && user ? ( // Ellenőrizzük, hogy a user objektum létezik-e
                <>
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link profile-link d-flex align-items-center ${
                          // Profil link stílusai
                          isActive ? "active" : ""
                        }`
                      }
                      to="/profil"
                      onClick={closeMenu}
                    >
                      {/* Feltételes megjelenítés: Profilkép vagy ikon */}
                      {showProfileImage ? (
                        <img
                          src={profileImageUrl}
                          alt="Profil"
                          className="navbar-profile-img me-2" // Kép stílusa
                          // Egyszerű hibakezelés: törött kép elrejtése
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <i className="fas fa-user-circle fa-lg me-2"></i> // Alapértelmezett ikon, ha nincs kép
                      )}
                      {user.name || "Profil"}{" "}
                      {/* Felhasználó neve vagy 'Profil' */}
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <button
                      className="btn btn-outline-light logout-btn" // Kijelentkezés gomb stílusa
                      onClick={handleLogout} // Kijelentkezés kezelő függvény hívása
                    >
                      Kilépés
                    </button>
                  </li>
                </>
              ) : (
                /* Feltételes megjelenítés: Kijelentkezett felhasználó */
                <>
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                      to="/bejelentkezes"
                      onClick={closeMenu}
                    >
                      Bejelentkezés
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}`
                      }
                      to="/regisztracio"
                      onClick={closeMenu}
                    >
                      Regisztráció
                    </NavLink>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
