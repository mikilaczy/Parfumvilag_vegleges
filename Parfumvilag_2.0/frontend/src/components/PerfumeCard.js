import React, { useState, useEffect, useContext } from "react"; // React és szükséges Hook-ok importálása
import { Link, useNavigate } from "react-router-dom"; // Navigációhoz szükséges komponensek
import { AuthContext } from "../App"; // Globális autentikációs kontextus importálása
import {
  getMyFavoriteIds,
  addFavorite,
  removeFavorite,
} from "../services/savedPerfumeService"; // Kedvencek kezeléséhez szükséges service függvények
import "../style.css"; // Stíluslap importálása

// Egyszerűsített bejelentkezési felugró ablak komponens
const LoginPromptModal = ({ onClose, onLoginRedirect }) => (
  <>
    {/* Áttetsző háttér, amelyre kattintva bezáródik a modal */}
    <div className="login-prompt-overlay" onClick={onClose} />
    {/* A modal tényleges tartalma */}
    <div className="login-prompt">
      <button className="close-btn" onClick={onClose}>
        ×
      </button>
      <h3>Bejelentkezés szükséges</h3>
      <p>Be kell jelentkezni a kedvencek kezeléséhez.</p>
      <div className="d-flex justify-content-center mt-3">
        {" "}
        {/* Gombok középre igazítva */}
        <button className="login-btn me-2" onClick={onLoginRedirect}>
          {" "}
          {/* Bejelentkezés gomb */}
          Bejelentkezés
        </button>
        <button className="cancel-btn" onClick={onClose}>
          {" "}
          {/* Mégse gomb */}
          Mégse
        </button>
      </div>
    </div>
  </>
);

// Parfüm kártya komponens definíciója
// - `perfume`: A megjelenítendő parfüm adatait tartalmazó objektum.
// - `onFavoriteChange`: Opcionális callback függvény, ami akkor hívódik meg, ha a kedvenc állapot változik.
const PerfumeCard = ({ perfume, onFavoriteChange }) => {
  // Parfüm tulajdonságainak destrukturálása alapértelmezett értékekkel, ha hiányoznak
  const {
    id,
    name = "Ismeretlen Parfüm", // Név, vagy alapértelmezett szöveg
    brand_name: brand, // Márkanév (átnevezve 'brand'-re)
    price, // Ár
    image_url, // Kép URL
  } = perfume || {}; // Ha a 'perfume' objektum undefined, üres objektumot használ

  // Autentikációs kontextus és navigációs hook használata
  const { isLoggedIn, token, logout } = useContext(AuthContext); // Bejelentkezési állapot, token és kijelentkeztető függvény a kontextusból
  const navigate = useNavigate(); // Programozott navigációhoz

  // Komponens belső állapotai
  const [isFavorite, setIsFavorite] = useState(false); // Tárolja, hogy az adott parfüm kedvenc-e
  const [showLoginPrompt, setShowLoginPrompt] = useState(false); // Bejelentkezési felugró ablak láthatósága
  const [loadingFavorite, setLoadingFavorite] = useState(false); // Töltési állapot a kedvenc gomb műveleteihez

  // Ár formázása forintra
  const formattedPrice = () => {
    if (price === undefined || price === null) {
      return "Ár információ nem elérhető"; // Ha nincs ár adat
    }
    // Nemzetközi számformázó használata HUF pénznemmel, tizedesjegyek nélkül
    return new Intl.NumberFormat("hu-HU", {
      style: "currency",
      currency: "HUF",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Effect hook: a komponens betöltődésekor ellenőrzi, hogy a parfüm kedvenc-e
  useEffect(() => {
    let isMounted = true; // Zászló, hogy megakadályozzuk az állapotfrissítést, ha a komponens már nincs a DOM-ban

    // Aszinkron függvény a kedvenc állapot ellenőrzésére
    const checkIfFavorite = async () => {
      // Ha nincs bejelentkezve a felhasználó, vagy hiányzik a parfüm ID, nem kell ellenőrizni
      if (!isLoggedIn || !id) {
        if (isMounted) setIsFavorite(false); // Biztosítjuk, hogy ilyenkor false legyen az állapot
        return;
      }

      // Az inicializáló ellenőrzéshez itt nem kell vizuális töltésjelző

      try {
        // console.log(`PerfumeCard (${id}): Checking favorite status...`);
        const favoriteIds = await getMyFavoriteIds(); // Felhasználó kedvenc parfümjeinek ID-listájának lekérése
        if (isMounted) {
          // Csak akkor frissítjük az állapotot, ha a komponens még be van illesztve
          const fav = favoriteIds.includes(id); // Ellenőrzi, hogy az aktuális parfüm ID szerepel-e a listában
          // console.log(`PerfumeCard (${id}): Is favorite? ${fav}`);
          setIsFavorite(fav); // Beállítja a lokális 'isFavorite' állapotot
        }
      } catch (error) {
        console.error(
          `PerfumeCard (${id}): Hiba a kedvenc állapot ellenőrzésekor:`,
          error
        );

        // Token hiba ellenőrzése (pl. lejárt token)
        if (error && error.error === "Token érvénytelen!") {
          console.warn(
            `PerfumeCard (${id}): Invalid token detected during check. Logging out.`
          );
          if (isMounted) {
            logout(); // Kijelentkeztetés a kontextus segítségével
            // Itt nem szükséges navigálni, a védett útvonalak vagy az App.js kezeli
          }
        } else if (isMounted) {
          // Egyéb hibák kezelése (pl. hálózati hiba) - naplózás vagy figyelmen kívül hagyás
          console.error(
            `PerfumeCard (${id}): Other error checking favorite status:`,
            error.message
          );
          // Nem autentikációs hibák esetén is 'false'-ra állítjuk a kedvenc állapotot
          setIsFavorite(false);
        }
      } finally {
        // Itt nincs mit visszaállítani a töltési állapotnál az inicializálásnál
      }
    };

    checkIfFavorite(); // Az ellenőrző függvény futtatása

    // Tisztító függvény: beállítja a 'isMounted' zászlót false-ra, amikor a komponens eltávolításra kerül
    return () => {
      isMounted = false;
    };
    // Függőségek: az effect újra lefut, ha az 'id', 'isLoggedIn', 'token' vagy 'logout' megváltozik
  }, [id, isLoggedIn, token, logout]);

  // Kedvenc állapot váltását kezelő függvény (szív ikonra kattintáskor)
  const handleToggleFavorite = async (e) => {
    e.preventDefault(); // Megakadályozza az alapértelmezett eseményt (pl. Link követése)
    e.stopPropagation(); // Megállítja az esemény továbbterjedését a szülő elemek felé

    // Ha a felhasználó nincs bejelentkezve, megjelenítjük a bejelentkezési ablakot
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    // Ha már folyamatban van egy kedvenc művelet, vagy nincs parfüm ID, nem csinálunk semmit
    if (loadingFavorite || !id) return;

    setLoadingFavorite(true); // Töltési állapot bekapcsolása (pl. gomb letiltása)

    try {
      let nowFavorite; // Az új kedvenc állapot tárolására

      // Ha jelenleg kedvenc, akkor eltávolítjuk
      if (isFavorite) {
        await removeFavorite(id); // API hívás az eltávolításhoz
        nowFavorite = false; // Az új állapot false lesz
      } else {
        // Ha nem kedvenc, akkor hozzáadjuk
        await addFavorite(id); // API hívás a hozzáadáshoz
        nowFavorite = true; // Az új állapot true lesz
      }

      // Lokális állapot frissítése az új értékkel
      setIsFavorite(nowFavorite);

      // Ha van külső callback függvény (onFavoriteChange), meghívjuk az új állapottal
      if (onFavoriteChange) {
        onFavoriteChange(id, nowFavorite);
      }
    } catch (error) {
      console.error(
        `PerfumeCard (${id}): Hiba a kedvencek kezelésekor:`,
        error
      );

      // Token hiba ellenőrzése és kezelése (kijelentkeztetés)
      if (error && error.error === "Token érvénytelen!") {
        console.warn(
          `PerfumeCard (${id}): Invalid token detected on toggle. Logging out.`
        );
        logout(); // Kijelentkeztetés
      } else {
        // Egyéb hibák esetén alert üzenet megjelenítése
        alert(
          `Hiba: ${error.message || "Nem sikerült módosítani a kedvencet."}`
        );
      }
    } finally {
      setLoadingFavorite(false); // Töltési állapot kikapcsolása minden esetben (siker, hiba)
    }
  };

  // Komponens JSX struktúrája
  return (
    <>
      {/* Parfüm kártya fő konténere */}
      <div className="perfume-card h-100">
        {" "}
        {/* `h-100` a magasság kitöltéséhez (Bootstrap) */}
        {/* Link, amely a kártya fő tartalmát foglalja magába és a részletes oldalra navigál */}
        <Link
          to={`/parfume/${id}`} // Dinamikus útvonal a parfüm ID-val
          className="perfume-card-link d-flex flex-column h-100" // Flexbox a belső elrendezéshez
          style={{ textDecoration: "none", color: "inherit" }} // Alapértelmezett link stílusok felülírása
        >
          {/* Parfüm képe */}
          <img
            src={image_url || "https://via.placeholder.com/220x200?text=Parfüm"} // Kép URL vagy placeholder
            alt={name} // Kép alt textje
            className="perfume-card-img" // Stílusosztály a képhez
          />
          {/* Kártya törzse */}
          <div className="perfume-card-body d-flex flex-column flex-grow-1 justify-content-between">
            {/* Flexbox a tartalom függőleges elosztásához */}
            {/* Felső rész: Cím, Márka, Ár */}
            <div>
              <h3 className="perfume-card-title">{name}</h3>
              {/* Márka megjelenítése, ha van */}
              {brand && (
                <p className="perfume-card-subtitle text-muted small mb-1">
                  {brand}
                </p>
              )}
              <p className="perfume-card-text">{formattedPrice()}</p>
              {/* Formázott ár */}
            </div>
            {/* Alsó rész: Ide kerülhetnének további információk vagy gombok */}
          </div>
        </Link>
        {/* Kedvenc gomb (CSS segítségével pozícionálva a kártya sarkába) */}
        <button
          className={`favorite-btn ${isFavorite ? "active" : ""} ${
            // Dinamikus osztályok: 'active' ha kedvenc
            loadingFavorite ? "disabled" : "" // 'disabled' ha töltési állapotban van
          }`}
          onClick={handleToggleFavorite} // Kattintás eseménykezelő
          disabled={loadingFavorite} // Gomb letiltása API hívás alatt
          aria-label={
            // Akadálymentesítés: képernyőolvasóknak szánt címke
            isFavorite
              ? "Eltávolítás a kedvencekből"
              : "Hozzáadás a kedvencekhez"
          }
          // A szív ikon (♥) a CSS ::before pszeudo-elemmel kerül hozzáadásra
        />
      </div>

      {/* Bejelentkezési felugró ablak (feltételesen jelenik meg) */}
      {showLoginPrompt && (
        <LoginPromptModal
          onClose={() => setShowLoginPrompt(false)} // Bezárás eseménykezelő
          onLoginRedirect={() => navigate("/bejelentkezes")} // Bejelentkezés oldalra átirányítás
        />
      )}
    </>
  );
};

export default PerfumeCard;
