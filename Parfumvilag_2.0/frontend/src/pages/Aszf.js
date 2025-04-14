// Parfumvilag_2.0\frontend\src\pages\Aszf.js
import React from 'react';
import '../style.css';

const Aszf = () => {
  return (
    <div className="aszf-page">
      <div className="container">
        <h1 className="aszf-title">Általános Szerződési Feltételek</h1>
        <div className="aszf-content">
          <section className="aszf-section">
            <h2>1. Bevezetés</h2>
            <p>
              Üdvözöljük a Parfümvilág weboldalon! Jelen Általános Szerződési Feltételek (ÁSZF) szabályozzák a weboldal használatát, valamint a Parfümvilág és a Felhasználók közötti jogviszonyt. Kérjük, figyelmesen olvassa el az ÁSZF-et, mert a weboldal használatával Ön elfogadja annak feltételeit.
            </p>
          </section>
          <section className="aszf-section">
            <h2>2. A Szolgáltatás tárgya</h2>
            <p>
              A Parfümvilág egy online platform, amely parfümökkel kapcsolatos információkat, értékeléseket és keresési lehetőségeket kínál. A Szolgáltató fenntartja a jogot, hogy a szolgáltatásokat bármikor módosítsa vagy megszüntesse, erről a Felhasználókat előzetesen értesíti.
            </p>
          </section>
          <section className="aszf-section">
            <h2>3. Felhasználási feltételek</h2>
            <p>
              3.1. A weboldal használatához szükséges, hogy a Felhasználó betöltse a 18. életévét, és elfogadja jelen ÁSZF-et.<br />
              3.2. A Felhasználó köteles valós adatokat megadni a regisztráció során, és felelősséget vállal azok pontosságáért.<br />
              3.3. Tilos a weboldal jogosulatlan használata, beleértve a harmadik felek adatainak jogosulatlan gyűjtését vagy bármilyen jogellenes tevékenységet.
            </p>
          </section>
          <section className="aszf-section">
            <h2>4. Adatvédelem</h2>
            <p>
              A Szolgáltató a Felhasználók adatait az Adatvédelmi Tájékoztatóban foglaltak szerint kezeli, amely külön dokumentumban érhető el a weboldalon.
            </p>
          </section>
          <section className="aszf-section">
            <h2>5. Záró rendelkezések</h2>
            <p>
              5.1. A Szolgáltató jogosult az ÁSZF-et egyoldalúan módosítani, erről a Felhasználókat a weboldalon vagy e-mailben értesíti.<br />
              5.2. A jogvitákra a magyar jog az irányadó.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Aszf;