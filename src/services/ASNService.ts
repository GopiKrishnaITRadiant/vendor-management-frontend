// services/asnService.ts

import { apiFetch } from "../api/client";

// GET /asns?page=1&limit=10&search=ASN-2026&status=submitted
export const getAllASNs = async (
  page: number,
  limit: number,
  vendorNo?: string,
  search?: string,
  status?: string,
  isAdmin?: boolean,
) => {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (vendorNo) params.set("vendorNo", vendorNo);
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (isAdmin) params.set("isAdmin", String(isAdmin));

  const res = await apiFetch(`/asns?${params.toString()}`);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch ASNs");
  }

  return data.data;
};

export const getAllAdminASNs = async (
  page: number,
  limit: number,
  vendorNo?: string,
  search?: string,
  status?: string,
) => {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (vendorNo) params.set("vendorNo", vendorNo);
  if (search) params.set("search", search);
  if (status) params.set("status", status);

  const res = await apiFetch(`/asns/admin?${params.toString()}`);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch ASNs");
  }

  return data.data;
};

export const createASN = async (payload: any) => {
  const res = await apiFetch("/asns", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to create ASN");
  }

  return data.data;
};

export const submitASN = async (id: number) => {
  const res = await apiFetch(`/asns/${id}/submit`, {
    method: "POST",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to submit ASN");
  }

  return data.data;
};

// POST /asns/:id/confirm
export const approveASN = async (id: number) => {
  const res = await apiFetch(`/asns/${id}/confirm`, {
    method: "POST",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to approve ASN");
  }

  return data.data;
};

// POST /asns/:id/reject
export const rejectASN = async (id: number, reason: string) => {
  const res = await apiFetch(`/asns/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to reject ASN");
  }

  return data.data;
};

// GET /asns/counts
export const getASNStatusCounts = async () => {
  const res = await apiFetch("/asns/counts");

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch ASN counts");
  }

  return data.data;
};
