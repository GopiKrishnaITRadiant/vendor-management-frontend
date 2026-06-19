import api from '../api/api';

export const getAllRoles = async () => {
  const response = await api.get('/roles');
  return response.data.data;
};