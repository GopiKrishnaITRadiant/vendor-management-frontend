import { apiFetch } from "../api/client";

// GET /users?page=1&limit=10&search=&role=&status=
export const getAllUsers = async (
  page: number,
  limit: number,
  search?: string,
  role?: string,
  status?: string,
) => {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (search) params.set("search", search);
  if (role) params.set("role", role);
  if (status) params.set("status", status);

  const res = await apiFetch(`/users?${params.toString()}`);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch users");
  }

  return data.data;
};

export const createUser = async (payload: any) => {
  const res = await apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to create user");
  }

  return data.data;
};

export const updateUser = async (id: number, payload: Partial<any>) => {
  const res = await apiFetch(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to update user");
  }

  return data.data;
};

export const changePassword = async (
  id: number,
  payload: {
    currentPassword: string;
    newPassword: string;
  },
) => {
  const res = await apiFetch(`/users/${id}/password`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to change password");
  }

  return data.data;
};

export const suspendUser = async (id: number) => {
  return updateUser(id, {
    status: "suspended",
  });
};

export const activateUser = async (id: number) => {
  return updateUser(id, {
    status: "active",
  });
};

export const resendVerification = async (email: string) => {
  const res = await apiFetch("/users/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to resend verification email");
  }

  return data.data;
};

export const getUserCounts = async (role?: string) => {
  const params = new URLSearchParams();

  if (role) {
    params.set("role", role);
  }

  const query = params.toString();

  const res = await apiFetch(`/users/counts${query ? `?${query}` : ""}`);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to fetch user counts");
  }

  return data.data;
};

export const setupVendor = async (
  id: number,
  payload: {
    email: string;
    password: string;
  },
) => {
  const res = await apiFetch(`/users/${id}/setup-vendor`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to setup vendor");
  }

  return data.data;
};

export interface UpdateTwoFactorResponse {
  isTwoFactorEnabled: boolean;
}

export const updateTwoFactor = async (
  enabled: boolean,
): Promise<UpdateTwoFactorResponse> => {
  const res = await apiFetch("/auth/2fa", {
    method: "PATCH",
    body: JSON.stringify({ enabled }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to update two-factor settings");
  }

  return data.data;
};
