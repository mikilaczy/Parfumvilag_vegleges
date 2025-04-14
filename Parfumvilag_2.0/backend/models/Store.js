const db = require('../db');

const getAllStores = (callback) => {
  db.query('SELECT * FROM stores', callback);
};

const getStoreById = (id, callback) => {
  db.query('SELECT * FROM stores WHERE id = ?', [id], callback);
};

const createStore = (store, callback) => {
  db.query('INSERT INTO stores SET ?', store, callback);
};

const updateStore = (id, store, callback) => {
  db.query('UPDATE stores SET ? WHERE id = ?', [store, id], callback);
};

const deleteStore = (id, callback) => {
  db.query('DELETE FROM stores WHERE id = ?', [id], callback);
};

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore
};