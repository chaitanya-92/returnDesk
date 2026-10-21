"use client";

import { useEffect, useRef, useState } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setTheme, type ThemeMode } from "@/lib/store/theme-slice";

function ThemeBridge({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const [hydrated, setHydrated] = useState(false);

  // Restore the saved preference before enabling persistence. This prevents the
  // initial light Redux state from overwriting a previously saved dark choice.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("returndesk-theme");
      if (saved === "light" || saved === "dark") dispatch(setTheme(saved as ThemeMode));
    } catch {
      // Keep the default light theme when browser storage is unavailable.
    } finally {
      setHydrated(true);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.classList.toggle("dark", mode === "dark");
    root.dataset.theme = mode;
    root.style.colorScheme = mode;
    try {
      window.localStorage.setItem("returndesk-theme", mode);
    } catch {
      // Theme remains functional if browser storage is unavailable.
    }
  }, [mode, hydrated]);

  return children;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();

  return <Provider store={storeRef.current}><ThemeBridge>{children}</ThemeBridge></Provider>;
}
