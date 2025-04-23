import axios from "axios";

// Összes bolti ajánlat lekérdezése (minden parfüm minden boltban)
const getAllStores = async () => {
  try {
    // GET kérés küldése az '/api/stores' végpontra (Figyelem: relatív URL)
    const response = await axios.get("/api/stores");
    // Sikeres válasz esetén visszaadja a kapott adatokat (bolti ajánlatok listája)
    return response.data;
  } catch (error) {
    // Hiba esetén továbbdobja a szerver által küldött hibaadatokat
    throw error.response.data;
  }
};

// Egy specifikus bolti ajánlat lekérdezése az ajánlat saját ID-ja alapján
const getStoreById = async (id) => {
  try {
    // GET kérés küldése az '/api/stores/:id' végpontra (Figyelem: relatív URL)
    const response = await axios.get(`/api/stores/${id}`);

    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Új bolti ajánlat létrehozása (pl. parfüm hozzáadása egy bolthoz árral, URL-lel)
// Paraméter: 'store' objektum, amely az új ajánlat adatait tartalmazza (pl. { perfume_id: 1, store_name: 'Notino', price: 15000, url: '...' })
// Figyelem: Ez a függvény közvetlenül a localStorage-ból veszi a tokent. Jobb lenne központi token kezelést használni.
const createStore = async (store) => {
  try {
    // POST kérés küldése az '/api/stores' végpontra az új ajánlat adataival és a hitelesítési token-nel (Figyelem: relatív URL)
    const response = await axios.post("/api/stores", store, {
      headers: {
        // Token közvetlen beillesztése a localStorage-ból 'x-auth-token' fejlécben
        "x-auth-token": localStorage.getItem("token"),
      },
    });

    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Meglévő bolti ajánlat frissítése ID alapján
// Paraméterek: 'id' (a frissítendő ajánlat ID-ja), 'store' (a frissítendő adatok)
// Figyelem: Ez a függvény is közvetlenül a localStorage-ból veszi a tokent.
const updateStore = async (id, store) => {
  try {
    // PUT kérés küldése az '/api/stores/:id' végpontra a frissítendő adatokkal és a token-nel (Figyelem: relatív URL)
    const response = await axios.put(`/api/stores/${id}`, store, {
      headers: {
        // Token közvetlen beillesztése a localStorage-ból
        "x-auth-token": localStorage.getItem("token"),
      },
    });

    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Bolti ajánlat törlése ID alapján
// Figyelem: Ez a függvény is közvetlenül a localStorage-ból veszi a tokent.
const deleteStore = async (id) => {
  try {
    // DELETE kérés küldése az '/api/stores/:id' végpontra a token-nel (Figyelem: relatív URL)
    const response = await axios.delete(`/api/stores/${id}`, {
      headers: {
        // Token közvetlen beillesztése a localStorage-ból
        "x-auth-token": localStorage.getItem("token"),
      },
    });

    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export { getAllStores, getStoreById, createStore, updateStore, deleteStore };
