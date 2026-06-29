import { apiFetch } from "../api/client";

export const getAllRoles = async () => {
  const res = await apiFetch("/roles");

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.message ?? "Failed to fetch roles",
    );
  }

  return data.data;
};