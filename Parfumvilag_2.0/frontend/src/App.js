import React, { createContext, useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import PerfumeDetail from "./pages/PerfumeDetail";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import Search from "./pages/Search";
import Login from "./pages/Login";
import About from "./pages/About";
import Aszf from "./pages/Aszf";
import Favorites from "./pages/Favorites";

import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

// AuthContext létrehozása: globális állapot tárolására és megosztására szolgál (bejelentkezési állapot, felhasználói adatok)
export const AuthContext = createContext();

// Fő alkalmazás komponens
function App() {
  // Állapotok az autentikáció kezeléséhez
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Bejelentkezési állapot (kezdetben false)
  const [user, setUser] = useState(null); // Bejelentkezett felhasználó adatainak tárolása (kezdetben null)
  const [token, setToken] = useState(localStorage.getItem("token")); // JWT token tárolása (kezdetben a localStorage-ból olvasva)

  // Effekt hook: Az alkalmazás betöltődésekor ellenőrzi a localStorage-t a mentett bejelentkezési állapot visszaállításához
  useEffect(() => {
    const storedToken = localStorage.getItem("token"); // Token kiolvasása
    const storedUser = localStorage.getItem("user"); // Felhasználói adatok kiolvasása (JSON stringként tárolva)
    if (storedToken) {
      // Ha van mentett token
      setToken(storedToken); // Beállítja a token állapotot
      setIsLoggedIn(true); // Beállítja a bejelentkezett állapotot
      if (storedUser) {
        // Ha vannak mentett felhasználói adatok
        try {
          setUser(JSON.parse(storedUser)); // JSON string visszaalakítása objektummá és állapot beállítása
        } catch (e) {
          console.error("Failed to parse stored user data", e); // Hiba logolása, ha a JSON parse nem sikerül
          // Potenciálisan sérült adat kezelése, pl. kijelentkeztetés
          logout(); // A logout hívás itt rekurzív loopot okozhat, ha a logout függősége nincs kezelve (de useCallback miatt valószínűleg rendben van)
        }
      }
      // Opcionális: Itt lehetne ellenőrizni a token érvényességét a backenddel, ha szükséges
    }
    // Az üres függőségi tömb ([]) biztosítja, hogy ez az effect csak egyszer fusson le, az alkalmazás indulásakor.
  }, []); // Figyelem: a logout függvény is lehetne függőség, de mivel useCallback-kel van definiálva, és nincs külső függősége, ez itt nem okoz problémát.

  // Bejelentkezési függvény: frissíti a kontextus állapotát és a localStorage-t
  // useCallback: Optimalizálás, biztosítja, hogy a függvény referenciája csak akkor változzon, ha a függőségei változnak (itt nincsenek).
  const login = useCallback((userData, userToken) => {
    try {
      console.log("[Context] Updating context login:", userData); // Logolás fejlesztéshez
      localStorage.setItem("token", userToken); // Token mentése a localStorage-ba
      localStorage.setItem("isLoggedIn", "true"); // Bejelentkezési állapot jelző mentése
      // Biztosítjuk, hogy a userData létezik, mielőtt stringgé alakítanánk
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData)); // Felhasználói adatok mentése JSON stringként
      } else {
        localStorage.removeItem("user"); // Ha nincs userData, töröljük a régit (vagy hibát kezelünk)
      }
      // Kontextus állapotainak frissítése
      setToken(userToken);
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("[Context] Error during login update:", error); // Hiba logolása (pl. ha a userData nem szerializálható)
    }
  }, []); // Üres függőségi tömb

  // Kijelentkezési függvény: frissíti a kontextus állapotát és törli az adatokat a localStorage-ból
  // useCallback: Optimalizálás.
  const logout = useCallback(() => {
    // Adatok törlése a localStorage-ból
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    // Régebbi, esetleg felesleges elemek törlése (biztonság kedvéért)
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    // Kontextus állapotainak visszaállítása alaphelyzetbe
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    // Opcionális: Átirányítás a főoldalra vagy bejelentkezési oldalra kijelentkezés után
    // navigate('/'); // Ehhez a useNavigate hook-ot kellene használni a komponensben, vagy átadni paraméterként.
  }, []); // Üres függőségi tömb.

  // Az AuthContext Provider számára átadandó érték objektum összeállítása
  const authContextValue = {
    isLoggedIn,
    user,
    token,
    login, // login függvény átadása a kontextus fogyasztói számára
    logout, // logout függvény átadása a kontextus fogyasztói számára
  };

  // Komponens JSX struktúrája
  return (
    // Az AuthContext.Provider körbeveszi az alkalmazás azon részeit, amelyeknek hozzá kell férniük a kontextushoz
    <AuthContext.Provider value={authContextValue}>
      {" "}
      {/* A kontextus értékének átadása */}
      {/* Router beállítása a kliensoldali útvonalválasztáshoz */}
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        {" "}
        {/* React Router v6+ beállítások */}
        <Navbar />{" "}
        {/* Navigációs sáv megjelenítése (hozzáfér az AuthContext-hez) */}
        {/* Fő tartalmi konténer (Bootstrap stílussal) */}
        <div className="container my-5">
          {/* Útvonalak definiálása */}
          <Routes>
            <Route path="/" element={<Home />} /> {/* Főoldal útvonala */}
            <Route path="/katalogus" element={<Catalog />} />{" "}
            {/* Hírek/Katalógus útvonala */}
            <Route path="/kereses" element={<Search />} />{" "}
            {/* Keresés útvonala */}
            <Route path="/rolunk" element={<About />} /> {/* Rólunk útvonala */}
            {/* Bejelentkezés útvonala (a komponens hozzáfér a kontextushoz) */}
            <Route path="/bejelentkezes" element={<Login />} />
            {/* Regisztráció útvonala (a komponens hozzáfér a kontextushoz) */}
            <Route path="/regisztracio" element={<Register />} />
            {/* Védett útvonal példa: Profil oldal */}
            {/* Csak akkor jeleníti meg a Profil komponenst, ha a felhasználó be van jelentkezve, különben a Login komponenst */}
            <Route
              path="/profil"
              element={isLoggedIn ? <Profile /> : <Login />}
            />
            <Route path="/parfume/:id" element={<PerfumeDetail />} />{" "}
            {/* Parfüm részletes oldal útvonala dinamikus ID-vel */}
            <Route path="/aszf" element={<Aszf />} /> {/* ÁSZF útvonala */}
            {/* Védett útvonal: Kedvencek oldal */}
            {/* Csak akkor jeleníti meg a Favorites komponenst, ha a felhasználó be van jelentkezve, különben a Login komponenst */}
            <Route
              path="/kedvencek"
              element={isLoggedIn ? <Favorites /> : <Login />}
            />
          </Routes>
        </div>
        <Footer /> {/* Lábléc megjelenítése */}
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
