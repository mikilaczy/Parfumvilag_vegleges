const db = require('../db');

const getAllPerfumeNotes = (callback) => {
  db.query('SELECT * FROM perfume_notes', callback);
};

const getPerfumeNoteById = (id, callback) => {
  db.query('SELECT * FROM perfume_notes WHERE id = ?', [id], callback);
};

const createPerfumeNote = (perfumeNote, callback) => {
  db.query('INSERT INTO perfume_notes SET ?', perfumeNote, callback);
};

const updatePerfumeNote = (id, perfumeNote, callback) => {
  db.query('UPDATE perfume_notes SET ? WHERE id = ?', [perfumeNote, id], callback);
};

const deletePerfumeNote = (id, callback) => {
  db.query('DELETE FROM perfume_notes WHERE id = ?', [id], callback);
};

module.exports = {
  getAllPerfumeNotes,
  getPerfumeNoteById,
  createPerfumeNote,
  updatePerfumeNote,
  deletePerfumeNote
};