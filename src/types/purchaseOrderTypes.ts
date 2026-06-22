export type PurchaseOrder = {
  id: number;
  poNo: string;
  poItem: string;
  matCode: string;
  matDesc: string;
  actQty: number;
  ndcCode: string;
  vendorNo: string;
  soldTo: string;

  incoterm1: string | null;
  incoterm2: string | null;
  loadingGroup: string | null;
  loekz: string | null;
  poType: string | null;

  odpoQuan: number;
  sourceFileName: string;

  createdAt: string;
  updatedAt: string;

  batch: string | null;
  status: string;
};