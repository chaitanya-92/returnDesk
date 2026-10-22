"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store";

function LightThemeBridge({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.dataset.theme = "light";
    root.style.colorScheme = "light";
    try {
      window.localStorage.setItem("returndesk-theme", "light");
    } catch {
      // The fixed light theme does not depend on browser storage.
    }
  }, []);

  return children;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();

  return (
    <Provider store={storeRef.current}>
      <LightThemeBridge>{children}</LightThemeBridge>
    </Provider>
  );
}
