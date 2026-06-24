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
  uom?: string;
};


export type StatusTab = PurchaseOrder["status"] | "All";

export interface Stats {
  totalPOLines: number;
  open:         number;
  inProgress:   number;
  completed:    number;
}

export interface POGroup {
  poNo:      string;
  vendorNo:  string;
  poType:    string | null;
  soldTo:    string;
  status:    PurchaseOrder["status"];
  lineCount: number;
  totalQty:  number;
  updatedAt: string;
  lineItems: PurchaseOrder[];
}