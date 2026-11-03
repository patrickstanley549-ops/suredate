import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Suredate", description: "Your Suredate account" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
