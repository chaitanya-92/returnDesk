"use client";

import { useCallback, useEffect, useState } from "react";
import type { DashboardData } from "../types";

type DashboardApiResponse = {
  data?: DashboardData;
  error?: { message?: string };
  message?: string;
};

const FALLBACK_ERROR = "Unable to load dashboard data.";

/** Owns dashboard fetching and loading/error state, leaving the page presentational. */
export function useDashboardData() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/dashboard", { cache: "no-store" });
      const payload = (await response.json()) as DashboardApiResponse;

      if (!response.ok) {
        throw new Error(
          payload.error?.message ?? payload.message ?? FALLBACK_ERROR,
        );
      }

      if (
        !payload.data?.metrics ||
        !Array.isArray(payload.data.recent) ||
        !Array.isArray(payload.data.reasons) ||
        !Array.isArray(payload.data.pendingApprovals)
      ) {
        throw new Error("The dashboard returned an unexpected response.");
      }

      setDashboard(payload.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : FALLBACK_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { dashboard, loading, error, refresh };
}
