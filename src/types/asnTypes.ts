export type ASNStatus =
  | "submitted"
  | "confirmed"
  | "rejected";

export type ASNItem = {
  id: number;
  poNo: string;
  poItem: string;
  matCode: string;
  matDesc: string;
  ndcCode: string;
  uom: string;
  numberOfPackages: number;
  packageType: string;
  grossWeight: string;
  weightUnit: string;
  expiryDate: Date| null;
};

export type ASN = {
  id: number;
  asnNumber: string;
  poNo: string;
  vendorId: number;
  soldTo: string;
  status: ASNStatus;

  estimatedShipDate: string;
  estimatedDeliveryDate: string;

  actualShipDate: string | null;
  actualDeliveryDate: string | null;

  carrierName: string;
  trackingNumber: string;

  shipmentMode: string | null;
  validationErrors: string | null;
  rejectionReason: string | null;
  notes: string | null;

  submittedAt: string;
  confirmedAt: string | null;

  createdAt: string;
  updatedAt: string;

  shipFromAddress: string | null;

  items: ASNItem[];

  approvedBy: string | null;
  totalLines: number;
  totalQty: number;

};