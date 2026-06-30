export const STATUS_STYLE: Record<string, string> = {
  active: "bg-blue-50 text-blue-700",
  deleted: "bg-red-50 text-red-700",
  "ASN Created": "bg-amber-50 text-amber-700",
  "In Progress": "bg-purple-50 text-purple-700",
  Completed: "bg-green-50 text-green-700",
};

export const PURCHASE_ORDER_STATS_CARDS = [
  {
    label: "Total PO Lines",
    key: "totalPOLines",
  },
  {
    label: "Open",
    key: "open",
  },
  {
    label: "In Progress",
    key: "inProgress",
  },
  {
    label: "Completed",
    key: "completed",
  },
] as const;