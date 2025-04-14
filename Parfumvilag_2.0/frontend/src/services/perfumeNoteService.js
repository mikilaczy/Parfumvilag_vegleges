import axios from 'axios';

const getAllPerfumeNotes = async () => {
  try {
    const response = await axios.get('/api/perfume-notes');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getPerfumeNoteById = async (id) => {
  try {
    const response = await axios.get(`/api/perfume-notes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const createPerfumeNote = async (perfumeNote) => {
  try {
    const response = await axios.post('/api/perfume-notes', perfumeNote);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const updatePerfumeNote = async (id, perfumeNote) => {
  try {
    const response = await axios.put(`/api/perfume-notes/${id}`, perfumeNote);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const deletePerfumeNote = async (id) => {
  try {
    const response = await axios.delete(`/api/perfume-notes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export { getAllPerfumeNotes, getPerfumeNoteById, createPerfumeNote, updatePerfumeNote, deletePerfumeNote };