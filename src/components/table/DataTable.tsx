import { useState } from "react";
import type { ReactNode } from "react";

import { Column } from "primereact/column";
import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

type ColumnType<T> = {
  field: keyof T;
  header: string;
  sortable?: boolean;
  filter?: boolean;
  body?: (row: T) => ReactNode;
};

type AppTableProps<T> = {
  data: T[];
  columns: ColumnType<T>[];

  loading?: boolean;

  rows?: number;
  totalRecords?: number;
  first?: number;
  // false = frontend pagination (PrimeReact handles it internally)
  // true  = backend / manual pagination (caller slices data and controls `first`)
  lazy?: boolean;
  // Default: "id". Use "poNo" for POGroup, etc.
  dataKey?: string;

  selectable?: boolean;
  selectionMode?: "single" | "multiple";

  globalSearch?: boolean;
  onSearchChange?: (value: string) => void;

  onPageChange?: (event: DataTablePageEvent) => void;

  onSelectionChange?: (rows: T[]) => void;
  // Row expansion
  rowExpansionTemplate?: (row: T) => ReactNode;
  expandableWhen?: (row: T) => boolean;
  // Actions
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
};

export default function AppTable<T extends Record<string, any>>({
  data,
  columns,

  loading = false,

  rows = 10,
  totalRecords,
  first = 0,
  lazy = false,

  dataKey = "id",

  selectable = false,
  selectionMode = "multiple",

  globalSearch = true,

  onPageChange,
  onSearchChange,

  onSelectionChange,
  rowExpansionTemplate,
  expandableWhen,

  onView,
  onEdit,
  onDelete,
}: AppTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<T[] | T | null>(null);
  const [expandedRows, setExpandedRows] = useState<any>(null);
  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    onSearchChange?.(value);
  };

  const hasActions = onView || onEdit || onDelete;

  const actionTemplate = (row: T) => (
    <div className="flex items-center gap-1">
      {onView && (
        <Button
          icon="pi pi-eye"
          rounded
          text
          severity="info"
          onClick={() => onView(row)}
        />
      )}
      {onEdit && (
        <Button
          icon="pi pi-pencil"
          rounded
          text
          severity="warning"
          onClick={() => onEdit(row)}
        />
      )}
      {onDelete && (
        <Button
          icon="pi pi-trash"
          rounded
          text
          severity="danger"
          onClick={() => onDelete(row)}
        />
      )}
    </div>
  );

  const header = globalSearch ? (
    <div className="flex justify-end">
      <InputText
        value={globalFilterValue}
        onChange={onGlobalFilterChange}
        placeholder="Search..."
        className="w-full md:w-80"
      />
    </div>
  ) : null;

  return (
    <div className="card">
      <DataTable
        value={data}
        dataKey={dataKey}
        paginator
        lazy={lazy}
        rows={rows}
        {...(lazy ? { first } : {})}
        totalRecords={lazy ? totalRecords : data.length}
        onPage={onPageChange}
        loading={loading}
        header={header}
        selection={selectedRows}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowExpansionTemplate={rowExpansionTemplate}
        onSelectionChange={(e: any) => {
          setSelectedRows(e.value);
          if (Array.isArray(e.value)) {
            onSelectionChange?.(e.value);
          } else if (e.value) {
            onSelectionChange?.([e.value]);
          } else {
            onSelectionChange?.([]);
          }
        }}
        emptyMessage="No records found"
        removableSort
        showGridlines
        className="app-table"
      >
        {/* Row Expansion toggle */}
        {rowExpansionTemplate && (
          <Column
            expander={(rowData) =>
              expandableWhen ? expandableWhen(rowData) : true
            }
            style={{ width: "3rem" }}
          />
        )}

        {/* Selection checkbox/radio */}
        {selectable && (
          <Column
            selectionMode={selectionMode}
            headerStyle={{ width: "3rem" }}
          />
        )}

        {columns.map((column) => (
          <Column
            key={String(column.field)}
            field={String(column.field)}
            header={column.header}
            sortable={column.sortable}
            filter={column.filter}
            body={column.body}
            filterPlaceholder={`Search ${column.header}`}
            showFilterMenu={false}
          />
        ))}

        {hasActions && (
          <Column
            header="Actions"
            body={actionTemplate}
            style={{ width: "140px" }}
          />
        )}
      </DataTable>
    </div>
  );
}