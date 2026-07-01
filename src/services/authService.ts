import { apiFetch } from "../api/client";

export const forgotPassword = async (email:string) => {
  const res = await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to forgot password");
  }
  return data.data;
};

export const resetPassword = async (payload: { token: string; newPassword: string }) => {
  const res = await apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message ?? "Failed to reset password");
  }
  return data.data;
};
