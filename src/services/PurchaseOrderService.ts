// services/purchaseOrderService.ts
import api from "../api/api";

// GET /purchase-orders?page=1&limit=10&search=&vendorNo=&status=
export const getPurchaseOrders = async (
  page:      number,
  limit:     number,
  search?:   string,
  vendorNo?: string,
  status?:   string,
) => {
  const params = new URLSearchParams();
  params.set("page",  String(page));
  params.set("limit", String(limit));
  if (search)   params.set("search",   search);
  if (vendorNo) params.set("vendorNo", vendorNo);
  if (status)   params.set("status",   status);

  const response = await api.get(`/purchase-orders?${params.toString()}`);
  // Backend returns: { data: PurchaseOrder[], total, page, limit, totalPages }
  return response.data.data;
};

// GET /dashboard/admin/po-summary  (or /dashboard/vendor/po-summary)
// Returns: { totalPOLines, open, inProgress, asnCreated, completed }
export const getPurchaseOrderSummary = async (vendorNo?: string) => {
  const params = new URLSearchParams();
  if (vendorNo) params.set("vendorNo", vendorNo);

  const response = await api.get(`/dashboard/admin/po-summary?${params.toString()}`);
  return response.data.data;
};

export const getPurchaseOrderStats = async () => {
  const response = await api.get(
    `/purchase-orders/stats`
  );

  return response.data;
};

export const cancelPurchaseOrder = async (
  id: number
) => {
  return api.delete(
    `/purchase-orders/${id}`
  );
};