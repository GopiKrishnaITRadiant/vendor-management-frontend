import { useCallback, useEffect, useRef, useState } from "react";

// hooks/useServerData.ts
export function useServerData<T>(
  fetcher: () => Promise<{ data: T[]; total: number }>,
  deps: any[],
) {
  const [data,         setData]         = useState<T[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [error,        setError]        = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError(null);
      const res = await fetcher();
      if (requestId !== requestIdRef.current) return;
      setData(res.data);
      setTotalRecords(res.total);
    } catch (err: any) {
      if (requestId !== requestIdRef.current) return;
      setError(err?.response?.data?.message ?? "Failed to load data");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { load(); }, [load]);

  return { data, loading, totalRecords, error, reload: load };
}