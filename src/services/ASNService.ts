import api from "../api/api";

// GET /asns?page=1&limit=10&search=ASN-2026&status=submitted
export const getAllASNs = async (
  page:    number,
  limit:   number,
  search?: string,
  status?: string,
) => {
  const params = new URLSearchParams();
  params.set('page',  String(page));
  params.set('limit', String(limit));
  if (search) params.set('search', search);
  if (status) params.set('status', status);

  const response = await api.get(`/asns?${params.toString()}`);
  return response.data.data;
};

// POST /asns/:id/confirm
export const approveASN = async (id: number) => {
  const response = await api.post(`/asns/${id}/confirm`);
  return response.data.data;
};

// POST /asns/:id/reject
export const rejectASN = async (id: number, reason: string) => {
  const response = await api.post(`/asns/${id}/reject`, { reason });
  return response.data.data;
};

// GET /asns/counts  — for KPI cards
export const getASNStatusCounts = async () => {
  const response = await api.get('/asns/counts');
  return response.data.data;
};