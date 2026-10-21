"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store";
import { useAppSelector } from "@/lib/store/hooks";

function ThemeBridge({ children }: { children: React.ReactNode }) {
  const mode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.dataset.theme = mode;
    root.style.colorScheme = mode;
    try {
      window.localStorage.setItem("returndesk-theme", mode);
    } catch {
      // Theme remains functional if browser storage is unavailable.
    }
  }, [mode]);

  return children;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("returndesk-theme");
      if (saved === "light" || saved === "dark") {
        storeRef.current?.dispatch({ type: "theme/setTheme", payload: saved });
      }
    } catch {
      // Use light mode when storage is unavailable.
    }
  }, []);

  return <Provider store={storeRef.current}><ThemeBridge>{children}</ThemeBridge></Provider>;
}
