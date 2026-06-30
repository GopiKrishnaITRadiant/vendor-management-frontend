import type { UserStatus } from "../../../types/sharedTypes";

export type Vendor = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: UserStatus;
  isEmailVerified: boolean;
  isFirstLoginVerified: boolean;
  sapVendorId: string | null;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EditableVendorFields = any;