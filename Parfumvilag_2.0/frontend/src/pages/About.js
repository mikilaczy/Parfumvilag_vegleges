import React from "react";
import { Link } from "react-router-dom";
import "../style.css";

const About = () => {
  return (
    <div className="about-page">
      <div className="container my-5">
        <h1 className="about-title text-center">Rólunk – Parfümvilág</h1>
        <p className="about-subtitle text-center">
          Fedezd fel velünk az illatok világát – ajánlások és árösszehasonlítás
          egy helyre!
        </p>

        {/* Miben segíthetünk? szekció */}
        <div className="row g-4 mb-5">
          <h2 className="section-title text-center mb-4">Miben segíthetünk?</h2>
          <div className="col-lg-4 col-md-6 col-12">
            <div className="about-card">
              <i className="fas fa-list-ul about-icon"></i>
              <h3 className="about-card-title">
                Kategóriák szerinti ajánlások
              </h3>
              <p className="about-card-text">
                Böngészd végig az illatcsoportokat és márkákat, hogy megtaláld
                az ideális parfümödet.
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 col-12">
            <div className="about-card">
              <i className="fas fa-balance-scale about-icon"></i>
              <h3 className="about-card-title">Árak összehasonlítása</h3>
              <p className="about-card-text">
                Hasonlítsd össze az árakat különböző forrásokból, hogy a legjobb
                ajánlatot találd meg.
              </p>
            </div>
          </div>
          <div className="col-lg-4 col-md-6 col-12">
            <div className="about-card">
              <i className="fas fa-star about-icon"></i>
              <h3 className="about-card-title">Ajánlott illatok</h3>
              <p className="about-card-text">
                Kapj szakértői ajánlásokat új és klasszikus parfümökre,
                személyre szabottan.
              </p>
            </div>
          </div>
        </div>

        {/* Kik vagyunk? szekció */}
        <div className="row g-4 align-items-center mb-5">
          <div className="col-md-6">
            <div className="about-card">
              <h2 className="about-card-title">Kik vagyunk?</h2>
              <p className="about-card-text">
                A Parfümvilág egy dedikált platform, amely segít megtalálni a
                tökéletes illatot ajánlásokkal és árösszehasonlításokkal.
                Küldetésünk, hogy időt spóroljunk neked, miközben az egyéni
                stílusodhoz illő parfümöt ajánljuk.
              </p>
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                alt="Parfümvilág csapat"
                className="about-card-img"
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="about-card">
              <h2 className="about-card-title">Célunk</h2>
              <p className="about-card-text">
                Szeretnénk, hogy mindenki megtalálja az egyedi illatát, amely
                kifejezi személyiségét. Az illatok története és stílusa inspirál
                minket – itt vagyunk, hogy útmutatót nyújtsunk ebben az
                utazásban.
              </p>
              <Link to="/kereses" className="btn btn-peach mt-3">
                Kezdj keresni most
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
