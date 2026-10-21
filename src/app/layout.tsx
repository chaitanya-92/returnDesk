import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReturnDesk | Returns Operations",
  description: "A clear workspace for managing return and replacement requests.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
