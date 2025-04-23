// A bolti ajánlat (Store) adatmodelljének betöltése
const Store = require("../models/store"); // Figyelem: a modell neve lehet 'Store' vagy 'store', ellenőrizd a fájlnevet!

// Összes bolti ajánlat lekérdezése (minden parfüm minden boltban)
exports.getAllStores = (req, res) => {
  Store.getAllStores((err, results) => {
    if (err) {
      // Hiba esetén 500-as státuszkód és hibaüzenet küldése
      res.status(500).json({ error: err.message });
    } else {
      // Sikeres lekérdezés esetén 200-as státuszkód és az eredmények küldése JSON formátumban
      res.status(200).json(results);
    }
  });
};

// Egy specifikus bolti ajánlat lekérdezése az ajánlat saját ID-ja alapján
exports.getStoreById = (req, res) => {
  Store.getStoreById(req.params.id, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.length === 0) {
      // Ha nincs találat az adott ID-re, 404-es státuszkód küldése
      res.status(404).json({ error: "Store not found" }); // Bolti ajánlat nem található
    } else {
      // Sikeres lekérdezés esetén a talált ajánlat adatainak küldése
      res.status(200).json(results[0]);
    }
  });
};

// Új bolti ajánlat létrehozása (pl. egy parfüm hozzáadása egy bolthoz árral és URL-lel)
exports.createStore = (req, res) => {
  Store.createStore(req.body, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Sikeres létrehozás esetén 201-es státuszkód és az új ajánlat adatainak (ID-val kiegészítve) küldése
      res.status(201).json({ id: results.insertId, ...req.body });
    }
  });
};

// Meglévő bolti ajánlat frissítése az ajánlat ID-ja alapján
exports.updateStore = (req, res) => {
  Store.updateStore(req.params.id, req.body, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      // Ha a frissítés nem érintett sort (nem található az ID), 404-es státuszkód küldése
      res.status(404).json({ error: "Store not found" }); // Bolti ajánlat nem található
    } else {
      // Sikeres frissítés után lekérdezzük és visszaküldjük a frissített ajánlat adatait
      Store.getStoreById(req.params.id, (err, updatedResults) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.status(200).json(updatedResults[0]);
        }
      });
    }
  });
};

// Bolti ajánlat törlése az ajánlat ID-ja alapján
exports.deleteStore = (req, res) => {
  Store.deleteStore(req.params.id, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      // Ha a törlés nem érintett sort (nem található az ID), 404-es státuszkód küldése
      res.status(404).json({ error: "Store not found" }); // Bolti ajánlat nem található
    } else {
      // Sikeres törlés esetén 200-as státuszkód és üzenet küldése
      res.status(200).json({ message: "Store deleted successfully" }); // Ajánlat sikeresen törölve
    }
  });
};
