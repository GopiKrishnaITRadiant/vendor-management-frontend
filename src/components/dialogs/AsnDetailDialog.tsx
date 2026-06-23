import type { ASN, ASNStatus } from "../../types/asnTypes";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";

const STATUS_STYLE: Record<
  ASNStatus,
  { badge: string; icon: string; dot: string }
> = {
  draft: {
    badge: "bg-gray-50 text-gray-700 border border-gray-200",
    icon: "pi pi-file",
    dot: "bg-gray-400",
  },
  confirmed: {
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: "pi pi-clock",
    dot: "bg-amber-400",
  },
  submitted: {
    badge: "bg-green-50 text-green-700 border border-green-200",
    icon: "pi pi-check-circle",
    dot: "bg-green-500",
  },
  rejected: {
    badge: "bg-red-50 text-red-700 border border-red-200",
    icon: "pi pi-times-circle",
    dot: "bg-red-500",
  },
};

export function StatusBadge({ status }: { status: ASNStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.badge}`}
    >
      <i className={`${s.icon} text-xs`} />
      {status}
    </span>
  );
}

export function ASNDetailDialog({
  asn,
  visible,
  onHide,
  onSubmitDraft,
}: {
  asn: ASN | null;
  visible: boolean;
  onHide: () => void;
  onSubmitDraft?: (asnId: number) => Promise<void>;
}) {
  console.log("asn", asn);
  if (!asn) return null;
  const s = STATUS_STYLE[asn.status];

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${STATUS_STYLE[asn.status].badge}`}
          >
            <i className={`${s.icon} text-base`} />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">
              {asn.asnNumber}
            </p>
            <p className="text-xs text-muted-foreground font-normal">
              Submitted {asn.submittedAt}
            </p>
          </div>
        </div>
      }
      visible={visible}
      onHide={onHide}
      style={{ width: "700px" }}
      modal
      className="asn-detail-dialog"
    >
      <div className="space-y-5 pt-1">
        {/* Status banner */}
        {asn.status === "draft" && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <i className="pi pi-pencil text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-700">Draft ASN</p>
              <p className="text-sm text-yellow-600">
                This ASN has not been submitted yet.
              </p>
            </div>
          </div>
        )}
        {asn.status === "rejected" && asn.rejectionReason && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
            <i className="pi pi-times-circle text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                Rejection Reason
              </p>
              <p className="text-sm text-red-600 mt-0.5">
                {asn.rejectionReason}
              </p>
            </div>
          </div>
        )}
        {asn.status === "confirmed" && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
            <i className="pi pi-check-circle text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-700">Approved</p>
              <p className="text-sm text-green-600 mt-0.5">
                Approved by {asn.approvedBy} · {asn.updatedAt}
              </p>
            </div>
          </div>
        )}
        {asn.status === "submitted" && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <i className="pi pi-search text-blue-500 mt-0.5" />
            <p className="text-sm text-blue-700">
              This ASN is currently being reviewed by the Cipla procurement
              team.
            </p>
          </div>
        )}

        {/* Shipment info grid */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Shipment Details
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 text-sm">
            {[
              { label: "ASN Number", value: asn.asnNumber },
              { label: "PO Number(s)", value: asn.poNo },
              { label: "Status", value: <StatusBadge status={asn.status} /> },
              { label: "actualShipDate", value: asn.actualShipDate || "—" },
              //   { label: "Carrier",       value: asn.carrier },
              { label: "Tracking #", value: asn.trackingNumber || "—" },
              { label: "Ship To", value: asn.soldTo || "—" },
              { label: "Submitted At", value: asn.submittedAt },
              { label: "Last Updated", value: asn.updatedAt },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-xs text-muted-foreground mb-1">{f.label}</p>
                {typeof f.value === "string" ? (
                  <p className="font-medium text-foreground">{f.value}</p>
                ) : (
                  f.value
                )}
              </div>
            ))}
          </div>
        </div>

        <Divider className="!my-1" />

        {/* Line items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Line Items ({asn.totalLines})
            </p>
            <p className="text-xs text-muted-foreground">
              Total:{" "}
              <span className="font-semibold text-foreground">
                {asn.totalQty?.toLocaleString()} units
              </span>
            </p>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
              <div className="col-span-1">#</div>
              <div className="col-span-2">PO / Code</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-1 text-right">PO Qty</div>
              <div className="col-span-1 text-right">Ship Qty</div>
              <div className="col-span-2">Batch No.</div>
              <div className="col-span-2">Expiry</div>
            </div>

            {/* Rows */}
            {asn?.items?.map((line, i) => (
              <div
                key={line.id}
                className={`grid grid-cols-12 gap-2 px-4 py-3 text-sm items-center ${
                  i < asn.items.length - 1 ? "border-b border-border" : ""
                } ${i % 2 === 1 ? "bg-muted/20" : ""}`}
              >
                <div className="col-span-1 text-muted-foreground text-xs">
                  {i + 1}
                </div>
                <div className="col-span-2">
                  <p className="font-medium text-foreground text-xs">
                    {line.poNo}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {line.matCode}
                  </p>
                </div>
                <div className="col-span-3 text-foreground text-xs leading-tight">
                  {line.matDesc}
                </div>
                <div className="col-span-1 text-right text-foreground">
                  {line.uom.toLocaleString()}
                </div>
                <div className="col-span-1 text-right font-medium text-foreground">
                  {line.numberOfPackages.toLocaleString()}
                </div>
                <div className="col-span-2">
                  {line.poItem ? (
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                      {line.poItem}
                    </span>
                  ) : (
                    <span className="text-red-500 text-xs">Missing</span>
                  )}
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">
                  {line.expiryDate?.toLocaleDateString() || "—"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex justify-between items-center pt-1 border-t border-border">
          <Button
            label="Close"
            outlined
            severity="secondary"
            size="small"
            onClick={onHide}
          />
          <div className="flex gap-2">
            {asn.status === "draft" && (
              <Button
                label="Submit ASN"
                icon="pi pi-send"
                severity="success"
                onClick={() => onSubmitDraft?.(asn.id)}
              />
            )}
            {/* <Button label="Print" icon="pi pi-print" outlined size="small" severity="secondary" /> */}
            <Button
              label="Download PDF"
              icon="pi pi-download"
              outlined
              size="small"
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
