// services/dashboardService.ts
import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

export const getAdminDashboard = async () => {
  const response = await axios.get(
    `${API_URL}/dashboard/admin`
  );
  console.log('rets',response.data);
  return response.data.data;
};

export const getPOSummary = async () => {
  const response = await axios.get(
    `${API_URL}/dashboard/admin/po-summary`
  );

  return response.data;
};