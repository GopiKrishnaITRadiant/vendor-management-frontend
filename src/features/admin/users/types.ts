import type { UserStatus } from "../../../types/sharedTypes";

export type Role = {
  id: number;
  name: string;
  description: string | null;
};

export type AppUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  sapVendorId: string | null;
  status: UserStatus;
  isEmailVerified: boolean;
  isFirstLoginVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export type EditableUserFields = {
  firstName: string;
  lastName: string;
  email: string;
  roleId: number | null;
  status: UserStatus;
  password?: string;
};