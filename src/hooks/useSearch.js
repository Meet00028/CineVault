import { useEffect, useMemo, useState } from 'react';

import { tmdb } from '../api/tmdb';
import { useDebounce } from './useDebounce';

export function useSearch({ query, year }) {
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const canSearch = useMemo(
    () => Boolean(debouncedQuery && debouncedQuery.trim().length >= 2),
    [debouncedQuery]
  );

  useEffect(() => {
    if (!canSearch) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    tmdb
      .searchMovies({ query: debouncedQuery.trim(), year }, { signal: controller.signal })
      .then((data) => setResults(data?.results || []))
      .catch((e) => {
        if (e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') return;
        setError(e);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [canSearch, debouncedQuery, year]);

  return { debouncedQuery, results, loading, error, canSearch };
}

