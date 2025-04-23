// Adatbázis segédfüggvények betöltése
const db_helper = require("../db");

// Aszinkron lekérdezést lehetővé tevő segédfüggvény
// Ez a függvény egy Promise-t ad vissza, ami megkönnyíti az adatbázis műveletek kezelését async/await segítségével.
const queryAsync = (sql, params) => {
  return new Promise((resolve, reject) => {
    // Az eredeti, callback-alapú lekérdezés futtatása
    db_helper.query(sql, params, (err, results) => {
      if (err) {
        // Hiba esetén a Promise elutasítása (reject) a hibával
        return reject(err);
      }
      // Sikeres lekérdezés esetén a Promise teljesítése (resolve) az eredményekkel
      resolve(results);
    });
  });
};

module.exports = { queryAsync };
