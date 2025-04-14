const db_helper = require("../db"); // Adjust path if needed

const queryAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    db_helper.query(sql, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

module.exports = { queryAsync };
