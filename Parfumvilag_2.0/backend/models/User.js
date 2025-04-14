const db = require("../db");
const bcrypt = require("bcryptjs");
const { queryAsync } = require("./helpers"); // Assuming queryAsync is in a helper file now

// Helper function to promisify db.query

const getAllUsers = async () => {
  return queryAsync(
    "SELECT id, name, email, phone, profile_picture_url, is_admin, created_at FROM users"
  ); // Password excluded
};

const getUserById = async (id) => {
  console.log(`[Model getUserById] Fetching user with ID: ${id}`); // Log Start
  const sql =
    "SELECT id, name, email, phone, profile_picture_url, is_admin, created_at FROM users WHERE id = ?"; // Pontos SELECT lista
  try {
    const results = await queryAsync(sql, [id]);
    // <<< ITT LOGOLJUK A NYERS EREDMÉNYT >>>
    console.log(`[Model getUserById] Raw DB result for ID ${id}:`, results);
    // <<< LOG VÉGE >>>
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error(`[Model getUserById] DB Error fetching user ${id}:`, error);
    // Dobjuk tovább a hibát, hogy a controller elkapja
    throw new Error("Adatbázis hiba a felhasználó lekérésekor.");
  }
};
const getUserByEmail = async (email) => {
  // Visszaadja a teljes user objektumot (jelszóval együtt) az ellenőrzéshez
  const results = await queryAsync("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return results.length > 0 ? results[0] : null;
};

const createUser = async (user) => {
  try {
    const hash = await bcrypt.hash(user.password, 10);
    const newUser = { ...user, password: hash };
    // Explicit oszlopok megadása a biztonság kedvéért
    const { name, email, password, phone, profile_picture_url, is_admin } =
      newUser;
    const result = await queryAsync(
      "INSERT INTO users (name, email, password, phone, profile_picture_url, is_admin) VALUES (?, ?, ?, ?, ?, ?)",
      [
        name,
        email,
        password,
        phone || null,
        profile_picture_url || null,
        is_admin || 0,
      ]
    );
    return { insertId: result.insertId }; // Visszaadjuk az új ID-t
  } catch (error) {
    // Kezeljük az esetleges egyedi kulcs (email) ütközést
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Ez az email cím már foglalt!");
    }
    throw error; // Egyéb hibák továbbdobása
  }
};

const updateUser = async (id, userData) => {
  // ... (Az updateUser kódja a korábbi részletes logokkal) ...
  console.log(`[Model] Updating user ${id}. Raw data:`, userData);
  const user = { ...userData };

  if (user.password && user.password.trim() !== "") {
    try {
      console.log(`[Model] Hashing password for user ${id}...`);
      user.password = await bcrypt.hash(user.password, 10);
      console.log(`[Model] Password hashed for user ${id}.`);
    } catch (hashErr) {
      console.error(`[Model] Password hashing error for user ${id}:`, hashErr);
      throw new Error("Jelszó hashelési hiba.");
    }
  } else {
    delete user.password;
  }

  const allowedFields = [
    "name",
    "email",
    "password",
    "phone",
    "profile_picture_url",
  ];
  const updateData = {};
  for (const key of allowedFields) {
    if (user.hasOwnProperty(key)) {
      updateData[key] =
        user[key] === null || user[key] === "" ? null : user[key];
    }
  }
  if (!user.password && updateData.hasOwnProperty("password")) {
    delete updateData.password;
  }

  if (Object.keys(updateData).length === 0) {
    console.log(`[Model] No valid fields to update for user ${id}.`);
    return {
      affectedRows: 0,
      changedRows: 0,
      message: "Nincs frissítendő adat.",
    };
  }

  console.log(
    `[Model] Preparing DB update for user ${id} with data:`,
    updateData
  );
  const sqlUpdate = "UPDATE users SET ? WHERE id = ?";
  try {
    console.log(`[Model] Executing DB update for user ${id}...`);
    const result = await queryAsync(sqlUpdate, [updateData, id]);
    console.log(`[Model] DB update result for user ${id}:`, result);
    if (result.affectedRows === 0) {
      console.warn(
        `[Model] User ${id} not found or data identical during update.`
      );
    }
    return result;
  } catch (error) {
    console.error(`[Model] DB Error updating user ${id}:`, error);
    if (error.code === "ER_DUP_ENTRY" && error.message.includes("email")) {
      console.warn(`[Model] Duplicate email error for user ${id}`);
      throw new Error("Ez az email cím már foglalt!");
    }
    throw new Error("Adatbázis hiba a felhasználó frissítésekor.");
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  queryAsync, // Esetleg exportálhatod más modellekhez is
};
