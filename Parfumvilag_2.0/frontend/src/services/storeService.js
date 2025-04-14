import axios from 'axios';

const getAllStores = async () => {
  try {
    const response = await axios.get('/api/stores');
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const getStoreById = async (id) => {
  try {
    const response = await axios.get(`/api/stores/${id}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const createStore = async (store) => {
  try {
    const response = await axios.post('/api/stores', store, {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const updateStore = async (id, store) => {
  try {
    const response = await axios.put(`/api/stores/${id}`, store, {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

const deleteStore = async (id) => {
  try {
    const response = await axios.delete(`/api/stores/${id}`, {
      headers: {
        'x-auth-token': localStorage.getItem('token')
      }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export { getAllStores, getStoreById, createStore, updateStore, deleteStore };