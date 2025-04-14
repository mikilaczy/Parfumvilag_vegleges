import axios from 'axios';

const getAllNotes = async () => {
  try {
    const response = await axios.get('/api/notes');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getNoteById = async (id) => {
  try {
    const response = await axios.get(`/api/notes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const createNote = async (note) => {
  try {
    const response = await axios.post('/api/notes', note);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const updateNote = async (id, note) => {
  try {
    const response = await axios.put(`/api/notes/${id}`, note);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const deleteNote = async (id) => {
  try {
    const response = await axios.delete(`/api/notes/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};



export { getAllNotes, getNoteById, createNote, updateNote, deleteNote };