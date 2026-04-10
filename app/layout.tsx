import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SheetFlow AI - Excel Analytics",
  description: "Local-first AI analysis for Excel files",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
