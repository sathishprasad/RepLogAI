"use client";

import { useState, useEffect, useRef } from "react";

const cache = new Map<string, { data: any; timestamp: number }>();
const STALE_TIME = 30_000;

export function useCachedFetch<T>(url: string | null, deps: any[] = []) {
  const [data, setData] = useState<T | null>(() => {
    if (!url) return null;
    const cached = cache.get(url);
    return cached ? cached.data : null;
  });
  const [loading, setLoading] = useState(() => {
    if (!url) return false;
    return !cache.has(url);
  });
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!url) return;

    const cached = cache.get(url);
    const isFresh = cached && Date.now() - cached.timestamp < STALE_TIME;

    if (cached) {
      setData(cached.data);
      setLoading(false);
    }

    if (isFresh) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!cached) setLoading(true);

    fetch(url, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) return { __redirect: "/auth" };
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        if (controller.signal.aborted) return;
        cache.set(url, { data: json, timestamp: Date.now() });
        setData(json);
        setError(null);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [url, ...deps]);

  const refetch = () => {
    if (url) cache.delete(url);
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    fetch(url!, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        cache.set(url!, { data: json, timestamp: Date.now() });
        setData(json);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return { data, loading, error, refetch };
}

export function invalidateCache(urlPattern?: string) {
  if (!urlPattern) { cache.clear(); return; }
  const keys = Array.from(cache.keys());
  keys.forEach((key) => {
    if (key.includes(urlPattern)) cache.delete(key);
  });
}
