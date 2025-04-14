import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PerfumeCard from "../components/PerfumeCard";
import { getRandomPerfumes } from "../services/perfumeService";
import "../style.css"; // Ensure styles are imported

const Home = () => {
  const [randomPerfumes, setRandomPerfumes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomPerfumes = async () => {
      setLoading(true);
      setError(null);
      try {
        const perfumesData = await getRandomPerfumes(4); // Fetch 4 random perfumes
        setRandomPerfumes(perfumesData);
      } catch (err) {
        console.error("Error fetching random perfumes:", err);
        setError(
          err.message || "Nem sikerült betölteni az ajánlott parfümöket."
        );
        setRandomPerfumes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRandomPerfumes();
  }, []);

  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content container">
          <h1 className="display-4 fw-bold">Üdvözöljük a Parfümvilágban</h1>
          <p className="lead col-lg-8 mx-auto">
            Találd meg álmaid parfümjét ajánlásainkkal és
            árösszehasonlításainkkal – egyszerűen, gyorsan, stílusosan!
          </p>
          <div className="hero-actions d-grid gap-2 d-sm-flex justify-content-sm-center">
            <Link to="/kereses" className="btn btn-primary btn-lg px-4 gap-3">
              Keresés indítása
            </Link>
            <Link
              to="/katalogus"
              className="btn btn-outline-secondary btn-lg px-4"
            >
              Hírek felfedezése
            </Link>
          </div>
        </div>
      </section>

      {/* Recommended Perfumes Section */}
      <section className="featured-section container my-5">
        <h2 className="section-title text-center mb-4">Kiemelt Ajánlataink</h2>
        {loading && (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Betöltés...</span>
            </div>
          </div>
        )}
        {error && <div className="alert alert-danger text-center">{error}</div>}
        {!loading && !error && (
          // Alkalmazzuk az id="perfumeList"-et és a g-3 gap-et
          <div className="row g-3" id="perfumeList2">
            {randomPerfumes.length > 0 ? (
              randomPerfumes.map((perfume) => (
                // Használjuk a Bootstrap oszlopokat és a stretch igazítást
                <div
                  key={perfume.id}
                  className="col-lg-3 col-md-4 col-sm-6 col-12 d-flex align-items-stretch"
                >
                  <PerfumeCard perfume={perfume} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <div id="noResults" className="card p-4">
                  <i className="fas fa-box-open fa-3x mb-3 text-secondary"></i>
                  <h4>Nincs ajánlott parfüm</h4>
                  <p className="text-muted">
                    Jelenleg nem tudunk parfümöt ajánlani.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
