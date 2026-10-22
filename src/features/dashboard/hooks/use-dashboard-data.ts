"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardData } from "../types";

type DashboardApiResponse = {
  data?: DashboardData;
  error?: { message?: string };
  message?: string;
};

const FALLBACK_ERROR = "Unable to load dashboard data.";
const CACHE_TTL_MS = 30_000;
let cachedDashboard: { data: DashboardData; expiresAt: number } | null = null;
let dashboardRequest: Promise<DashboardData> | null = null;

async function fetchDashboard(force = false): Promise<DashboardData> {
  if (!force && cachedDashboard && cachedDashboard.expiresAt > Date.now()) {
    return cachedDashboard.data;
  }
  if (!force && dashboardRequest) return dashboardRequest;

  const request = (async () => {
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    const payload = (await response.json()) as DashboardApiResponse;
    if (!response.ok) {
      throw new Error(payload.error?.message ?? payload.message ?? FALLBACK_ERROR);
    }
    if (
      !payload.data?.metrics ||
      !Array.isArray(payload.data.recent) ||
      !Array.isArray(payload.data.reasons) ||
      !Array.isArray(payload.data.pendingApprovals)
    ) {
      throw new Error("The dashboard returned an unexpected response.");
    }
    cachedDashboard = { data: payload.data, expiresAt: Date.now() + CACHE_TTL_MS };
    return payload.data;
  })();

  if (!force) dashboardRequest = request;
  try {
    return await request;
  } finally {
    if (dashboardRequest === request) dashboardRequest = null;
  }
}

/** Shares dashboard data between route visits; manual refresh bypasses the cache. */
export function useDashboardData() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(
    () => cachedDashboard?.data ?? null,
  );
  const [loading, setLoading] = useState(() => !cachedDashboard || cachedDashboard.expiresAt <= Date.now());
  const [error, setError] = useState("");

  const load = useCallback(async (force = false) => {
    setLoading(!cachedDashboard || force);
    setError("");
    try {
      const data = await fetchDashboard(force);
      setDashboard(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : FALLBACK_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => load(true), [load]);

  useEffect(() => {
    if (!cachedDashboard || cachedDashboard.expiresAt <= Date.now()) {
      void load(false);
    }
  }, [load]);

  return { dashboard, loading, error, refresh };
}
