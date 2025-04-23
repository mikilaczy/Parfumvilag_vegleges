import React from "react";
import { Link } from "react-router-dom"; // Navigációhoz szükséges komponens
import "../style.css"; // Stíluslap importálása

// A Footer (lábléc) komponens definíciója
const Footer = () => {
  return (
    <footer className="footer_section">
      {/* Lábléc fő konténere */}
      <div className="container">
        {/* Tartalom középre igazításához használt konténer */}
        <div className="footer-grid">
          {/* Rács elrendezés a lábléc oszlopaihoz */}
          {/* Első oszlop: Kapcsolati információk */}
          <div className="footer-col">
            <h4 className="footer-title">Kapcsolat</h4>
            <div className="contact_link_box">
              <a
                href="https://www.google.com/maps?q=Budapest" // Külső link (Google Maps)
                target="_blank" // Új lapon nyitja meg
                rel="noopener noreferrer" // Biztonsági attribútumok külső linkekhez
                className="contact_link"
              >
                <i className="fas fa-map-marker-alt"></i> Budapest{" "}
                {/* Ikon és szöveg */}
              </a>
              <a href="tel:+36123456789" className="contact_link">
                {/* Telefonhívás link */}
                <i className="fas fa-phone-alt"></i> +36 123 456 789
              </a>
              <a href="mailto:info@parfumvilag.hu" className="contact_link">
                {/* E-mail link */}
                <i className="fas fa-envelope"></i> info@parfumvilag.hu
              </a>
            </div>
          </div>
          {/* Második oszlop: Cég név, rövid leírás és közösségi média linkek */}
          <div className="footer-col">
            <h4 className="footer-title">Parfümvilág</h4>
            <p>
              Keress minket bizalommal! Az alábbi platformokon is elérhetőek
              vagyunk:
            </p>
            <div className="footer_social">
              {/* Közösségi média ikonok konténere */}
              <a
                href="https://facebook.com/parfumvilag" // Közösségi linkek
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <i className="fab fa-facebook-f"></i> {/* Font Awesome ikon */}
              </a>
              {/* További közösségi linkek hasonlóan */}
              <a
                href="https://twitter.com/parfumvilag"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="https://linkedin.com/company/parfumvilag"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a
                href="https://instagram.com/parfumvilag"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://pinterest.com/parfumvilag"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <i className="fab fa-pinterest"></i>
              </a>
            </div>
          </div>
          {/* Harmadik oszlop: Ügyfélszolgálat nyitvatartása */}
          <div className="footer-col">
            <h4 className="footer-title">Ügyfélszolgálat</h4>
            <p>Minden nap</p>
            <p>10:00 - 18:00</p>
          </div>
        </div>
        {/* ÁSZF link szekció */}
        <div className="footer-aszf">
          <Link to="/aszf" className="btn btn-peach aszf-btn">
            {/* Belső link az ÁSZF oldalra */}
            Általános Szerződési Feltételek
          </Link>
        </div>
        {/* Copyright információ */}
        <div className="footer-info">
          <p>© 2025 Parfümvilág. Minden jog fenntartva.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
