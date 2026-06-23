// services/purchaseOrderService.ts

import { apiFetch } from "../api/client";

// GET /purchase-orders?page=1&limit=10&search=&vendorNo=&status=
export const getPurchaseOrders = async (
  page: number,
  limit: number,
  search?: string,
  vendorNo?: string,
  status?: string,
) => {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (search) params.set("search", search);
  if (vendorNo) params.set("vendorNo", vendorNo);
  if (status) params.set("status", status);

  const res = await apiFetch(
    `/purchase-orders?${params.toString()}`
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch purchase orders");
  }

  return data.data;
};

// GET /dashboard/admin/po-summary
export const getPurchaseOrderSummary = async (
  vendorNo?: string,
) => {
  const params = new URLSearchParams();

  if (vendorNo) {
    params.set("vendorNo", vendorNo);
  }

  const query = params.toString();

  const res = await apiFetch(
    `/dashboard/admin/po-summary${query ? `?${query}` : ""}`
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.message ?? "Failed to fetch PO summary",
    );
  }

  return data.data;
};

//GET /dashboard/vendor/po-summary
export const getVendorPurchaseOrderSummary = async (vendorNo?: string) => {
  const res = await apiFetch(
    "/dashboard/vendor/po-summary"
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.message ?? "Failed to fetch PO summary",
    );
  }

  return data.data;
};

// GET /purchase-orders/stats
export const getPurchaseOrderStats = async () => {
  const res = await apiFetch(
    "/purchase-orders/stats"
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.message ?? "Failed to fetch PO stats",
    );
  }

  return data.data;
};