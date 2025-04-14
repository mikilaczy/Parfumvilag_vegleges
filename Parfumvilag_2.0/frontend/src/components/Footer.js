import React from 'react';
import { Link } from 'react-router-dom';
import '../style.css';

const Footer = () => {
  return (
    <footer className="footer_section">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h4 className="footer-title">Kapcsolat</h4>
            <div className="contact_link_box">
              <a
                href="https://www.google.com/maps?q=Budapest"
                target="_blank"
                rel="noopener noreferrer"
                className="contact_link"
              >
                <i className="fas fa-map-marker-alt"></i> Budapest
              </a>
              <a href="tel:+36123456789" className="contact_link">
                <i className="fas fa-phone-alt"></i> +36 123 456 789
              </a>
              <a href="mailto:info@parfumvilag.hu" className="contact_link">
                <i className="fas fa-envelope"></i> info@parfumvilag.hu
              </a>
            </div>
          </div>
          <div className="footer-col">
            <h4 className="footer-title">Parfümvilág</h4>
            <p>Keress minket bizalommal! Az alábbi platformokon is elérhetőek vagyunk:</p>
            <div className="footer_social">
              <a
                href="https://facebook.com/parfumvilag"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
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
          <div className="footer-col">
            <h4 className="footer-title">Ügyfélszolgálat</h4>
            <p>Minden nap</p>
            <p>10:00 - 18:00</p>
          </div>
        </div>
        <div className="footer-aszf">
          <Link to="/aszf" className="btn btn-peach aszf-btn">
            Általános Szerződési Feltételek
          </Link>
        </div>
        <div className="footer-info">
          <p>© 2025 Parfümvilág. Minden jog fenntartva.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;