const Note = require('../models/Note');

exports.getAllNotes = (req, res) => {
  Note.getAllNotes((err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
};

exports.getNoteById = (req, res) => {
  Note.getNoteById(req.params.id, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Note not found' });
    } else {
      res.status(200).json(results[0]);
    }
  });
};

exports.createNote = (req, res) => {
  Note.createNote(req.body, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: results.insertId, ...req.body });
    }
  });
};

exports.updateNote = (req, res) => {
  Note.updateNote(req.params.id, req.body, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Note not found' });
    } else {
      Note.getNoteById(req.params.id, (err, results) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.status(200).json(results[0]);
        }
      });
    }
  });
};

exports.deleteNote = (req, res) => {
  Note.deleteNote(req.params.id, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Note not found' });
    } else {
      res.status(200).json({ message: 'Note deleted successfully' });
    }
  });
};