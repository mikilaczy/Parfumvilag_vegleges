// routes/brandRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const sql = 'SELECT * FROM brands';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Hiba a márkák lekérdezésekor:', err);
      return res.status(500).json({ error: 'Szerver hiba' });
    }
    if (results.length === 0) {
      return res.status(200).json([]); // Üres lista, ha nincs adat
    }
    res.json(results);
  });
});

module.exports = router;