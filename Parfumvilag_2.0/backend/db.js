const mysql = require("mysql"); // A `mysql` csomag betöltése az adatbázis-kapcsolat kezeléséhez
require("dotenv").config(); // Környezeti változók betöltése a `.env` fájlból (pl. adatbázis adatokhoz)

// Adatbázis-kapcsolat objektum létrehozása a környezeti változókból olvasott konfigurációval
const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306, // - Ezt a sort felülírja a következő!
  port: process.env.MYSQL_PORT || 3307, // - Ez az érvényes port beállítás.
});

// Tényleges kapcsolódás az adatbázishoz és a kapcsolódás eredményének kezelése
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.stack);
    return;
  }
  // Sikeres kapcsolódás esetén üzenet logolása a konzolra a kapcsolat ID-jával
  console.log("Connected to MySQL as id " + connection.threadId);
});

module.exports = connection;
