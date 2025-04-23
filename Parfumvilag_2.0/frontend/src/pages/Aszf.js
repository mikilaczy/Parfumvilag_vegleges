import React from "react"; // React könyvtár importálása
import "../style.css"; // Stíluslap importálása

// Az ÁSZF (Általános Szerződési Feltételek) oldalt megjelenítő komponens
const Aszf = () => {
  return (
    // Fő konténer az ÁSZF oldalhoz, egyedi stílusosztállyal
    <div className="aszf-page">
      <div className="container">
        {/* Tartalom középre igazításához használt Bootstrap konténer */}
        <h1 className="aszf-title">Általános Szerződési Feltételek</h1>{" "}
        {/* Oldal főcíme */}
        <div className="aszf-content">
          {/* A szöveges tartalom konténere */}
          {/* 1. Bevezetés szekció */}
          <section className="aszf-section">
            <h2>1. Bevezetés</h2>
            <p>
              Üdvözöljük a Parfümvilág weboldalon! Jelen Általános Szerződési
              Feltételek (ÁSZF) szabályozzák a weboldal használatát, valamint a
              Parfümvilág és a Felhasználók közötti jogviszonyt. Kérjük,
              figyelmesen olvassa el az ÁSZF-et, mert a weboldal használatával
              Ön elfogadja annak feltételeit.
            </p>
          </section>
          {/* 2. A Szolgáltatás tárgya szekció */}
          <section className="aszf-section">
            <h2>2. A Szolgáltatás tárgya</h2>
            <p>
              A Parfümvilág egy online platform, amely parfümökkel kapcsolatos
              információkat, értékeléseket és keresési lehetőségeket kínál. A
              Szolgáltató fenntartja a jogot, hogy a szolgáltatásokat bármikor
              módosítsa vagy megszüntesse, erről a Felhasználókat előzetesen
              értesíti.
            </p>
          </section>
          {/* 3. Felhasználási feltételek szekció */}
          <section className="aszf-section">
            <h2>3. Felhasználási feltételek</h2>
            <p>
              3.1. A weboldal használatához szükséges, hogy a Felhasználó
              betöltse a 18. életévét, és elfogadja jelen ÁSZF-et.
              <br />
              3.2. A Felhasználó köteles valós adatokat megadni a regisztráció
              során, és felelősséget vállal azok pontosságáért.
              <br />
              3.3. Tilos a weboldal jogosulatlan használata, beleértve a
              harmadik felek adatainak jogosulatlan gyűjtését vagy bármilyen
              jogellenes tevékenységet.
            </p>
          </section>
          {/* 4. Adatvédelem szekció */}
          <section className="aszf-section">
            <h2>4. Adatvédelem</h2>
            <p>
              A Szolgáltató a Felhasználók adatait az Adatvédelmi Tájékoztatóban
              foglaltak szerint kezeli, amely külön dokumentumban érhető el a
              weboldalon.
            </p>
          </section>
          {/* 5. Záró rendelkezések szekció */}
          <section className="aszf-section">
            <h2>5. Záró rendelkezések</h2>
            <p>
              5.1. A Szolgáltató jogosult az ÁSZF-et egyoldalúan módosítani,
              erről a Felhasználókat a weboldalon vagy e-mailben értesíti.
              <br />
              5.2. A jogvitákra a magyar jog az irányadó.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Aszf;
