// A márka adatmodelljének (Brand) betöltése
const Brand = require("../models/Brand");

// Összes márka lekérdezése
exports.getAllBrands = (req, res) => {
  Brand.getAllBrands((err, results) => {
    if (err) {
      // Hiba esetén 500-as státuszkód és hibaüzenet küldése
      res.status(500).json({ error: err.message });
    } else {
      // Sikeres lekérdezés esetén 200-as státuszkód és az eredmények küldése JSON formátumban
      res.status(200).json(results);
    }
  });
};

// Egy specifikus márka lekérdezése ID alapján
exports.getBrandById = (req, res) => {
  Brand.getBrandById(req.params.id, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.length === 0) {
      // Ha nincs találat, 404-es státuszkód küldése
      res.status(404).json({ error: "Brand not found" });
    } else {
      // Sikeres lekérdezés esetén a talált márka adatainak küldése
      res.status(200).json(results[0]);
    }
  });
};

// Új márka létrehozása
exports.createBrand = (req, res) => {
  Brand.createBrand(req.body, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Sikeres létrehozás esetén 201-es státuszkód és az új márka adatainak (ID-val kiegészítve) küldése
      res.status(201).json({ id: results.insertId, ...req.body });
    }
  });
};

// Meglévő márka frissítése ID alapján
exports.updateBrand = (req, res) => {
  Brand.updateBrand(req.params.id, req.body, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      // Ha a frissítés nem érintett sort (nem található az ID), 404-es státuszkód küldése
      res.status(404).json({ error: "Brand not found" });
    } else {
      // Sikeres frissítés után lekérdezzük és visszaküldjük a frissített márka adatait
      Brand.getBrandById(req.params.id, (err, updatedResults) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.status(200).json(updatedResults[0]);
        }
      });
    }
  });
};

// Márka törlése ID alapján
exports.deleteBrand = (req, res) => {
  Brand.deleteBrand(req.params.id, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      // Ha a törlés nem érintett sort (nem található az ID), 404-es státuszkód küldése
      res.status(404).json({ error: "Brand not found" });
    } else {
      // Sikeres törlés esetén 200-as státuszkód és üzenet küldése
      res.status(200).json({ message: "Brand deleted successfully" });
    }
  });
};
