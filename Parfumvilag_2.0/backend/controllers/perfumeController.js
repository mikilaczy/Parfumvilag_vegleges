// backend/controllers/perfumeController.js
const Perfume = require("../models/Perfume");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../db");
require("dotenv").config();

// Összes parfüm
exports.getAllPerfumes = (req, res, next) => {
  // Adjunk hozzá next-et a jobb hibakezeléshez
  const {
    query = "",
    brand = "",
    note = "",
    gender = "",
    sort = "name-asc",
    min_price, // Ár szűrők
    max_price, // Ár szűrők
    page = 1,
    per_page = 24,
  } = req.query;

  console.log("Beérkező szűrési paraméterek:", {
    brand,
    note,
    gender,
    min_price,
    max_price,
    sort,
    page,
  });

  // --- Validálás és Paraméterek Előkészítése ---
  const currentPage = parseInt(page, 10);
  const perfumesPerPage = parseInt(per_page, 10);

  if (isNaN(currentPage) || currentPage < 1) {
    return res.status(400).json({ error: "Érvénytelen oldalszám." });
  }
  if (isNaN(perfumesPerPage) || perfumesPerPage < 1 || perfumesPerPage > 100) {
    // Limit per_page
    return res
      .status(400)
      .json({ error: "Érvénytelen elemszám oldalanként (1-100)." });
  }

  const offset = (currentPage - 1) * perfumesPerPage;
  const params = []; // Paraméterek a fő lekérdezéshez
  const conditions = []; // WHERE feltételek
  const havingConditions = []; // HAVING feltételek (árra)

  // JOIN-ok dinamikus hozzáadása
  // Szükséges a brands-hez, notes-hoz és stores-hoz is (ár miatt)
  let joinClause = `
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN stores s ON p.id = s.perfume_id
  `;
  // Csak akkor kell INNER JOIN a notes-ra, ha szűrünk rá
  if (note) {
    joinClause += `
          INNER JOIN perfume_notes pn ON p.id = pn.perfume_id
          INNER JOIN notes n ON pn.note_id = n.id
      `;
  } else {
    // Ha nem szűrünk note-ra, de mégis ki akarjuk listázni őket később, akkor LEFT JOIN kell
    joinClause += `
          LEFT JOIN perfume_notes pn ON p.id = pn.perfume_id
          LEFT JOIN notes n ON pn.note_id = n.id
       `;
  }

  // --- SQL Összeállítása ---
  let sqlBase = `
    FROM perfumes p
    ${joinClause}
    WHERE 1=1
  `;

  // WHERE Feltételek hozzáadása
  if (query) {
    conditions.push("(p.name LIKE ? OR b.name LIKE ?)");
    params.push(`%${query}%`, `%${query}%`);
  }
  if (brand) {
    conditions.push("b.name = ?");
    params.push(brand);
  }
  if (note) {
    conditions.push("n.name = ?");
    params.push(note);
  }
  if (gender) {
    conditions.push("p.gender = ?");
    params.push(gender);
  }

  if (conditions.length > 0) {
    sqlBase += " AND " + conditions.join(" AND ");
  }

  // Teljes SQL a fő lekérdezéshez (SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT)
  let sql = `
    SELECT
      p.*,
      b.name AS brand_name, /* Brand név is kellhet a kártyán */
      MIN(s.price) AS price /* Ár alias */
    ${sqlBase}
    GROUP BY p.id /* Csoportosítás parfümönként az aggregáláshoz (MIN) */
  `;

  // HAVING Feltételek hozzáadása (Árszűrés)
  // Külön kezeljük a paramétereket, mert a HAVING után jönnek a WHERE paraméterei
  const havingParams = [];
  if (min_price && !isNaN(parseFloat(min_price))) {
    havingConditions.push("price >= ?"); // Használjuk a MIN(s.price) aliasát ('price')
    havingParams.push(parseFloat(min_price));
  }
  if (max_price && !isNaN(parseFloat(max_price))) {
    havingConditions.push("price <= ?"); // Használjuk a MIN(s.price) aliasát ('price')
    havingParams.push(parseFloat(max_price));
  }

  if (havingConditions.length > 0) {
    sql += " HAVING " + havingConditions.join(" AND ");
  }

  // Rendezés hozzáadása (ORDER BY)
  switch (sort) {
    case "name-asc":
      sql += " ORDER BY p.name ASC";
      break;
    case "name-desc":
      sql += " ORDER BY p.name DESC";
      break;
    case "price-asc":
      // Ha ár szerint rendezünk, a NULL értékeket a végére tegyük
      sql += " ORDER BY price IS NULL ASC, price ASC";
      break;
    case "price-desc":
      // Ha ár szerint rendezünk, a NULL értékeket a végére tegyük
      sql += " ORDER BY price IS NULL ASC, price DESC";
      break;
    default:
      sql += " ORDER BY p.name ASC"; // Default sort
  }

  // Lapozás hozzáadása (LIMIT, OFFSET)
  // Külön kezeljük a paramétereket, mert a végére kerülnek
  const limitParams = [perfumesPerPage, offset];
  sql += " LIMIT ? OFFSET ?";

  // Összesítjük a paramétereket a helyes sorrendben: WHERE -> HAVING -> LIMIT
  const finalParams = [...params, ...havingParams, ...limitParams];

  // --- COUNT Lekérdezés Összeállítása ---
  // A COUNT lekérdezésnek is tartalmaznia kell a WHERE és HAVING feltételeket,
  // de a LIMIT/OFFSET és ORDER BY nélkül.
  const countSql = `
      SELECT COUNT(*) AS total
      FROM (
          SELECT
              p.id,
              MIN(s.price) AS price /* Alias kell a HAVING miatt */
          ${sqlBase} /* Ugyanaz a FROM, JOIN, WHERE */
          GROUP BY p.id /* Ugyanaz a GROUP BY */
          ${
            havingConditions.length > 0
              ? " HAVING " + havingConditions.join(" AND ")
              : ""
          } /* Ugyanaz a HAVING */
      ) AS subquery
  `;
  // Paraméterek a COUNT lekérdezéshez: csak a WHERE és HAVING paraméterek kellenek
  const countParams = [...params, ...havingParams];

  // --- Naplózás és DB Hívás ---
  console.log("Generált FŐ SQL:", db.format(sql, finalParams)); // Formatálva is kiírjuk a paraméterekkel
  // console.log("FŐ Paraméterek:", finalParams);
  console.log("Generált COUNT SQL:", db.format(countSql, countParams));
  // console.log("COUNT Paraméterek:", countParams);

  // Adatbázis lekérdezések futtatása (Promise.all-lal párhuzamosíthatnánk)
  db.query(sql, finalParams, (err, results) => {
    if (err) {
      console.error("SQL Hiba a parfümök lekérdezésekor:", err);
      // Használjuk a next()-et a központi hibakezelőhöz
      return next(err); // Vagy res.status(500)... de a next jobb
    }

    db.query(countSql, countParams, (countErr, countResults) => {
      if (countErr) {
        console.error("SQL Hiba a darabszám lekérdezésekor:", countErr);
        return next(countErr); // Használjuk a next()-et
      }

      const totalCount = countResults[0]?.total || 0;
      const totalPages = Math.ceil(totalCount / perfumesPerPage);

      res.status(200).json({
        perfumes: results,
        totalPages,
        currentPage: currentPage,
      });
    });
  });
};

// ... (a többi funkció, mint getRandomPerfumes, getPerfumeById stb. változatlan marad) ...

exports.getRandomPerfumes = async (req, res, next) => {
  // next hozzáadása
  const limit = parseInt(req.query.limit, 10) || 5;
  const sql = `
        SELECT
            p.id, p.name, p.image_url, b.name AS brand_name, MIN(s.price) AS price
        FROM perfumes p
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN stores s ON p.id = s.perfume_id
        WHERE s.price IS NOT NULL AND s.price > 0 /* Csak ha van ára */
        GROUP BY p.id
        ORDER BY RAND()
        LIMIT ?
    `;
  try {
    const { queryAsync } = require("../models/User"); // Feltételezve, hogy létezik
    const results = await queryAsync(sql, [limit]);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching random perfumes:", err);
    // Használjuk a next()-et
    next(err);
    // res.status(500).json({ error: "Adatbázis hiba a véletlen parfümök lekérdezésekor." });
  }
};

exports.getFeaturedPerfumes = (req, res, next) => {
  // next hozzáadása
  // Itt feltételezzük, hogy a Perfume modell kezeli ezt
  // Ha direkt SQL-t használsz, akkor a try-catch + next itt is jó lenne
  Perfume.getFeaturedPerfumes((err, results) => {
    if (err) {
      console.error("Error fetching featured perfumes:", err);
      return next(err); // next használata
    }
    res.status(200).json(results);
  });
};

exports.getPerfumeById = (req, res, next) => {
  // next hozzáadása
  const perfumeIdParam = req.params.id;
  const perfumeId = parseInt(perfumeIdParam, 10);

  if (isNaN(perfumeId) || perfumeId <= 0) {
    console.warn(`Invalid perfume ID requested: ${perfumeIdParam}`);
    return res.status(400).json({ error: "Érvénytelen parfüm azonosító." });
  }

  const perfumeSql = `
      SELECT
        p.*,
        b.name AS brand_name,
        GROUP_CONCAT(DISTINCT nt.name SEPARATOR ', ') AS notes /* nt alias a notes táblának */
      FROM perfumes p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN perfume_notes pn ON p.id = pn.perfume_id
      LEFT JOIN notes nt ON pn.note_id = nt.id /* nt alias használata */
      WHERE p.id = ?
      GROUP BY p.id
    `;

  const storesSql = `
      SELECT store_name, url, price, currency
      FROM stores
      WHERE perfume_id = ?
      ORDER BY price ASC
    `;

  db.query(perfumeSql, [perfumeId], (err, perfumeResult) => {
    if (err) {
      console.error("SQL Hiba (parfüm):", err);
      return next(err); // next használata
    }

    if (perfumeResult.length === 0) {
      return res
        .status(404)
        .json({ error: "Parfüm nem található ezzel az azonosítóval!" });
    }

    db.query(storesSql, [perfumeId], (storeErr, storeResult) => {
      if (storeErr) {
        console.error("SQL Hiba (üzletek):", storeErr);
        return next(storeErr); // next használata
      }

      const perfumeData = {
        ...perfumeResult[0],
        notes: perfumeResult[0].notes ? perfumeResult[0].notes.split(", ") : [],
        stores: storeResult || [],
      };

      res.status(200).json(perfumeData);
    });
  });
};

exports.createPerfume = (req, res, next) => {
  // next hozzáadása
  // Ha a Perfume modell async/await-et használ, akkor try-catch + next
  Perfume.createPerfume(req.body, (err, results) => {
    if (err) {
      console.error("Error creating perfume:", err);
      return next(err); // next használata
    }
    res.status(201).json({ id: results.insertId, ...req.body });
  });
};

exports.updatePerfume = (req, res, next) => {
  // next hozzáadása
  // Ha a Perfume modell async/await-et használ, akkor try-catch + next
  Perfume.updatePerfume(req.params.id, req.body, (err, results) => {
    if (err) {
      console.error("Error updating perfume:", err);
      return next(err); // next használata
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Nincs ilyen parfüm!" });
    }
    // Itt is lehetne hibakezelés a getPerfumeById-ra
    Perfume.getPerfumeById(req.params.id, (getErr, getResults) => {
      if (getErr) {
        console.error("Error fetching perfume after update:", getErr);
        return next(getErr); // next használata
      }
      if (getResults.length === 0) {
        // Ez nem valószínű, de jobb ellenőrizni
        return res
          .status(404)
          .json({ error: "Parfüm nem található a frissítés után!" });
      }
      res.status(200).json(getResults[0]);
    });
  });
};

exports.deletePerfume = (req, res, next) => {
  // next hozzáadása
  // Ha a Perfume modell async/await-et használ, akkor try-catch + next
  Perfume.deletePerfume(req.params.id, (err, results) => {
    if (err) {
      console.error("Error deleting perfume:", err);
      return next(err); // next használata
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Nincs ilyen parfüm!" });
    }
    res.status(200).json({ message: "Parfüm sikeresen törölve!" });
  });
};

exports.getPerfumesByIds = async (req, res, next) => {
  // next már használatban van
  const idsString = req.query.ids;
  if (!idsString) {
    return res.status(400).json({ error: "Hiányzó 'ids' query paraméter." });
  }
  const ids = idsString
    .split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id) && id > 0);
  if (ids.length === 0) {
    return res.json([]);
  }

  const sql = `
        SELECT
            p.id, p.name, p.image_url, p.gender, p.description, b.name AS brand_name, MIN(s.price) AS price
        FROM perfumes p
        LEFT JOIN brands b ON p.brand_id = b.id
        LEFT JOIN stores s ON p.id = s.perfume_id
        WHERE p.id IN (?)
        GROUP BY p.id
    `;
  try {
    const { queryAsync } = require("../models/User"); // Feltételezve, hogy létezik
    const results = await queryAsync(sql, [ids]);
    res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching perfumes by IDs:", err);
    next(err); // next használata
  }
};

exports.toggleFavorite = async (req, res, next) => {
  // next hozzáadása
  // Ez a funkció valószínűleg nem a perfumeControllerbe való,
  // hanem inkább egy savedPerfumeControllerbe vagy userControllerbe.
  // De ha itt marad, akkor is használjuk a next-et.
  const { perfume_id } = req.body;
  // Fontos: A user_id-t az authMiddleware-ből kellene venni (req.user.id)
  // const user_id = req.user.id;
  const user_id = 1; // IDEIGLENESEN, amíg az authMiddleware nincs bekötve rendesen ide

  if (!req.user || !req.user.id) {
    // Ellenőrzés, hogy a user be van-e jelentkezve
    return res.status(401).json({ error: "Hitelesítés szükséges." });
  }
  const real_user_id = req.user.id; // Használjuk a middleware által beállított user ID-t

  try {
    // db.query Promise alapú változatát kellene használni itt is (pl. queryAsync)
    const { queryAsync } = require("../models/User"); // Feltételezve, hogy létezik

    const [existing] = await queryAsync(
      // Kell await!
      "SELECT id FROM saved_perfumes WHERE user_id = ? AND perfume_id = ?",
      [real_user_id, perfume_id]
    ); // Csak az id-t kérjük le

    if (existing) {
      // Ellenőrizzük, hogy a lekérdezés adott-e vissza sort
      await queryAsync("DELETE FROM saved_perfumes WHERE id = ?", [
        existing.id,
      ]); // Kell await!
      res.json({ isFavorite: false, message: "Eltávolítva a kedvencekből." });
    } else {
      await queryAsync(
        // Kell await!
        "INSERT INTO saved_perfumes (user_id, perfume_id) VALUES (?, ?)",
        [real_user_id, perfume_id]
      );
      res.json({ isFavorite: true, message: "Hozzáadva a kedvencekhez." });
    }
  } catch (err) {
    console.error("Error toggling favorite:", err);
    next(err); // next használata
  }
};

exports.getPriceRange = async (req, res, next) => {
  // next már használatban van
  const sql = `
        SELECT MIN(s.price) AS minPrice, MAX(s.price) AS maxPrice
        FROM stores s
        WHERE s.price IS NOT NULL AND s.price > 0
    `;
  try {
    const { queryAsync } = require("../models/User"); // Feltételezve, hogy létezik
    const results = await queryAsync(sql);
    if (results && results.length > 0 && results[0].minPrice !== null) {
      res.status(200).json({
        minPrice: Math.floor(results[0].minPrice),
        maxPrice: Math.ceil(results[0].maxPrice),
      });
    } else {
      res.status(200).json({ minPrice: 0, maxPrice: 100000 }); // Default
    }
  } catch (err) {
    console.error("Error fetching price range:", err);
    next(err); // next használata
  }
};
