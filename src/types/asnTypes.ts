export type ASNStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "rejected"
  // | "shipped"
  // | "delivered"
  // | "cancelled";

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
  estimatedShipDate:     string | null;
  estimatedDeliveryDate: string | null;
  actualShipDate:        string | null;
  actualDeliveryDate:    string | null;
  carrierName:           string | null;
  trackingNumber:        string | null;
  shipmentMode:          string | null;
  validationErrors:      any | null;
  rejectionReason:       string | null;
  notes:                 string | null;
  submittedAt:           string | null;
  confirmedAt:           string | null;
  createdAt:             string;
  updatedAt:             string;
  shipFromAddress:       any | null;
  items:                 ASNItem[];
  approvedBy:            any | null;
  totalLines:            number;
  totalQty:              number;
};

export type AsnStatus =
  | "draft"
  | "submitted"
  | "confirmed"
  | "rejected"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "approved";

export type AsnDocumentType = "H" | "I";

export type WarehouseType = "SD60" | "SD61";

// ─── AsnItem (mirrors asn-item.entity.ts) ─────────────────────────────────────

export type AsnItem = {
  id: number;
  asnId: number;

  deliveryLine: string | null;
  deliveryItemNo: string | null;

  poNo: string;
  poItem: string;

  matCode: string | null;
  matDesc: string | null;
  ndcCode: string | null;

  originalQty: number;
  deliverableQty: number;
  uom: string | null;

  upsWarehouseId: string | null;

  batchNo: string | null;
  manufactureDate: string | null;   // ISO date string (type: 'date')
  expiryDate: string | null;        // ISO date string

  numberOfPackages: number | null;
  packageType: string | null;
  grossWeight: number | null;
  weightUnit: string | null;
  
  createdAt: string;
};

// ─── Asn (mirrors asn.entity.ts) ──────────────────────────────────────────────

export type Asn = {
  id: number;
  asnNumber: string;

  documentType: AsnDocumentType;
  poNo: string;
  vendorId: number;

  shipFromAddressId: number | null;
  shipFromAddress: {
    id: number;
    addressLine1: string;
    city: string;
    state: string;
    country: string;
  } | null;

  soldTo: string | null;
  shipToDescription: string | null;
  incoterm: string | null;

  warehouseType: WarehouseType | null;
  upsWarehouseId: string | null;

  totalQuantity: number;
  status: AsnStatus;

  estimatedShipDate: string | null;
  estimatedDeliveryDate: string | null;
  actualShipDate: string | null;
  actualDeliveryDate: string | null;

  carrierName: string | null;
  trackingNumber: string | null;
  shipmentMode: string | null;

  validationErrors: { field: string; message: string }[] | null;

  submittedAt: string | null;
  confirmedAt: string | null;
  rejectionReason: string | null;
  notes: string | null;

  items: AsnItem[];

  createdAt: string;
  updatedAt: string;
};

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