const Brand = require('../models/Brand');

exports.getAllBrands = (req, res) => {
  Brand.getAllBrands((err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
};

exports.getBrandById = (req, res) => {
  Brand.getBrandById(req.params.id, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Brand not found' });
    } else {
      res.status(200).json(results[0]);
    }
  });
};

exports.createBrand = (req, res) => {
  Brand.createBrand(req.body, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json({ id: results.insertId, ...req.body });
    }
  });
};

exports.updateBrand = (req, res) => {
  Brand.updateBrand(req.params.id, req.body, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Brand not found' });
    } else {
      Brand.getBrandById(req.params.id, (err, results) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.status(200).json(results[0]);
        }
      });
    }
  });
};

exports.deleteBrand = (req, res) => {
  Brand.deleteBrand(req.params.id, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ error: 'Brand not found' });
    } else {
      res.status(200).json({ message: 'Brand deleted successfully' });
    }
  });
};