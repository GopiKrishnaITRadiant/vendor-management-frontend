import { useMemo, useState } from "react";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { FilterMatchMode } from "primereact/api";

type ColumnType<T> = {
  field: keyof T;
  header: string;
  sortable?: boolean;
  filter?: boolean;
  body?: (row: T) => React.ReactNode;
};

type AppTableProps<T> = {
  data: T[];
  columns: ColumnType<T>[];

  loading?: boolean;

  rows?: number;
  totalRecords?: number;
  first?: number;

  selectable?: boolean;
  selectionMode?: "single" | "multiple";

  globalSearch?: boolean;

  onPageChange?: (event: any) => void;

  onSelectionChange?: (rows: T[]) => void;

  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
};

export default function AppTable<T extends { id: number | string }>({
  data,
  columns,

  loading = false,

  rows = 10,
  totalRecords = 0,
  first = 0,

  selectable = false,
  selectionMode = "multiple",

  globalSearch = true,

  onPageChange,

  onSelectionChange,

  onView,
  onEdit,
  onDelete,
}: AppTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<any>(null);

  const initialFilters = useMemo(() => {
    const filters: any = {
      global: {
        value: null,
        matchMode: FilterMatchMode.CONTAINS,
      },
    };

    columns.forEach((column) => {
      if (column.filter) {
        filters[String(column.field)] = {
          value: null,
          matchMode: FilterMatchMode.CONTAINS,
        };
      }
    });

    return filters;
  }, [columns]);

  const [filters, setFilters] = useState(initialFilters);

  const [globalFilterValue, setGlobalFilterValue] = useState("");

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    setFilters((prev: any) => ({
      ...prev,
      global: {
        ...prev.global,
        value,
      },
    }));

    setGlobalFilterValue(value);
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
        dataKey="id"
        paginator
        rows={rows}
        first={first}
        totalRecords={totalRecords || data.length}
        onPage={onPageChange}
        loading={loading}
        filters={filters}
        onFilter={(e) => setFilters(e.filters)}
        globalFilterFields={columns.map((c) => String(c.field))}
        header={header}
        selection={selectedRows}
        onSelectionChange={(e) => {
          setSelectedRows(e.value);
          onSelectionChange?.(e.value ?? []);
        }}
        emptyMessage="No records found"
        removableSort
        showGridlines
        className="app-table"
      >
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