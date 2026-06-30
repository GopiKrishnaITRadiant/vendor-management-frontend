export type ASNStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "rejected"
  | "shipped"
  | "delivered"
  | "cancelled";

export type ASNItem = {
  id:               number;
  poNo:             string;
  poItem:           string;
  matCode:          string;
  matDesc:          string;
  ndcCode:          string;
  uom:              string;
  originalQty:       number;
  submittedQty:     number;
  deliverableQty:   number;
  batchNo:          string;
  manufactureDate:  Date | null;
  numberOfPackages: number;
  packageType:      string;
  grossWeight:      string | null;
  weightUnit:       string;
  expiryDate:       Date | null;
  upsWarehouseId:   string;
};

export type ASN = {
  id:                    number;
  asnNumber:             string;
  poNo:                  string;
  vendorId:              number;
  soldTo:                string;
  status:                ASNStatus;
  estimatedShipDate:     string;
  estimatedDeliveryDate: string;
  actualShipDate:        string | null;
  actualDeliveryDate:    string | null;
  carrierName:           string;
  trackingNumber:        string;
  shipmentMode:          string | null;
  validationErrors:      { field: string; message: string }[] | null;
  rejectionReason:       string | null;
  notes:                 string | null;
  submittedAt:           string | null;
  confirmedAt:           string | null;
  createdAt:             string;
  updatedAt:             string;
  shipFromAddress:       any | null;
  items:                 ASNItem[];
};

export type AsnDocumentType = "H" | "I";

export type WarehouseType = "SD60" | "SD61";

// ─── CreateAsnItemDto (mirrors backend DTO) ───────────────────────────────────

export type CreateAsnItemDto = {
  poNo: string;
  poItem: string;
  deliveryLine?: string;
  deliverableQty: number;
  uom?: string;
  upsWarehouseId?: string;
  batchNo?: string;
  manufactureDate?: string;   // ISO date string
  expiryDate?: string;        // ISO date string
  numberOfPackages?: number;
  packageType?: string;
  grossWeight?: number;
  weightUnit?: string;
};

// ─── CreateAsnDto (mirrors backend DTO) ──────────────────────────────────────

export type CreateAsnDto = {
  poNo: string;
  documentType?: AsnDocumentType;
  warehouseType: WarehouseType;
  shipFromAddressId?: number;
  estimatedShipDate: string;        // required
  estimatedDeliveryDate?: string;
  carrierName?: string;
  trackingNumber?: string;
  shipmentMode?: "ROAD" | "AIR" | "SEA" | "RAIL";
  notes?: string;
  items: CreateAsnItemDto[];
};

export type StatusCounts = {
  total:       number;
  pending:     number;  // submitted + confirmed
  approved:    number;  // confirmed + shipped + delivered
  rejected:    number;
};