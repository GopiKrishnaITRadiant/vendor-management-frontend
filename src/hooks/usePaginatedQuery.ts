import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "./debounceHook";
import type { DataTablePageEvent } from "primereact/datatable";

export interface PaginatedResponse<T> {
  data:  T[];
  total: number;
}

export interface UsePaginatedQueryOptions<T, F extends Record<string, unknown>> {
  fetchFn: (params: {
    page:    number;
    rows:    number;
    search?: string;
    filters: F;
  }) => Promise<PaginatedResponse<T>>;

  initialFilters: F;

  defaultRows?: number;
  debounceMs?:  number;

  onError?: (error: unknown) => void;
}

export function usePaginatedQuery<T, F extends Record<string, unknown>>({
  fetchFn,
  initialFilters,
  defaultRows = 10,
  debounceMs  = 500,
  onError,
}: UsePaginatedQueryOptions<T, F>) {

  //Pagination
  const [page,  setPage]  = useState(1);
  const [rows,  setRows]  = useState(defaultRows);
  const [first, setFirst] = useState(0);

  //Search
  const [search, setSearch] = useState("");
  const debouncedSearch     = useDebounce(search, debounceMs);

  //Filters
  const [filters, setFilters] = useState<F>(initialFilters);
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  //Data
  const [data,         setData]         = useState<T[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading,      setLoading]      = useState(false);

  //Stale-response guard
  const requestIdRef = useRef(0);

  //Keep latest fetchFn/onError WITHOUT causing
  //refetches when the caller passes a new inline
  //function reference every render
  const fetchFnRef = useRef(fetchFn);
  useEffect(() => { fetchFnRef.current = fetchFn; }, [fetchFn]);

  const onErrorRef = useRef(onError);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  //Reset pagination on search/filter change
  useEffect(() => {
    setPage(1);
    setFirst(0);
  }, [debouncedSearch, filtersKey]);

  //Load
  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);

      const response = await fetchFnRef.current({
        page,
        rows,
        search: debouncedSearch || undefined,
        filters,
      });

      if (requestId !== requestIdRef.current) return;

      setData(response.data);
      setTotalRecords(response.total);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      onErrorRef.current?.(error);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
    // fetchFn AND onError intentionally excluded — both accessed
    // via refs above so a new inline function passed by the caller
    // on every render does NOT trigger a refetch loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rows, debouncedSearch, filtersKey]);

  useEffect(() => {
    load();
  }, [load]);

  // ── PrimeReact pagination handler ───────────
  const onPageChange = useCallback((e: DataTablePageEvent) => {
    setPage((e.page ?? 0) + 1);
    setRows(e.rows);
    setFirst(e.first);
  }, []);

  // ── Filter helpers ──────────────────────────
  const setFilter = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setPage(1);
    setFirst(0);
  }, [initialFilters]);

  const refetch = useCallback(() => {
    load();
  }, [load]);

  return {
    data,
    totalRecords,
    loading,

    page,
    rows,
    first,
    onPageChange,

    search,
    setSearch,

    filters,
    setFilter,
    setFilters,
    clearFilters,

    refetch,
  };
}