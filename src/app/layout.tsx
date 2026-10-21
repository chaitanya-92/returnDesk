import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/providers";

export const metadata: Metadata = {
  title: "ReturnDesk | Returns Operations",
  description: "A clear workspace for managing return and replacement requests.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try { var t = localStorage.getItem("returndesk-theme"); if (t === "dark") { document.documentElement.classList.add("dark"); document.documentElement.dataset.theme = "dark"; document.documentElement.style.colorScheme = "dark"; } else { document.documentElement.classList.remove("dark"); document.documentElement.dataset.theme = "light"; document.documentElement.style.colorScheme = "light"; } } catch (_) {}` }} />
      </head>
      <body><AppProviders>{children}</AppProviders></body>
    </html>
  );
}
