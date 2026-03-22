import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

interface UseAppwriteOptions<T, P extends Record<string, string | number>> {
  fn: (params: P) => Promise<T>;
  params?: P;
  skip?: boolean;
}

interface UseAppwriteReturn<T, P> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: (newParams: P) => Promise<void>;
}

export const useAppwrite = <T, P extends Record<string, string | number>>({
  fn,
  params = {} as P,
  skip = false,
}: UseAppwriteOptions<T, P>): UseAppwriteReturn<T, P> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const fetchData = useCallback(async (fetchParams: P) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const result = await fnRef.current(fetchParams);
      if (requestId === requestIdRef.current) {
        setData(result);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      if (requestId === requestIdRef.current) {
        setError(errorMessage);
        Alert.alert('Error', errorMessage);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const paramsKey = useMemo(() => {
    const sortedEntries = Object.entries(params).sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    return JSON.stringify(sortedEntries);
  }, [params]);

  const stableParamsRef = useRef<{ key: string; value: P }>({
    key: paramsKey,
    value: params,
  });

  if (stableParamsRef.current.key !== paramsKey) {
    stableParamsRef.current = { key: paramsKey, value: params };
  }

  useEffect(() => {
    if (!skip) {
      fetchData(stableParamsRef.current.value);
    }
  }, [fetchData, paramsKey, skip]);

  const refetch = useCallback(async (newParams: P) => await fetchData(newParams), [fetchData]);

  return { data, loading, error, refetch };
};
