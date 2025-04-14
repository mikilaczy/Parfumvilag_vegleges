const db = require('../db');

const getAllBrands = (callback) => {
  db.query('SELECT * FROM brands', callback);
};

const getBrandById = (id, callback) => {
  db.query('SELECT * FROM brands WHERE id = ?', [id], callback);
};

const createBrand = (brand, callback) => {
  db.query('INSERT INTO brands SET ?', brand, callback);
};

const updateBrand = (id, brand, callback) => {
  db.query('UPDATE brands SET ? WHERE id = ?', [brand, id], callback);
};

const deleteBrand = (id, callback) => {
  db.query('DELETE FROM brands WHERE id = ?', [id], callback);
};

module.exports = {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand
};