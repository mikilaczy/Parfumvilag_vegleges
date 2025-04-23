import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Összes parfüm lekérdezése szűrési, rendezési és lapozási paraméterekkel
export const getAllPerfumes = async ({
  query = "", // Keresőkifejezés (név, márka, leírás)
  brand = "", // Márka ID vagy név szűréshez
  note = "", // Illatjegy ID vagy név szűréshez
  gender = "", // Nem (male, female, unisex) szűréshez
  sort = "name-asc", // Rendezési szempont (pl. 'name-asc', 'price-desc')
  min_price, // Minimális ár szűréshez
  max_price, // Maximális ár szűréshez
  page = 1, // Jelenlegi oldalszám
  per_page = 24, // Oldalankénti elemek száma
}) => {
  try {
    // GET kérés küldése az '/perfumes/all' végpontra a megadott paraméterekkel
    const response = await axios.get(`${API_BASE_URL}/perfumes/all`, {
      params: {
        // Paraméterek átadása a query stringben
        query,
        brand,
        note,
        gender,
        sort,
        min_price,
        max_price,
        page,
        per_page,
      },
    });
    // Visszaadja a kapott adatokat (parfümök listája, összes oldalszám stb.)
    return response.data;
  } catch (error) {
    // Hiba kezelése: logolás és specifikus vagy általános hibaüzenet továbbdobása
    const errorMessage =
      error.response?.data?.error ||
      "Nem sikerült betölteni a parfümök listáját!";
    console.error("Hiba a getAllPerfumes-ben:", errorMessage);
    throw new Error(errorMessage);
  }
};

// Véletlenszerű parfümök lekérdezése adott limitált számban
export const getRandomPerfumes = async (limit = 5) => {
  // Alapértelmezett limit: 5
  try {
    // GET kérés küldése a '/perfumes/random' végpontra a limit paraméterrel
    const response = await axios.get(`${API_BASE_URL}/perfumes/random`, {
      params: { limit },
    });
    // Visszaadja a kapott véletlenszerű parfümök listáját
    return response.data;
  } catch (error) {
    // Hiba kezelése: logolás és általános hibaüzenet továbbdobása
    console.error(
      "Error fetching random perfumes:",
      error.response?.data || error.message
    );
    throw new Error("Nem sikerült betölteni a véletlen parfümöket.");
  }
};

// Kiemelt parfümök lekérdezése (a backend logikája dönti el, mik ezek)
export const getFeaturedPerfumes = async () => {
  try {
    // GET kérés küldése a '/perfumes/featured' végpontra
    const response = await axios.get(`${API_BASE_URL}/perfumes/featured`);
    console.log("API válasz (getFeaturedPerfumes):", response.data); // Fejlesztési célú logolás
    // Visszaadja a kapott kiemelt parfümök listáját
    return response.data;
  } catch (error) {
    // Hiba kezelése: logolás és specifikus vagy általános hibaüzenet továbbdobása
    const errorMessage =
      error.response?.data?.error ||
      "Nem sikerült betölteni a kiemelt parfümök listáját!";
    console.error("Hiba a getFeaturedPerfumes-ben:", errorMessage);
    throw new Error(errorMessage);
  }
};

// Egy specifikus parfüm részletes adatainak lekérdezése ID alapján
export const getPerfumeById = async (id) => {
  try {
    // GET kérés küldése a '/perfumes/:id' végpontra
    const response = await axios.get(`${API_BASE_URL}/perfumes/${id}`);
    console.log("API válasz (getPerfumeById):", response.data); // Fejlesztési célú logolás
    // Visszaadja a kapott parfüm részletes adatait
    return response.data;
  } catch (error) {
    // Hiba kezelése: logolás és specifikus vagy általános hibaüzenet továbbdobása
    const errorMessage = error.response?.data?.error || "Parfüm nem található!";
    console.error("Hiba a getPerfumeById-ben:", errorMessage);
    throw new Error(errorMessage);
  }
};

// Kedvenc állapot váltása (hozzáadás/eltávolítás) egy parfümhöz
// Figyelem: Ez a függvény feltételezi, hogy a tokent a localStorage-ban tároljuk és direktben használja.
// Jobb megoldás lehet egy interceptor vagy a token központi kezelése.
export const toggleFavorite = async (perfumeId) => {
  try {
    // POST kérés küldése a '/api/favorites/toggle' végpontra (Figyelem: relatív URL és eltérő logika)
    // Az Authorization fejlécben küldi a Bearer tokent
    const response = await axios.post(
      "/api/favorites/toggle", // Eltérő végpont, lehet, hogy a savedPerfumeService-be tartozna?
      { perfume_id: perfumeId },
      {
        headers: {
          // Token közvetlen beillesztése a localStorage-ból - nem a legjobb gyakorlat
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    // Visszaadja a szerver válaszát (pl. sikerüzenet, új állapot)
    return response.data;
  } catch (error) {
    // Hiba esetén továbbdobja a szerver által küldött hibaadatokat
    throw error.response.data;
  }
};

// Minimális és maximális ár lekérdezése az adatbázisban lévő parfümök alapján (szűréshez)
export const getPriceRange = async () => {
  try {
    // GET kérés küldése a '/perfumes/price-range' végpontra
    const response = await axios.get(`${API_BASE_URL}/perfumes/price-range`);
    // Visszaadja az árintervallumot: { minPrice: number, maxPrice: number }
    return response.data;
  } catch (error) {
    console.error("Error fetching price range:", error); // Hiba logolása

    return { minPrice: 0, maxPrice: 100000 };
  }
};
