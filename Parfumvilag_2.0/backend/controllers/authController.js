// backend/controllers/authController.js
const User = require("../models/User"); // Módosított User modell
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Regisztráció
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // Alap validáció
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Minden mező kitöltése kötelező (név, email, jelszó)!" });
  }
  if (password.length < 6) {
    return res.status(400).json({
      error: "A jelszónak legalább 6 karakter hosszúnak kell lennie!",
    });
  }

  try {
    // 1. Ellenőrizzük, létezik-e már a felhasználó
    const existingUser = await User.getUserByEmail(email);
    if (existingUser) {
      // Nem dobunk hibát, csak státuszkódot küldünk
      return res.status(409).json({ error: "Ez az email cím már foglalt!" }); // 409 Conflict
    }

    // 2. Felhasználó létrehozása (a modell már kezeli a hashelést és a DUP_ENTRY hibát)
    const result = await User.createUser({ name, email, password });
    const userId = result.insertId;

    // 3. Sikeres regisztráció után token generálása
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // 4. Felhasználói adatok visszaküldése (jelszó nélkül!)
    const newUser = await User.getUserById(userId); // Lekérjük az újonnan létrehozott usert (jelszó nélkül)
    if (!newUser) {
      // Ez nem valószínű, de jobb ellenőrizni
      console.error("User not found after creation, ID:", userId);
      return res
        .status(500)
        .json({ error: "Szerver hiba a felhasználó lekérésekor." });
    }

    res.status(201).json({
      user: {
        // Csak a szükséges, nem érzékeny adatokat küldjük vissza
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        // is_admin: newUser.is_admin // Ha szükséges
      },
      token,
    });
  } catch (error) {
    // A createUser által dobott specifikus hiba kezelése
    if (error.message === "Ez az email cím már foglalt!") {
      return res.status(409).json({ error: error.message });
    }
    // Általános szerverhiba
    console.error("Register Error:", error);
    res
      .status(500)
      .json({ error: "Szerverhiba történt a regisztráció során." });
  }
};

// Bejelentkezés
exports.login = async (req, res, next) => {
  // Ajánlott next használata
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email és jelszó megadása kötelező!" });
  }

  try {
    // 1. Felhasználó lekérése email alapján (Teljes objektumot ad vissza, jelszóval)
    const user = await User.getUserByEmail(email);

    // 2. Ellenőrizzük, létezik-e a felhasználó
    if (!user) {
      return res.status(401).json({ error: "Hibás email cím vagy jelszó!" });
    }

    // 3. Jelszó ellenőrzés
    const isMatch = await bcrypt.compare(password, user.password);

    // 4. Ellenőrizzük a jelszó egyezést
    if (!isMatch) {
      return res.status(401).json({ error: "Hibás email cím vagy jelszó!" });
    }

    // 5. Sikeres bejelentkezés => Token generálása
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Vagy amilyen lejáratot szeretnél
    });

    // 6. Felhasználói adatok visszaküldése (jelszó NÉLKÜL!)
    //    Most már a phone és profile_picture_url mezőket is beletesszük
    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile_picture_url: user.profile_picture_url,
        is_admin: user.is_admin, // Ha az admin státusz is kell a frontendnek
        // Fontos: A 'password' mezőt NE add vissza!
      },
      token,
    });
  } catch (error) {
    // Általános szerverhiba
    console.error("Login Error:", error);
    // Használjuk a next()-et, ha van központi hibakezelő
    if (next) {
      next(error);
    } else {
      res
        .status(500)
        .json({ error: "Szerverhiba történt a bejelentkezés során." });
    }
  }
};
