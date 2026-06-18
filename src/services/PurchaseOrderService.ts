// services/purchaseOrderService.ts

import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

export const getPurchaseOrders = async (page:number, limit:number, search?:string) => {
  const response = await axios.get(
    `${API_URL}/purchase-orders?page=${page}&limit=${limit}&search=${search}`
  );
  console.log('purchase orders',response.data.data);
  return response.data.data
};

export const getPurchaseOrderStats = async () => {
  const response = await axios.get(
    `${API_URL}/purchase-orders/stats`
  );

  return response.data;
};

export const cancelPurchaseOrder = async (
  id: number
) => {
  return axios.delete(
    `${API_URL}/purchase-orders/${id}`
  );
};