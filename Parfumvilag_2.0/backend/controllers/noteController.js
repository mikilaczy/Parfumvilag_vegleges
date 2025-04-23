// Az illatjegy adatmodelljének (Note) betöltése
const Note = require("../models/Note");

// Összes illatjegy lekérdezése
exports.getAllNotes = (req, res) => {
  Note.getAllNotes((err, results) => {
    if (err) {
      // Hiba esetén 500-as státuszkód és hibaüzenet küldése
      res.status(500).json({ error: err.message });
    } else {
      // Sikeres lekérdezés esetén 200-as státuszkód és az eredmények küldése JSON formátumban
      res.status(200).json(results);
    }
  });
};

// Egy specifikus illatjegy lekérdezése ID alapján
exports.getNoteById = (req, res) => {
  Note.getNoteById(req.params.id, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.length === 0) {
      // Ha nincs találat, 404-es státuszkód küldése ('Note not found')
      res.status(404).json({ error: "Note not found" });
    } else {
      // Sikeres lekérdezés esetén a talált illatjegy adatainak küldése
      res.status(200).json(results[0]);
    }
  });
};

// Új illatjegy létrehozása
exports.createNote = (req, res) => {
  Note.createNote(req.body, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Sikeres létrehozás esetén 201-es státuszkód és az új illatjegy adatainak (ID-val kiegészítve) küldése
      res.status(201).json({ id: results.insertId, ...req.body });
    }
  });
};

// Meglévő illatjegy frissítése ID alapján
exports.updateNote = (req, res) => {
  Note.updateNote(req.params.id, req.body, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      // Ha a frissítés nem érintett sort (nem található az ID), 404-es státuszkód küldése
      res.status(404).json({ error: "Note not found" });
    } else {
      // Sikeres frissítés után lekérdezzük és visszaküldjük a frissített illatjegy adatait
      Note.getNoteById(req.params.id, (err, updatedResults) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.status(200).json(updatedResults[0]);
        }
      });
    }
  });
};

// Illatjegy törlése ID alapján
exports.deleteNote = (req, res) => {
  Note.deleteNote(req.params.id, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      // Ha a törlés nem érintett sort (nem található az ID), 404-es státuszkód küldése
      res.status(404).json({ error: "Note not found" });
    } else {
      // Sikeres törlés esetén 200-as státuszkód és üzenet küldése
      res.status(200).json({ message: "Note deleted successfully" });
    }
  });
};
