import { useState } from "react";

import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import AppTable from "../../components/table/DataTable"


type Vendor = {
  id: number;
  vendorCode: string;
  vendorName: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  category: string;
  status: "Active" | "Inactive" | "Suspended";
  totalOrders: number;
  onTimeDelivery: string;
};

type ASNApproval = {
  id: number;
  asnNumber: string;
  poNumber: string;
  vendor: string;
  shipDate: string;
  carrier: string;
  totalLines: number;
  totalQty: number;
  submittedAt: string;
  status: "Pending" | "Approved" | "Rejected" | "Under Review";
};

// ─── Mock Data ───────────────────────────────────────────

const vendors: Vendor[] = [
  {
    id: 1,
    vendorCode: "VND001",
    vendorName: "Exelan Pharma",
    contactPerson: "Rajesh Kumar",
    email: "rajesh@exelan.com",
    phone: "+91 98765 43210",
    city: "Hyderabad",
    country: "India",
    category: "API Manufacturer",
    status: "Active",
    totalOrders: 142,
    onTimeDelivery: "94%",
  },
  {
    id: 2,
    vendorCode: "VND002",
    vendorName: "Health Corp",
    contactPerson: "Sunita Rao",
    email: "sunita@healthcorp.com",
    phone: "+91 91234 56789",
    city: "Mumbai",
    country: "India",
    category: "Formulation",
    status: "Active",
    totalOrders: 98,
    onTimeDelivery: "88%",
  },
  {
    id: 3,
    vendorCode: "VND003",
    vendorName: "Medi Supplies",
    contactPerson: "Arvind Shah",
    email: "arvind@medisupplies.com",
    phone: "+91 99887 76655",
    city: "Ahmedabad",
    country: "India",
    category: "Packaging",
    status: "Active",
    totalOrders: 76,
    onTimeDelivery: "91%",
  },
  {
    id: 4,
    vendorCode: "VND004",
    vendorName: "BioGen Labs",
    contactPerson: "Meena Pillai",
    email: "meena@biogen.com",
    phone: "+91 93456 78901",
    city: "Pune",
    country: "India",
    category: "API Manufacturer",
    status: "Inactive",
    totalOrders: 34,
    onTimeDelivery: "79%",
  },
  {
    id: 5,
    vendorCode: "VND005",
    vendorName: "GlobalChem Inc",
    contactPerson: "James Wilson",
    email: "jwilson@globalchem.com",
    phone: "+1 555 234 5678",
    city: "New Jersey",
    country: "USA",
    category: "API Manufacturer",
    status: "Active",
    totalOrders: 61,
    onTimeDelivery: "96%",
  },
  {
    id: 6,
    vendorCode: "VND006",
    vendorName: "PharmaKraft",
    contactPerson: "Priya Nair",
    email: "priya@pharmakraft.com",
    phone: "+91 87654 32109",
    city: "Chennai",
    country: "India",
    category: "Formulation",
    status: "Suspended",
    totalOrders: 22,
    onTimeDelivery: "65%",
  },
];

const asnApprovals: ASNApproval[] = [
  {
    id: 1,
    asnNumber: "ASN-2024-00123",
    poNumber: "PO10001",
    vendor: "Exelan Pharma",
    shipDate: "2024-06-15",
    carrier: "FedEx",
    totalLines: 3,
    totalQty: 4500,
    submittedAt: "2024-06-10 09:32",
    status: "Pending",
  },
  {
    id: 2,
    asnNumber: "ASN-2024-00124",
    poNumber: "PO10002",
    vendor: "Health Corp",
    shipDate: "2024-06-18",
    carrier: "DHL",
    totalLines: 2,
    totalQty: 3000,
    submittedAt: "2024-06-10 11:15",
    status: "Under Review",
  },
  {
    id: 3,
    asnNumber: "ASN-2024-00120",
    poNumber: "PO10003",
    vendor: "Medi Supplies",
    shipDate: "2024-06-12",
    carrier: "Blue Dart",
    totalLines: 1,
    totalQty: 2500,
    submittedAt: "2024-06-08 14:00",
    status: "Approved",
  },
  {
    id: 4,
    asnNumber: "ASN-2024-00118",
    poNumber: "PO10005",
    vendor: "Exelan Pharma",
    shipDate: "2024-06-10",
    carrier: "UPS",
    totalLines: 2,
    totalQty: 1800,
    submittedAt: "2024-06-07 08:45",
    status: "Rejected",
  },
  {
    id: 5,
    asnNumber: "ASN-2024-00125",
    poNumber: "PO10006",
    vendor: "GlobalChem Inc",
    shipDate: "2024-06-20",
    carrier: "FedEx",
    totalLines: 4,
    totalQty: 6000,
    submittedAt: "2024-06-11 10:00",
    status: "Pending",
  },
  {
    id: 6,
    asnNumber: "ASN-2024-00126",
    poNumber: "PO10007",
    vendor: "Health Corp",
    shipDate: "2024-06-22",
    carrier: "DHL",
    totalLines: 2,
    totalQty: 2200,
    submittedAt: "2024-06-11 15:30",
    status: "Pending",
  },
  {
    id: 7,
    asnNumber: "ASN-2024-00117",
    poNumber: "PO10008",
    vendor: "BioGen Labs",
    shipDate: "2024-06-08",
    carrier: "Blue Dart",
    totalLines: 1,
    totalQty: 1000,
    submittedAt: "2024-06-06 13:20",
    status: "Approved",
  },
];

// ─── Sub-components ──────────────────────────────────────

function StatCard({
  label,
  value,
  colorClass = "text-foreground",
}: {
  label: string;
  value: string | number;
  colorClass?: string;
}) {
  return (
    <div className="card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <h3 className={`text-2xl font-bold mt-2 ${colorClass}`}>{value}</h3>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────

type ActiveTab = "vendors" | "asn-approvals";

export default function AdminPage() {
  const toast = useRef<Toast>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>("vendors");

  // Vendor dialog
  const [vendorDialogVisible, setVendorDialogVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // ASN approval state
  const [asnData, setAsnData] = useState<ASNApproval[]>(asnApprovals);
  const [asnDialogVisible, setAsnDialogVisible] = useState(false);
  const [selectedASN, setSelectedASN] = useState<ASNApproval | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const handleViewVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setVendorDialogVisible(true);
  };

  const handleViewASN = (asn: ASNApproval) => {
    setSelectedASN(asn);
    setAsnDialogVisible(true);
  };

  const handleApprove = (asn: ASNApproval) => {
    confirmDialog({
      message: `Approve ASN ${asn.asnNumber}?`,
      header: "Confirm Approval",
      icon: "pi pi-check-circle",
      acceptClassName: "p-button-success",
      accept: () => {
        setAsnData((prev) =>
          prev.map((a) =>
            a.id === asn.id ? { ...a, status: "Approved" } : a
          )
        );
        setAsnDialogVisible(false);
        toast.current?.show({
          severity: "success",
          summary: "Approved",
          detail: `${asn.asnNumber} has been approved.`,
          life: 3000,
        });
      },
    });
  };

  const handleReject = (asn: ASNApproval) => {
    confirmDialog({
      message: `Reject ASN ${asn.asnNumber}?`,
      header: "Confirm Rejection",
      icon: "pi pi-times-circle",
      acceptClassName: "p-button-danger",
      accept: () => {
        setAsnData((prev) =>
          prev.map((a) =>
            a.id === asn.id ? { ...a, status: "Rejected" } : a
          )
        );
        setAsnDialogVisible(false);
        toast.current?.show({
          severity: "error",
          summary: "Rejected",
          detail: `${asn.asnNumber} has been rejected.`,
          life: 3000,
        });
      },
    });
  };

  const filteredASN = statusFilter
    ? asnData.filter((a) => a.status === statusFilter)
    : asnData;

  const pendingCount = asnData.filter((a) => a.status === "Pending").length;
  const underReviewCount = asnData.filter(
    (a) => a.status === "Under Review"
  ).length;
  const approvedCount = asnData.filter((a) => a.status === "Approved").length;
  const rejectedCount = asnData.filter((a) => a.status === "Rejected").length;

  return (
    <div className="page-container py-6 space-y-6">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vendor management and ASN approval workflow
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setActiveTab("vendors")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "vendors"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <i className="pi pi-building mr-2" />
          Vendors
        </button>
        <button
          onClick={() => setActiveTab("asn-approvals")}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "asn-approvals"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <i className="pi pi-inbox" />
          ASN Approvals
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* ── VENDORS TAB ─────────────────────────────────── */}
      {activeTab === "vendors" && (
        <div className="space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Total Vendors" value={vendors.length} />
            <StatCard
              label="Active"
              value={vendors.filter((v) => v.status === "Active").length}
              colorClass="text-success"
            />
            <StatCard
              label="Inactive"
              value={vendors.filter((v) => v.status === "Inactive").length}
              colorClass="text-muted-foreground"
            />
            <StatCard
              label="Suspended"
              value={vendors.filter((v) => v.status === "Suspended").length}
              colorClass="text-danger"
            />
          </div>

          <AppTable
            data={vendors}
            globalSearch
            onView={handleViewVendor}
            columns={[
              {
                field: "vendorCode",
                header: "Vendor Code",
                sortable: true,
                filter: true,
              },
              {
                field: "vendorName",
                header: "Vendor Name",
                sortable: true,
                filter: true,
              },
              {
                field: "contactPerson",
                header: "Contact Person",
                sortable: true,
              },
              { field: "city", header: "City", sortable: true },
              { field: "category", header: "Category", sortable: true, filter: true },
              { field: "totalOrders", header: "Total Orders", sortable: true },
              { field: "onTimeDelivery", header: "On-Time %", sortable: true },
              { field: "status", header: "Status", sortable: true, filter: true },
            ]}
          />
        </div>
      )}

      {/* ── ASN APPROVALS TAB ───────────────────────────── */}
      {activeTab === "asn-approvals" && (
        <div className="space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard label="Pending" value={pendingCount} colorClass="text-warning" />
            <StatCard label="Under Review" value={underReviewCount} colorClass="text-primary" />
            <StatCard label="Approved" value={approvedCount} colorClass="text-success" />
            <StatCard label="Rejected" value={rejectedCount} colorClass="text-danger" />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Filter by status:</span>
            <Dropdown
              value={statusFilter}
              options={[
                { label: "All", value: null },
                { label: "Pending", value: "Pending" },
                { label: "Under Review", value: "Under Review" },
                { label: "Approved", value: "Approved" },
                { label: "Rejected", value: "Rejected" },
              ]}
              onChange={(e) => setStatusFilter(e.value)}
              placeholder="All"
              className="w-44"
            />
          </div>

          <AppTable
            data={filteredASN}
            globalSearch
            onView={handleViewASN}
            columns={[
              {
                field: "asnNumber",
                header: "ASN Number",
                sortable: true,
                filter: true,
              },
              {
                field: "poNumber",
                header: "PO Number",
                sortable: true,
                filter: true,
              },
              {
                field: "vendor",
                header: "Vendor",
                sortable: true,
                filter: true,
              },
              { field: "shipDate", header: "Ship Date", sortable: true },
              { field: "carrier", header: "Carrier", sortable: true },
              { field: "totalLines", header: "Lines", sortable: true },
              { field: "totalQty", header: "Total Qty", sortable: true },
              { field: "submittedAt", header: "Submitted At", sortable: true },
              { field: "status", header: "Status", sortable: true, filter: true },
            ]}
          />
        </div>
      )}

      {/* ── VENDOR DETAIL DIALOG ────────────────────────── */}
      <Dialog
        header="Vendor Details"
        visible={vendorDialogVisible}
        onHide={() => setVendorDialogVisible(false)}
        style={{ width: "480px" }}
        modal
      >
        {selectedVendor && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Vendor Code</p>
                <p className="font-medium">{selectedVendor.vendorCode}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Vendor Name</p>
                <p className="font-medium">{selectedVendor.vendorName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Contact Person</p>
                <p className="font-medium">{selectedVendor.contactPerson}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Email</p>
                <p className="font-medium">{selectedVendor.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Phone</p>
                <p className="font-medium">{selectedVendor.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Location</p>
                <p className="font-medium">{selectedVendor.city}, {selectedVendor.country}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Category</p>
                <p className="font-medium">{selectedVendor.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Status</p>
                <p className="font-medium">{selectedVendor.status}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Total Orders</p>
                <p className="font-medium">{selectedVendor.totalOrders}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">On-Time Delivery</p>
                <p className="font-medium">{selectedVendor.onTimeDelivery}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                label="Close"
                outlined
                severity="secondary"
                onClick={() => setVendorDialogVisible(false)}
              />
              <Button label="Edit Vendor" icon="pi pi-pencil" />
            </div>
          </div>
        )}
      </Dialog>

      {/* ── ASN DETAIL DIALOG ───────────────────────────── */}
      <Dialog
        header="ASN Details"
        visible={asnDialogVisible}
        onHide={() => setAsnDialogVisible(false)}
        style={{ width: "520px" }}
        modal
      >
        {selectedASN && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">ASN Number</p>
                <p className="font-medium">{selectedASN.asnNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">PO Number</p>
                <p className="font-medium">{selectedASN.poNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Vendor</p>
                <p className="font-medium">{selectedASN.vendor}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Carrier</p>
                <p className="font-medium">{selectedASN.carrier}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Ship Date</p>
                <p className="font-medium">{selectedASN.shipDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Submitted At</p>
                <p className="font-medium">{selectedASN.submittedAt}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Total Lines</p>
                <p className="font-medium">{selectedASN.totalLines}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Total Qty</p>
                <p className="font-medium">{selectedASN.totalQty.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Status</p>
                <p className="font-medium">{selectedASN.status}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                label="Close"
                outlined
                severity="secondary"
                onClick={() => setAsnDialogVisible(false)}
              />
              {(selectedASN.status === "Pending" ||
                selectedASN.status === "Under Review") && (
                <>
                  <Button
                    label="Reject"
                    icon="pi pi-times"
                    severity="danger"
                    outlined
                    onClick={() => handleReject(selectedASN)}
                  />
                  <Button
                    label="Approve"
                    icon="pi pi-check"
                    severity="success"
                    onClick={() => handleApprove(selectedASN)}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}