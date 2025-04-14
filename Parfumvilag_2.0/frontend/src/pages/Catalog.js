import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../style.css';

const Catalog = () => {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);
  const API_KEY = '001f49d7cbf241f1bfeed545c38a76c2'; // NewsAPI kulcs
  const API_URL = `https://newsapi.org/v2/everything?q=perfume NOT (concert OR Genius OR novelist OR Trump OR Orders OR walmart OR habit OR Delicious OR PNOĒS OR Sophie OR Pizza OR Sci-Fi OR Logitech OR Watch OR Shoes OR Message OR Apothecary OR weekend OR Beauty OR Nightstand OR Reeves OR Shoe OR 韓国 OR Card OR Alba OR Apple OR Egyptian OR BWS OR Captain OR Recipe OR books OR Crossword OR rubbish OR Tea OR Candle OR Wine OR J-Pop OR robbers OR Newborn OR Bella OR Snacks OR Chronological OR Sexuality OR Stepsister OR Amazon OR Strange OR cheating)&language=en&sortBy=relevancy&apiKey=${API_KEY}`;

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(API_URL);
        const articles = response.data.articles.slice(0, 12); // Csak az első 12 hír
        setNews(articles);
      } catch (err) {
        setError('A hírek betöltése nem sikerült. Kérlek, próbáld újra később!');
        console.error('Hiba a hírek lekérésekor:', err);
      }
    };
    fetchNews();
  }, [API_URL]);

  return (
    <div className="container my-5">
      <h1 className="text-center mb-5">Parfüm Hírek</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <div id="news-container" className="row g-4">
        {news.length > 0 ? (
          news.map((article, index) => (
            <div key={index} className="col-md-4 col-sm-6 col-12">
              <div className="perfume-card">
                <img
                  src={article.urlToImage || 'https://via.placeholder.com/220x220?text=Nincs+kép'}
                  alt={article.title}
                  className="card-img-top"
                  style={{ height: '220px', objectFit: 'cover' }}
                />
                <div className="perfume-card-body" style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h5 className="perfume-card-title" style={{ fontSize: '1.6rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {article.title}
                    </h5>
                    <p className="perfume-card-text" style={{ fontSize: '0.95rem', height: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {article.description || 'Nincs elérhető leírás.'}
                    </p>
                  </div>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary">Tovább olvasom</a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div id="noResults" className="text-center">
            <i className="fas fa-search fa-3x mb-3"></i>
            <h4>{error ? 'Hiba történt' : 'Nincs találat'}</h4>
            <p>{error || 'Jelenleg nem állnak rendelkezésre releváns hírek.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;