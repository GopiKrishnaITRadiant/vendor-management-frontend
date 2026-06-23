// src/api/asnApi.ts
// Dummy API — swap the fakeStore + delay() bodies for real fetch() calls when ready.

import type { ASN, ASNItem, ASNStatus } from "../types/asnTypes";

// ─── Request / response shapes ────────────────────────────────────────────────

export interface CreateASNItemPayload {
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
  expiryDate: string | null; // ISO date string
}

export interface CreateASNPayload {
  poNo: string;
  vendorId: number;
  soldTo: string;
  estimatedShipDate: string;      // ISO date string
  estimatedDeliveryDate: string;  // ISO date string
  carrierName: string;
  trackingNumber: string;
  shipmentMode: string | null;
  shipFromAddress: string | null;
  notes: string | null;
  items: CreateASNItemPayload[];
}

export interface SubmitASNResponse {
  asn: ASN;
  message: string;
}

export interface BulkSubmitResult {
  succeeded: string[];
  failed: { asnNumber: string; reason: string }[];
}

// ─── In-memory store ──────────────────────────────────────────────────────────

let nextId = 100;

const fakeStore: ASN[] = [
  {
    id: 1,
    asnNumber: "ASN-2024-0001",
    poNo: "PO-1001",
    vendorId: 42,
    soldTo: "CUST-HYD-01",
    status: "submitted",
    estimatedShipDate: "2024-07-10",
    estimatedDeliveryDate: "2024-07-14",
    actualShipDate: null,
    actualDeliveryDate: null,
    carrierName: "FedEx",
    trackingNumber: "FX987654321",
    shipmentMode: "Air",
    validationErrors: null,
    rejectionReason: null,
    notes: null,
    submittedAt: "2024-07-05T10:00:00Z",
    confirmedAt: null,
    createdAt: "2024-07-05T09:55:00Z",
    updatedAt: "2024-07-05T10:00:00Z",
    shipFromAddress: "Plot 14, Industrial Estate, Pune",
    approvedBy: null,
    totalLines: 2,
    totalQty: 500,
    items: [
      {
        id: 1,
        poNo: "PO-1001",
        poItem: "10",
        matCode: "MAT-001",
        matDesc: "Paracetamol 500mg Tabs",
        ndcCode: "NDC-12345",
        uom: "EA",
        numberOfPackages: 25,
        packageType: "Box",
        grossWeight: "12.50",
        weightUnit: "KG",
        expiryDate: new Date("2026-06-01"),
      },
      {
        id: 2,
        poNo: "PO-1001",
        poItem: "20",
        matCode: "MAT-002",
        matDesc: "Amoxicillin 250mg Caps",
        ndcCode: "NDC-67890",
        uom: "EA",
        numberOfPackages: 10,
        packageType: "Carton",
        grossWeight: "5.00",
        weightUnit: "KG",
        expiryDate: new Date("2025-12-31"),
      },
    ],
  },
  {
    id: 2,
    asnNumber: "ASN-2024-0002",
    poNo: "PO-1002",
    vendorId: 42,
    soldTo: "CUST-MUM-01",
    status: "confirmed",
    estimatedShipDate: "2024-07-12",
    estimatedDeliveryDate: "2024-07-16",
    actualShipDate: "2024-07-12",
    actualDeliveryDate: "2024-07-16",
    carrierName: "DHL",
    trackingNumber: "DHL123456789",
    shipmentMode: "Road",
    validationErrors: null,
    rejectionReason: null,
    notes: "Fragile items — handle with care",
    submittedAt: "2024-07-06T09:30:00Z",
    confirmedAt: "2024-07-06T14:00:00Z",
    createdAt: "2024-07-06T09:00:00Z",
    updatedAt: "2024-07-06T14:00:00Z",
    shipFromAddress: "Survey No. 88, MIDC, Nashik",
    approvedBy: "warehouse.manager@company.com",
    totalLines: 3,
    totalQty: 1200,
    items: [],
  },
  {
    id: 3,
    asnNumber: "ASN-2024-0003",
    poNo: "PO-1003",
    vendorId: 42,
    soldTo: "CUST-DEL-01",
    status: "rejected",
    estimatedShipDate: "2024-07-15",
    estimatedDeliveryDate: "2024-07-20",
    actualShipDate: null,
    actualDeliveryDate: null,
    carrierName: "UPS",
    trackingNumber: "",
    shipmentMode: null,
    validationErrors: "Missing NDC code on item 10",
    rejectionReason: "Incomplete item data — please correct and resubmit.",
    notes: null,
    submittedAt: "2024-07-07T14:00:00Z",
    confirmedAt: null,
    createdAt: "2024-07-07T13:45:00Z",
    updatedAt: "2024-07-08T08:00:00Z",
    shipFromAddress: null,
    approvedBy: null,
    totalLines: 1,
    totalQty: 750,
    items: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const delay = (ms = 650) => new Promise((r) => setTimeout(r, ms));

function generateASNNumber(): string {
  const year = new Date().getFullYear();
  const seq = String(nextId++).padStart(4, "0");
  return `ASN-${year}-${seq}`;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * POST /api/v1/asn
 * Creates and immediately submits an ASN (status → "submitted").
 */
export async function createASN(payload: CreateASNPayload): Promise<ASN> {
  await delay();

  const now = new Date().toISOString();
  const newASN: ASN = {
    id: nextId,
    asnNumber: generateASNNumber(),
    poNo: payload.poNo,
    vendorId: payload.vendorId,
    soldTo: payload.soldTo,
    status: "submitted",
    estimatedShipDate: payload.estimatedShipDate,
    estimatedDeliveryDate: payload.estimatedDeliveryDate,
    actualShipDate: null,
    actualDeliveryDate: null,
    carrierName: payload.carrierName,
    trackingNumber: payload.trackingNumber,
    shipmentMode: payload.shipmentMode,
    validationErrors: null,
    rejectionReason: null,
    notes: payload.notes,
    submittedAt: now,
    confirmedAt: null,
    createdAt: now,
    updatedAt: now,
    shipFromAddress: payload.shipFromAddress,
    approvedBy: null,
    totalLines: payload.items.length,
    totalQty: payload.items.reduce((s, i) => s + i.numberOfPackages, 0),
    items: payload.items.map((item, idx) => ({
      id: idx + 1,
      poNo: item.poNo,
      poItem: item.poItem,
      matCode: item.matCode,
      matDesc: item.matDesc,
      ndcCode: item.ndcCode,
      uom: item.uom,
      numberOfPackages: item.numberOfPackages,
      packageType: item.packageType,
      grossWeight: item.grossWeight,
      weightUnit: item.weightUnit,
      expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
    })),
  };

  fakeStore.push(newASN);
  return newASN;
}

/**
 * GET /api/v1/asn
 * Returns all ASNs for the current vendor, optionally filtered by status.
 */
export async function fetchASNs(status?: ASNStatus): Promise<ASN[]> {
  await delay(400);
  if (status) return fakeStore.filter((a) => a.status === status);
  return [...fakeStore];
}

/**
 * GET /api/v1/asn/:id
 */
export async function fetchASNById(id: number): Promise<ASN> {
  await delay(300);
  const asn = fakeStore.find((a) => a.id === id);
  if (!asn) throw new Error(`ASN #${id} not found.`);
  return { ...asn };
}

/**
 * POST /api/v1/asn/:id/confirm
 * Warehouse confirms a submitted ASN (status → "confirmed").
 * In the vendor portal this is a read-only status transition,
 * but exposed here for completeness / testing.
 */
export async function confirmASN(id: number): Promise<ASN> {
  await delay(600);
  const asn = fakeStore.find((a) => a.id === id);
  if (!asn) throw new Error(`ASN #${id} not found.`);
  if (asn.status !== "submitted")
    throw new Error(`Only submitted ASNs can be confirmed. Current: ${asn.status}`);

  asn.status = "confirmed";
  asn.confirmedAt = new Date().toISOString();
  asn.updatedAt = new Date().toISOString();
  return { ...asn };
}

/**
 * POST /api/v1/asn/:id/reject
 * Warehouse rejects a submitted ASN (status → "rejected").
 */
export async function rejectASN(id: number, reason: string): Promise<ASN> {
  await delay(600);
  const asn = fakeStore.find((a) => a.id === id);
  if (!asn) throw new Error(`ASN #${id} not found.`);
  if (asn.status !== "submitted")
    throw new Error(`Only submitted ASNs can be rejected. Current: ${asn.status}`);

  asn.status = "rejected";
  asn.rejectionReason = reason;
  asn.updatedAt = new Date().toISOString();
  return { ...asn };
}