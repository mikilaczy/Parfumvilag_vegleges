import axios from "axios";

// Összes illatjegy lekérdezése a backendtől
const getAllNotes = async () => {
  try {
    // GET kérés küldése az '/api/notes' végpontra (Figyelem: relatív URL)
    const response = await axios.get("/api/notes");

    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Egy specifikus illatjegy lekérdezése ID alapján
const getNoteById = async (id) => {
  try {
    // GET kérés küldése az '/api/notes/:id' végpontra (Figyelem: relatív URL)
    const response = await axios.get(`/api/notes/${id}`);

    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Új illatjegy létrehozása
// Paraméter: 'note' objektum, amely az új jegy adatait tartalmazza (pl. { name: 'vanília', type: 'alap' })
const createNote = async (note) => {
  try {
    // POST kérés küldése az '/api/notes' végpontra az új jegy adataival (Figyelem: relatív URL)
    const response = await axios.post("/api/notes", note);

    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Meglévő illatjegy frissítése ID alapján
// Paraméterek: 'id' (a frissítendő jegy ID-ja), 'note' (a frissítendő adatok)
const updateNote = async (id, note) => {
  try {
    // PUT kérés küldése az '/api/notes/:id' végpontra a frissítendő adatokkal (Figyelem: relatív URL)
    const response = await axios.put(`/api/notes/${id}`, note);

    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Illatjegy törlése ID alapján
const deleteNote = async (id) => {
  try {
    // DELETE kérés küldése az '/api/notes/:id' végpontra (Figyelem: relatív URL)
    const response = await axios.delete(`/api/notes/${id}`);

    return response.data;
  } catch (error) {
    // Hiba esetén továbbdobja a szerver által küldött hibaadatokat
    throw error.response.data;
  }
};

export { getAllNotes, getNoteById, createNote, updateNote, deleteNote };
