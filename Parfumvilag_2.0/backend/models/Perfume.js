// backend/models/perfumeModel.js
const db = require('../db');

// Összes parfüm lekérése
const getAllPerfumes = (callback) => {
  db.query('SELECT * FROM perfumes', callback);
};

// Kiemelt parfümök lekérése
const getFeaturedPerfumes = (callback) => {
  db.query('SELECT * FROM perfumes WHERE is_featured = 1', callback);
};

// Parfüm azonosító alapján
const getPerfumeById = (id, callback) => {
  db.query('SELECT * FROM perfumes WHERE id = ?', [id], callback);
};

// Parfüm létrehozása
const createPerfume = (perfume, callback) => {
  db.query('INSERT INTO perfumes SET ?', perfume, callback);
};

// Parfüm frissítése
const updatePerfume = (id, perfume, callback) => {
  db.query('UPDATE perfumes SET ? WHERE id = ?', [perfume, id], callback);
};

// Parfüm törlése
const deletePerfume = (id, callback) => {
  db.query('DELETE FROM perfumes WHERE id = ?', [id], callback);
};

module.exports = {
  getAllPerfumes,
  getFeaturedPerfumes,
  getPerfumeById,
  createPerfume,
  updatePerfume,
  deletePerfume
};