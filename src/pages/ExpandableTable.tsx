import type { ReactNode } from "react";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";

export type ExpandedColumn<T> = {
  field?: keyof T;
  header: string;
  body?: (row: T) => ReactNode;
  style?: React.CSSProperties;
};

type ExpandedTableProps<T> = {
  /** Label shown above the inner table, e.g. "Line Items — PO-1234" */
  title: string;
  /** Row data for the inner table */
  data: any[];
  /** Column definitions */
  columns: ExpandedColumn<T>[];
  /** Field used as row key (default: "id") */
  dataKey?: string;
};

export default function ExpandedTable<T>({
  title,
  data,
  columns,
  dataKey = "id",
}: ExpandedTableProps<T>) {
  return (
    <div className="px-4 pb-4 pt-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        {title}
      </p>

      <DataTable value={data} size="small" showGridlines dataKey={dataKey}>
        {columns.map((col, i) => (
          <Column
            key={col.field ? String(col.field) : `col-${i}`}
            field={col.field ? String(col.field) : undefined}
            header={col.header}
            body={col.body}
            style={col.style}
          />
        ))}
      </DataTable>
    </div>
  );
}