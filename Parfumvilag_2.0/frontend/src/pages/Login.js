import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginService } from "../services/authService";
import { AuthContext } from "../App";
import "../style.css";

// Bejelentkezési űrlapot megjelenítő komponens
const Login = () => {
  // Állapotok az űrlap mezőihez és a komponens működéséhez
  const [email, setEmail] = useState(""); // E-mail cím input mező állapota
  const [password, setPassword] = useState(""); // Jelszó input mező állapota
  const [error, setError] = useState(""); // Hibaüzenetek tárolására szolgáló állapot
  const [loading, setLoading] = useState(false); // Töltési állapot jelzésére (API hívás alatt)
  const navigate = useNavigate(); // Navigációs hook inicializálása
  const { login } = useContext(AuthContext); // Globális 'login' függvény kinyerése a kontextusból

  // Űrlap beküldését kezelő aszinkron függvény
  const handleSubmit = async (e) => {
    e.preventDefault(); // Alapértelmezett űrlapbeküldés megakadályozása
    setError(""); // Korábbi hibaüzenetek törlése
    setLoading(true); // Töltési állapot bekapcsolása (űrlap letiltásához)

    try {
      // Meghívjuk a bejelentkeztető service függvényt az email és jelszó adatokkal
      const { user, token } = await loginService(email, password); // Visszakapjuk a felhasználói adatokat és a tokent

      // Meghívjuk a globális (kontextusból származó) login függvényt, hogy frissítsük az alkalmazás állapotát
      login(user, token);

      // Sikeres bejelentkezés után átirányítjuk a felhasználót a profil oldalra
      navigate("/profil");
    } catch (error) {
      // Hiba esetén beállítjuk a hibaüzenetet a service-től kapott üzenettel vagy egy alapértelmezettel
      setError(error.message || "Bejelentkezés sikertelen!");
      console.error("Login failed:", error); // Hiba logolása a konzolra fejlesztési célból
    } finally {
      // Ez a blokk mindenképpen lefut (siker és hiba esetén is)
      setLoading(false); // Töltési állapot kikapcsolása (űrlap újra engedélyezése)
    }
  };

  // Komponens JSX struktúrája
  return (
    <div className="container">
      {" "}
      {/* Fő konténer az oldal tartalmához */}
      <h1>Bejelentkezés</h1> {/* Oldal címe */}
      {/* Hibaüzenet megjelenítése, ha van hiba */}
      {error && <div className="alert alert-danger">{error}</div>}
      {/* Bejelentkezési űrlap */}
      <form onSubmit={handleSubmit}>
        {/* Email cím input mező */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control" // Bootstrap stílus
            id="email"
            value={email} // Input értékének kötése az 'email' állapothoz
            onChange={(e) => setEmail(e.target.value)} // Állapot frissítése gépeléskor
            required // Kötelező mező
            disabled={loading} // Letiltva, ha a bejelentkezés folyamatban van
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
            value={password} // Input értékének kötése a 'password' állapothoz
            onChange={(e) => setPassword(e.target.value)} // Állapot frissítése gépeléskor
            required // Kötelező mező
            disabled={loading} // Letiltva, ha a bejelentkezés folyamatban van
          />
        </div>
        {/* Beküldés gomb */}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {/* Gomb szövege a töltési állapottól függően változik */}
          {loading ? "Bejelentkezés..." : "Bejelentkezés"}
        </button>
      </form>
    </div>
  );
};

export default Login;
