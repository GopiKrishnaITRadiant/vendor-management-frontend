import { apiFetch } from "../api/client";

export const getAdminDashboard = async () => {
  const res = await apiFetch("/dashboard/admin");

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.message ?? "Failed to fetch admin dashboard",
    );
  }

  return data.data;
};

export const getPOSummary = async () => {
  const res = await apiFetch(
    "/dashboard/admin/po-summary",
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.message ?? "Failed to fetch PO summary",
    );
  }

  return data.data;
};

export const getVendorDashboard = async (
  period: string,
) => {
  const params = new URLSearchParams();

  if (period) {
    params.set("period", period);
  }

  const res = await apiFetch(
    `/dashboard/vendor?${params.toString()}`
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.message ?? "Failed to fetch vendor dashboard",
    );
  }

  return data.data;
};