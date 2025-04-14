const db = require('../db');

const getAllNotes = (callback) => {
  db.query('SELECT * FROM notes', callback);
};

const getNoteById = (id, callback) => {
  db.query('SELECT * FROM notes WHERE id = ?', [id], callback);
};

const createNote = (note, callback) => {
  db.query('INSERT INTO notes SET ?', note, callback);
};

const updateNote = (id, note, callback) => {
  db.query('UPDATE notes SET ? WHERE id = ?', [note, id], callback);
};

const deleteNote = (id, callback) => {
  db.query('DELETE FROM notes WHERE id = ?', [id], callback);
};

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
};