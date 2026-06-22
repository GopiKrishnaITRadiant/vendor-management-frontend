import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Message } from "primereact/message";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";

import AppTable from "../../components/table/DataTable";
import type { PurchaseOrder } from "../../types/purchaseOrderTypes";

type LocationState = { selectedOrders: PurchaseOrder[] };
type ASNLine = PurchaseOrder & {
  shipQuantity: number;
  batchNumber: string;
  expiryDate: Date | null;
};

const carrierOptions = [
  { label: "FedEx", value: "FEDEX" },
  { label: "UPS", value: "UPS" },
  { label: "DHL", value: "DHL" },
  { label: "Blue Dart", value: "BLUEDART" },
];

const shipToOptions = [
  { label: "Hyderabad Warehouse", value: "HYD" },
  { label: "Mumbai Warehouse", value: "MUM" },
  { label: "Delhi Distribution Center", value: "DEL" },
];

function StepIndicator({ current }: { current: 1 | 2 }) {
  const steps = [
    { n: 1, label: "Shipment Details" },
    { n: 2, label: "Line Items" },
  ];
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step.n} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${current >= step.n ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
            >
              {current > step.n ? (
                <i className="pi pi-check text-xs" />
              ) : (
                step.n
              )}
            </div>
            <span
              className={`text-sm font-medium hidden sm:block ${current >= step.n ? "text-foreground" : "text-muted-foreground"}`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-px mx-1 ${current > step.n ? "bg-primary" : "bg-border"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function CreateASNPage() {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const { state } = useLocation();
  const { selectedOrders } = (state as LocationState) ?? { selectedOrders: [] };
  console.log("selectedOrders", selectedOrders);

  const [step, setStep] = useState<1 | 2>(1);
  const [asnNumber, setAsnNumber] = useState("");
  const [shipDate, setShipDate] = useState<Date | null>(null);
  const [carrier, setCarrier] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipTo, setShipTo] = useState<string | null>(null);

  const [asnLines, setAsnLines] = useState<ASNLine[]>(
    selectedOrders.map((po) => ({
      ...po,
      shipQuantity: po.actQty, // default ship qty
      batchNumber: po.batch || "",
      expiryDate: null,
    })),
  );

  const updateLine = (id: number | string, field: keyof ASNLine, value: any) =>
    setAsnLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, [field]: value } : line)),
    );

  const isStep1Valid =
    asnNumber.trim() !== "" &&
    shipDate !== null &&
    carrier !== null &&
    shipTo !== null;
  const isStep2Valid = asnLines.every((l) => l.batchNumber.trim() !== "");

  const handleSubmit = () => {
    console.log("Submitting ASN:", {
      asnNumber,
      shipDate,
      carrier,
      trackingNumber,
      shipTo,
      lines: asnLines,
    });
    toast.current?.show({
      severity: "success",
      summary: "ASN Submitted",
      detail: `${asnNumber} submitted for approval.`,
      life: 4000,
    });
    setTimeout(() => navigate("/purchase-orders"), 1500);
  };

  if (selectedOrders.length === 0) {
    return (
      <div className="page-container py-12 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <i className="pi pi-inbox text-2xl text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            No orders selected
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Go back to Purchase Orders and select the lines you want to ship.
          </p>
        </div>
        <Button
          label="Back to Purchase Orders"
          icon="pi pi-arrow-left"
          outlined
          onClick={() => navigate("/purchase-orders")}
        />
      </div>
    );
  }

  return (
    <div className="page-container py-6 space-y-6">
      <Toast ref={toast} />

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            icon="pi pi-arrow-left"
            rounded
            text
            severity="secondary"
            onClick={() => (step === 2 ? setStep(1) : navigate(-1))}
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create ASN</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {asnLines.length} PO line{asnLines.length > 1 ? "s" : ""} selected
            </p>
          </div>
        </div>
        <StepIndicator current={step} />
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="card p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Shipment Details
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Enter the carrier and destination for this shipment
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <Field label="ASN Number" required>
                <InputText
                  value={asnNumber}
                  onChange={(e) => setAsnNumber(e.target.value)}
                  placeholder="e.g. ASN-2024-00123"
                  className="w-full"
                />
              </Field>
              <Field label="Ship Date" required>
                <Calendar
                  value={shipDate}
                  onChange={(e) => setShipDate(e.value as Date)}
                  placeholder="Select date"
                  minDate={new Date()}
                  showIcon
                  className="w-full"
                />
              </Field>
              <Field label="Carrier" required>
                <Dropdown
                  value={carrier}
                  options={carrierOptions}
                  onChange={(e) => setCarrier(e.value)}
                  placeholder="Select carrier"
                  className="w-full"
                />
              </Field>
              <Field label="Tracking Number">
                <InputText
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. FX123456789"
                  className="w-full"
                />
              </Field>
              <Field label="Ship To" required>
                <Dropdown
                  value={shipTo}
                  options={shipToOptions}
                  onChange={(e) => setShipTo(e.value)}
                  placeholder="Select destination"
                  className="w-full"
                />
              </Field>
            </div>
          </div>

          <div className="card p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">
              Selected PO Lines ({asnLines.length})
            </h2>
            <div className="divide-y divide-border">
              {asnLines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {line.poNo} – Item {line.poItem}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {line.matDesc}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {line.actQty.toLocaleString()} units
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              label="Cancel"
              outlined
              severity="secondary"
              onClick={() => navigate(-1)}
            />
            <Button
              label="Next: Line Items"
              icon="pi pi-arrow-right"
              iconPos="right"
              disabled={!isStep1Valid}
              onClick={() => setStep(2)}
              tooltip={
                !isStep1Valid ? "Fill all required fields to continue" : ""
              }
              tooltipOptions={{ position: "left" }}
            />
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-5">
          {!isStep2Valid && (
            <Message
              severity="info"
              text="Enter a batch number for every line before submitting."
              className="w-full"
            />
          )}

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">
                PO Line Items
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Confirm ship quantities and enter batch details
              </p>
            </div>
            <AppTable
              data={asnLines}
              selectable={false}
              globalSearch={false}
              rows={20}
              columns={[
                {
                  field: "poNo",
                  header: "PO Number",
                  sortable: true,
                },
                {
                  field: "poItem",
                  header: "Item",
                },
                {
                  field: "matCode",
                  header: "Material Code",
                },
                {
                  field: "matDesc",
                  header: "Description",
                  sortable: true,
                },
                {
                  field: "actQty",
                  header: "PO Qty",
                },
                {
                  field: "shipQuantity",
                  header: "Ship Qty *",
                  body: (row) => (
                    <InputNumber
                      value={row.shipQuantity}
                      onValueChange={(e) =>
                        updateLine(row.id, "shipQuantity", e.value ?? 0)
                      }
                      min={1}
                      max={row.actQty}
                    />
                  ),
                },
                {
                  field: "batchNumber",
                  header: "Batch No. *",
                  body: (row) => (
                    <InputText
                      value={row.batchNumber}
                      onChange={(e) =>
                        updateLine(row.id, "batchNumber", e.target.value)
                      }
                    />
                  ),
                },
                {
                  field: "expiryDate",
                  header: "Expiry Date",
                  body: (row) => (
                    <Calendar
                      value={row.expiryDate}
                      onChange={(e) =>
                        updateLine(row.id, "expiryDate", e.value)
                      }
                    />
                  ),
                },
              ]}
            />
          </div>

          {/* Summary strip */}
          <div className="card p-4">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {[
                { label: "ASN Number", value: asnNumber },
                {
                  label: "Ship Date",
                  value: shipDate?.toLocaleDateString() ?? "—",
                },
                { label: "Carrier", value: carrier ?? "—" },
                {
                  label: "Ship To",
                  value:
                    shipToOptions.find((o) => o.value === shipTo)?.label ?? "—",
                },
                {
                  label: "Total Qty",
                  value: `${asnLines.reduce((s, l) => s + l.shipQuantity, 0)?.toLocaleString()} units`,
                },
              ].map((item, i) => (
                <div key={item.label} className="flex items-center gap-6">
                  {i > 0 && <Divider layout="vertical" className="!h-8" />}
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {item.label}
                    </p>
                    <p className="font-medium mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <Button
              label="Back"
              icon="pi pi-arrow-left"
              outlined
              severity="secondary"
              onClick={() => setStep(1)}
            />
            <div className="flex gap-3">
              <Button
                label="Cancel"
                outlined
                severity="secondary"
                onClick={() => navigate(-1)}
              />
              <Button
                label="Submit ASN"
                icon="pi pi-check"
                disabled={!isStep2Valid}
                onClick={handleSubmit}
                tooltip={
                  !isStep2Valid ? "Fill batch numbers for all lines" : ""
                }
                tooltipOptions={{ position: "left" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
