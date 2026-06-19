import api from '../api/api';

// GET /users?page=1&limit=10&search=&role=vendor&status=active
export const getAllUsers = async (
  page:    number,
  limit:   number,
  search?: string,
  role?:   string,
  status?: string,
) => {
  const params = new URLSearchParams();
  params.set('page',  String(page));
  params.set('limit', String(limit));
  console.log('role', role);
  if (search) params.set('search', search);
  if (role)   params.set('role',   role);
  if (status) params.set('status', status);

  console.log('params', params.toString());

  const response = await api.get(`/users?${params.toString()}`);
  return response.data.data;
};

export const createUser = async (data: any) => {
  const response = await api.post('/users/admin', data);
  return response.data.data;
}

export const updateUser = async (id: number, data: Partial<any>) => {
  const response = await api.patch(`/users/${id}`, data);
  return response.data.data;
};

// These map to status updates via PATCH /users/:id
export const suspendUser = async (id: number) => {
  const response = await api.patch(`/users/${id}`, { status: 'suspended' });
  return response.data.data;
};

export const activateUser = async (id: number) => {
  const response = await api.patch(`/users/${id}`, { status: 'active' });
  return response.data.data;
};

export const resendVerification = async (email: string) => {
  const response = await api.post('/users/resend-verification', { email });
  return response.data.data;
};

export const getUserCounts = async (role?: string) => {
  const params = new URLSearchParams();
  if (role) params.set('role', role);
  const response = await api.get(`/users/counts?${params.toString()}`);
  return response.data.data;
};

