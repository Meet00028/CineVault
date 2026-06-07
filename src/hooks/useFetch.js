import { useCallback, useEffect, useRef, useState } from 'react';

export function useFetch(fetcher, deps = [], { immediate = true } = {}) {
  const abortRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const result = await fetcher({ signal: controller.signal });
      setData(result);
      return result;
    } catch (e) {
      if (e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') return;
      setError(e);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!immediate) return;
    run();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [run, immediate]);

  return { data, loading, error, refetch: run };
}

