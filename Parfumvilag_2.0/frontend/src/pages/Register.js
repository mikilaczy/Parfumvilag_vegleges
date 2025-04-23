import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { register as registerService } from "../services/authService";
import { AuthContext } from "../App";
import "../style.css";

// Regisztrációs űrlapot megjelenítő komponens
const Register = () => {
  // Állapotok az űrlap mezőihez és a működéshez
  const [name, setName] = useState(""); // Felhasználónév input mező állapota
  const [email, setEmail] = useState(""); // Email input mező állapota
  const [password, setPassword] = useState(""); // Jelszó input mező állapota
  const [confirmPassword, setConfirmPassword] = useState(""); // Jelszó megerősítése input mező állapota
  const [error, setError] = useState(""); // Hibaüzenetek tárolására szolgáló állapot
  const [loading, setLoading] = useState(false); // Töltési állapot (API hívás alatt)
  const navigate = useNavigate(); // Navigációs hook inicializálása
  const { login } = useContext(AuthContext); // Globális 'login' függvény kinyerése a kontextusból (regisztráció utáni automatikus bejelentkezéshez)

  // Űrlap beküldését kezelő aszinkron függvény
  const handleSubmit = async (e) => {
    e.preventDefault(); // Megakadályozza az oldal újratöltődését az űrlap beküldésekor
    setError(""); // Korábbi hibaüzenetek törlése minden beküldéskor

    // Validáció: Jelszó egyezés ellenőrzése
    if (password !== confirmPassword) {
      setError("A jelszavak nem egyeznek!"); // Hibaüzenet beállítása
      return; // Megállítja a függvény további futását
    }
    // Validáció: Jelszó hossz ellenőrzése
    if (password.length < 6) {
      setError("A jelszónak legalább 6 karakter hosszúnak kell lennie!"); // Hibaüzenet beállítása
      return; // Megállítja a függvény további futását
    }

    setLoading(true); // Töltési állapot bekapcsolása (pl. gomb letiltása)

    try {
      // Meghívjuk a regisztrációs service függvényt a megadott adatokkal
      const { user, token } = await registerService(name, email, password); // Visszakapjuk az új felhasználó adatait és a tokent

      // Sikeres regisztráció után azonnal bejelentkeztetjük a felhasználót a kontextus 'login' függvényével
      login(user, token);

      // Átirányítjuk a felhasználót a profil oldalra
      navigate("/profil");
    } catch (error) {
      // Hiba esetén beállítjuk a hibaüzenetet (a service-ből vagy egy alapértelmezett üzenettel)
      setError(error.message || "Regisztráció sikertelen!");
      console.error("Registration failed:", error); // Hiba logolása a konzolra fejlesztési célból
    } finally {
      // Ez a blokk mindenképpen lefut (siker és hiba esetén is)
      setLoading(false); // Töltési állapot kikapcsolása
    }
  };

  // Komponens JSX struktúrája
  return (
    <div className="container">
      {/* Fő konténer az oldal tartalmához */}
      <h1>Regisztráció</h1> {/* Oldal címe */}
      {/* Hibaüzenet megjelenítése, ha van hiba */}
      {error && <div className="alert alert-danger">{error}</div>}
      {/* Regisztrációs űrlap */}
      <form onSubmit={handleSubmit}>
        {/* Felhasználónév input mező */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Felhasználónév
          </label>
          <input
            type="text"
            className="form-control" // Bootstrap stílus
            id="name"
            value={name} // Input értékének kötése a 'name' állapothoz
            onChange={(e) => setName(e.target.value)} // Állapot frissítése gépeléskor
            required // Kötelező mező
            disabled={loading} // Letiltva, ha a regisztráció folyamatban van
          />
        </div>
        {/* Email cím input mező */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email cím
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        {/* Jelszó input mező */}
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Jelszó
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        {/* Jelszó megerősítése input mező */}
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Jelszó megerősítése
          </label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        {/* Beküldés gomb */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {/* Gomb szövege a töltési állapottól függően változik */}
          {loading ? "Regisztráció..." : "Regisztráció"}
        </button>
      </form>
    </div>
  );
};

export default Register;
