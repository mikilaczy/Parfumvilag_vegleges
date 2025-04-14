const Store = require('../models/store');

exports.getAllStores = (req, res) => {
  Store.getAllStores((err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
};

exports.getStoreById = (req, res) => {
  Store.getStoreById(req.params.id, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Store not found' });
    } else {
      res.status(200).json(results[0]);
    }
  });
};

exports.createStore = (req, res) => {
  Store.createStore(req.body, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: results.insertId, ...req.body });
    }
  });
};

exports.updateStore = (req, res) => {
  Store.updateStore(req.params.id, req.body, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Store not found' });
    } else {
      Store.getStoreById(req.params.id, (err, results) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.status(200).json(results[0]);
        }
      });
    }
  });
};

exports.deleteStore = (req, res) => {
  Store.deleteStore(req.params.id, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Store not found' });
    } else {
      res.status(200).json({ message: 'Store deleted successfully' });
    }
  });
};