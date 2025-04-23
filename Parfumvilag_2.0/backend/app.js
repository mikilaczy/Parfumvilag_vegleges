const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const db = require("./db"); // DB kapcsolat

const app = express();
console.log("--- Express App Created ---"); // LOG 1

app.use((req, res, next) => {
  // Írjuk ki a kérés alapadatait, MIELŐTT bármi más feldolgozná
  console.log(
    `*** INCOMING REQUEST *** ${req.method} ${req.originalUrl} from ${req.ip}`
  );
  // Írjuk ki a fontos headeröket (pl. auth token)
  console.log("   Headers:", {
    "Content-Type": req.headers["content-type"],
    "x-auth-token": req.headers["x-auth-token"], // Vagy 'authorization' ha Bearer tokent használsz
    Origin: req.headers["origin"],
  });
  next(); // <<< FONTOS: Tovább kell engedni a kérést!
});

app.use(
  cors({
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-auth-token"],
  })
);

console.log("--- CORS Middleware Initialized ---"); // LOG 2
app.use(bodyParser.json());
console.log("--- BodyParser Middleware Initialized ---"); // LOG 3

// Importáljuk az útvonalakat
const authRoutes = require("./routes/authRoutes");
const brandRoutes = require("./routes/brandRoutes");

const noteRoutes = require("./routes/noteRoutes");
const perfumeRoutes = require("./routes/perfumeRoutes");

const reviewRoutes = require("./routes/reviewRoutes");
const savedPerfumeRoutes = require("./routes/savedPerfumeRoutes");

const storeRoutes = require("./routes/storeRoutes");
const userRoutes = require("./routes/userRoutes");
// Használjuk az útvonalakat
app.use("/api/auth", authRoutes);
app.use("/api/brands", brandRoutes);

app.use("/api/notes", noteRoutes);
app.use("/api/perfumes", perfumeRoutes);

app.use("/api/reviews", reviewRoutes);
app.use("/api/saved-perfumes", savedPerfumeRoutes);

app.use("/api/stores", storeRoutes);
app.use("/api/users", userRoutes);
console.log("--- Routers Mounted ---"); // LOG 5

app.use((err, req, res, next) => {
  console.error(
    "!!! Unhandled Error Caught by Central Handler:",
    err.stack || err
  );
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || "Ismeretlen szerverhiba.";
  res.status(statusCode).json({
    error: errorMessage,
    // stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined // Stack trace csak fejlesztéskor
  });
});
console.log("--- Central Error Handler Initialized ---"); // LOG 6

// Adatbázis tesztelése
db.query("SELECT 1 + 1 AS solution", (err, results) => {
  if (err) {
    console.error("Error testing MySQL connection:", err.stack);
    return;
  }
  console.log("MySQL connection successful:", results[0].solution);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
