import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button }      from "primereact/button";
import { InputText }   from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown }    from "primereact/dropdown";
import { Calendar }    from "primereact/calendar";
import { Divider }     from "primereact/divider";
import { Toast }       from "primereact/toast";
import type { PurchaseOrder } from "../../../types/purchaseOrderTypes";
import type { WarehouseType } from "../../../types/asnTypes";
import { createASN } from "../../../services/ASNService";
import { carrierOptions, packageTypeOptions, shipmentModeOptions, uomOptions, warehouseTypeOptions, weightUnitOptions } from "./create-asn.constants";
import AppTable from "../../../components/table/DataTable";

type LocationState = { selectedOrders: PurchaseOrder[] };

type ASNLineForm = {
  // read-only identity (from PO)
  id:             number | string;
  poNo:           string;
  poItem:         string;
  originalQty:    number;         // display only

  // vendor-editable — all map to CreateAsnItemDto
  deliverableQty: number;         // required (min 1)
  uom:            string;
  upsWarehouseId: string;         // e.g. "SD60" / "SD61"
  batchNo:        string;
  manufactureDate: Date | null;
  expiryDate:     Date | null;
  numberOfPackages: number;
  packageType:    string;
  grossWeight:    number | null;
  weightUnit:     string;
};

function StepIndicator({ current }: { current: 1 | 2 }) {
  const steps = [
    { n: 1, label: "Shipment Details" },
    { n: 2, label: "Line Items"       },
  ];
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={step.n} className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                current >= step.n
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {current > step.n ? <i className="pi pi-check text-xs" /> : step.n}
            </div>
            <span
              className={`text-sm font-medium hidden sm:block ${
                current >= step.n ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-8 h-px mx-1 ${
                current > step.n ? "bg-primary" : "bg-border"
              }`}
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
  const navigate   = useNavigate();
  const toast      = useRef<Toast>(null);
  const { state }  = useLocation();
  const { selectedOrders } = (state as LocationState) ?? { selectedOrders: [] };

  const [step,   setStep]   = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);

  const [warehouseType,          setWarehouseType]          = useState<WarehouseType>("SD60");
  const [estimatedShipDate,      setEstimatedShipDate]      = useState<Date | null>(null);
  const [estimatedDeliveryDate,  setEstimatedDeliveryDate]  = useState<Date | null>(null);
  const [carrierName,            setCarrierName]            = useState("");
  const [trackingNumber,         setTrackingNumber]         = useState("");
  const [shipmentMode,           setShipmentMode]           = useState<string | null>(null);
  const [shipFromAddress,        setShipFromAddress]        = useState("");
  const [notes,                  setNotes]                  = useState("");

  //Step 2 state
  const [asnLines, setAsnLines] = useState<ASNLineForm[]>(
    selectedOrders.map((po) => ({
      id:              po.id,
      poNo:            po.poNo,
      poItem:          po.poItem,
      originalQty:     po.actQty ?? 0,

      deliverableQty:  po.actQty ?? 1,
      uom:             po.uom  ?? "EA",
      upsWarehouseId:  "",
      batchNo:         "",
      manufactureDate: null,
      expiryDate:      null,
      numberOfPackages: 1,
      packageType:     "Box",
      grossWeight:     null,
      weightUnit:      "KG",
    }))
  );

  const updateLine = (
    id: number | string,
    field: keyof ASNLineForm,
    value: unknown
  ) =>
    setAsnLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, [field]: value } : line))
    );

  // Validation
  // Step 1: warehouseType + estimatedShipDate are the only required fields
  const isStep1Valid =
    warehouseType !== null &&
    estimatedShipDate !== null;

  // Step 2: each line must have deliverableQty ≥ 1 (backend: @Min(1))
  // All other line fields are optional per the DTO (@IsOptional)
  const isStep2Valid = asnLines.every((l) => l.deliverableQty >= 1);

  //Save as Draft
  const handleSaveAsDraft = async () => {
    if (!isStep1Valid || !isStep2Valid) return;
    setSaving(true);
    try {
      const asn = await createASN({
        poNo:                  asnLines[0]?.poNo ?? "",
        warehouseType,
        estimatedShipDate:     estimatedShipDate!.toISOString(),
        estimatedDeliveryDate: estimatedDeliveryDate?.toISOString(),
        carrierName:           carrierName.trim()      || undefined,
        trackingNumber:        trackingNumber.trim()   || undefined,
        shipmentMode:          (shipmentMode as "AIR" | "ROAD" | "SEA" | "RAIL" | undefined) ?? undefined,
        notes:                 notes.trim()            || undefined,
        // shipFromAddressId would come from a vendor address selector
        items: asnLines.map((l) => ({
          poNo:             l.poNo,
          poItem:           l.poItem,
          deliverableQty:   l.deliverableQty,
          uom:              l.uom             || undefined,
          upsWarehouseId:   l.upsWarehouseId  || undefined,
          batchNo:          l.batchNo         || undefined,
          manufactureDate:  l.manufactureDate ? l.manufactureDate.toISOString().split("T")[0] : undefined,
          expiryDate:       l.expiryDate      ? l.expiryDate.toISOString().split("T")[0]      : undefined,
          numberOfPackages: l.numberOfPackages > 0 ? l.numberOfPackages : undefined,
          packageType:      l.packageType     || undefined,
          grossWeight:      l.grossWeight     ?? undefined,
          weightUnit:       l.weightUnit      || undefined,
        })),
      });

      toast.current?.show({
        severity: "success",
        summary:  "Draft Saved",
        detail:   `${asn.asnNumber} saved as draft. You can submit it from the ASN list.`,
        life:     4000,
      });

      setTimeout(() => navigate("/asn/history"), 1600);
    } catch (err: unknown) {
      toast.current?.show({
        severity: "error",
        summary:  "Save Failed",
        detail:   err instanceof Error ? err.message : "An unexpected error occurred.",
        life:     5000,
      });
    } finally {
      setSaving(false);
    }
  };

  //Empty state
  if (selectedOrders.length === 0) {
    return (
      <div className="page-container py-12 flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <i className="pi pi-inbox text-2xl text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">No orders selected</h2>
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            icon="pi pi-arrow-left"
            rounded
            text
            severity="secondary"
            onClick={() => (step === 2 ? setStep(1) : navigate(-1))}
            disabled={saving}
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

      {step === 1 && (
        <div className="space-y-5">
          <div className="card p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold text-foreground">Shipment Details</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Warehouse type, dates, and carrier for this shipment
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

              {/* Required */}
              <Field label="Warehouse Type" required>
                <Dropdown
                  value={warehouseType}
                  options={warehouseTypeOptions}
                  onChange={(e) => setWarehouseType(e.value)}
                  className="w-full"
                />
              </Field>

              <Field label="Estimated Ship Date" required>
                <Calendar
                  value={estimatedShipDate}
                  onChange={(e) => setEstimatedShipDate(e.value as Date)}
                  placeholder="Select date"
                  minDate={new Date()}
                  showIcon
                  className="w-full"
                />
              </Field>

              {/* Optional per DTO */}
              <Field label="Estimated Delivery Date">
                <Calendar
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.value as Date)}
                  placeholder="Select date"
                  minDate={estimatedShipDate ?? new Date()}
                  showIcon
                  className="w-full"
                />
              </Field>

              <Field label="Carrier Name">
                <Dropdown
                  value={carrierName}
                  options={carrierOptions}
                  onChange={(e) => setCarrierName(e.value)}
                  placeholder="Select carrier"
                  className="w-full"
                  editable
                  showClear
                />
              </Field>

              {/* <Field label="Tracking Number">
                <InputText
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. FX123456789"
                  className="w-full"
                />
              </Field> */}

              <Field label="Shipment Mode">
                <Dropdown
                  value={shipmentMode}
                  options={shipmentModeOptions}
                  onChange={(e) => setShipmentMode(e.value)}
                  placeholder="Select mode"
                  className="w-full"
                  showClear
                />
              </Field>

              <Field label="Ship From Address">
                <InputText
                  value={shipFromAddress}
                  onChange={(e) => setShipFromAddress(e.target.value)}
                  placeholder="Warehouse / plant address"
                  className="w-full"
                />
              </Field>

              <Field label="Notes">
                <InputText
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions…"
                  className="w-full"
                />
              </Field>

            </div>
          </div>

          {/* PO Lines preview */}
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
                      Ordered qty: {line.originalQty.toLocaleString()} {line.uom}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {line.numberOfPackages} pkg{line.numberOfPackages !== 1 ? "s" : ""}
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
              tooltip={!isStep1Valid ? "Select warehouse type and ship date to continue" : ""}
              tooltipOptions={{ position: "left" }}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">ASN Line Items</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Enter delivery quantities, batch details, and packaging per line.
                All fields except <strong>Deliverable Qty</strong> are optional and can be filled before submission.
              </p>
            </div>

            <AppTable
              data={asnLines}
              selectable={false}
              globalSearch={false}
              rows={20}
              columns={
                [
                  {
                    field: "poNo" as keyof ASNLineForm,
                    header: "PO No.",
                    sortable: true,
                  },
                  {
                    field: "poItem" as keyof ASNLineForm,
                    header: "Item",
                  },
                  {
                    field: "originalQty" as keyof ASNLineForm,
                    header: "PO Qty",
                    body: (row: ASNLineForm) => (
                      <span className="text-muted-foreground">
                        {row.originalQty.toLocaleString()}
                      </span>
                    ),
                  },
                  {
                    field: "deliverableQty" as keyof ASNLineForm,
                    header: "Deliverable Qty *",
                    body: (row: ASNLineForm) => (
                      <InputNumber
                        value={row.deliverableQty}
                        onValueChange={(e) => updateLine(row.id, "deliverableQty", e.value ?? 1)}
                        min={1}
                        inputStyle={{ width: "80px" }}
                        className={row.deliverableQty < 1 ? "p-invalid" : ""}
                      />
                    ),
                  },
                  {
                    field: "uom" as keyof ASNLineForm,
                    header: "UOM",
                    body: (row: ASNLineForm) => (
                      <Dropdown
                        value={row.uom}
                        options={uomOptions}
                        onChange={(e) => updateLine(row.id, "uom", e.value)}
                        style={{ width: "120px" }}
                      />
                    ),
                  },
                  {
                    field: "batchNo" as keyof ASNLineForm,
                    header: "Batch No.",
                    body: (row: ASNLineForm) => (
                      <InputText
                        value={row.batchNo}
                        onChange={(e) =>
                          updateLine(row.id, "batchNo", e.target.value)
                        }
                        placeholder="e.g. BT-20240601"
                        className="w-full"
                      />
                    ),
                  },
                  {
                    field: "manufactureDate" as keyof ASNLineForm,
                    header: "Mfg. Date",
                    body: (row: ASNLineForm) => (
                      <Calendar
                        value={row.manufactureDate}
                        onChange={(e) =>
                          updateLine(row.id, "manufactureDate", e.value ?? null)
                        }
                        placeholder="MM/DD/YYYY"
                        showIcon
                        maxDate={new Date()}
                      />
                    ),
                  },
                  {
                    field: "expiryDate" as keyof ASNLineForm,
                    header: "Expiry Date",
                    body: (row: ASNLineForm) => (
                      <Calendar
                        value={row.expiryDate}
                        onChange={(e) =>
                          updateLine(row.id, "expiryDate", e.value ?? null)
                        }
                        placeholder="MM/DD/YYYY"
                        showIcon
                        minDate={new Date()}
                      />
                    ),
                  },
                  {
                    field: "numberOfPackages" as keyof ASNLineForm,
                    header: "No. of Pkgs",
                    body: (row: ASNLineForm) => (
                      <InputNumber
                        value={row.numberOfPackages}
                        onValueChange={(e) => updateLine(row.id, "numberOfPackages", e.value ?? 1)}
                        min={1}
                        inputStyle={{ width: "70px" }}
                      />
                    ),
                  },
                  {
                    field: "packageType" as keyof ASNLineForm,
                    header: "Pkg Type",
                    body: (row: ASNLineForm) => (
                      <Dropdown
                        value={row.packageType}
                        options={packageTypeOptions}
                        onChange={(e) =>
                          updateLine(row.id, "packageType", e.value)
                        }
                        className="w-full"
                      />
                    ),
                  },
                  {
                    field: "grossWeight" as keyof ASNLineForm,
                    header: "Gross Wt.",
                    body: (row: ASNLineForm) => (
                      <div className="flex items-center gap-1">
                        <InputNumber
                          value={row.grossWeight}
                          onValueChange={(e) => updateLine(row.id, "grossWeight", e.value ?? null)}
                          placeholder="0.000"
                          minFractionDigits={0}
                          maxFractionDigits={3}
                          inputStyle={{ width: "75px" }}
                        />
                        <Dropdown
                          value={row.weightUnit}
                          options={weightUnitOptions}
                          onChange={(e) => updateLine(row.id, "weightUnit", e.value)}
                          style={{ width: "75px" }}
                        />
                      </div>
                    ),
                  },
                ]
              }
            />
          </div>

          {/* Summary strip */}
          <div className="card p-4">
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {[
                { label: "Warehouse",      value: warehouseType },
                { label: "Est. Ship Date", value: estimatedShipDate?.toLocaleDateString() ?? "—" },
                { label: "Est. Delivery",  value: estimatedDeliveryDate?.toLocaleDateString() ?? "—" },
                { label: "Carrier",        value: carrierName || "—" },
                { label: "Mode",           value: shipmentMode ?? "—" },
                {
                  label: "Total Deliverable",
                  value: `${asnLines.reduce((s, l) => s + l.deliverableQty, 0).toLocaleString()} units`,
                },
                { label: "Lines", value: String(asnLines.length) },
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
              disabled={saving}
            />
            <div className="flex items-center gap-3">
              <Button
                label="Cancel"
                outlined
                severity="secondary"
                onClick={() => navigate(-1)}
                disabled={saving}
              />
              <Button
                label={saving ? "Saving…" : "Save as Draft"}
                icon={saving ? "pi pi-spin pi-spinner" : "pi pi-save"}
                disabled={!isStep2Valid || saving}
                onClick={handleSaveAsDraft}
                tooltip={!isStep2Valid ? "Each line must have deliverable qty ≥ 1" : ""}
                tooltipOptions={{ position: "left" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}