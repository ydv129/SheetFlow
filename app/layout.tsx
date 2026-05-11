import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://sheetflow.ai"),
  title: "SheetFlow AI | Privacy-First Excel Analytics & Local AI",
  description: "Experience the future of spreadsheet analysis. Talk to your Excel files with local-first AI that keeps your data 100% private. No cloud, no tracking, just insights.",
  keywords: ["Excel AI", "Local AI", "Privacy-first Data Analysis", "Spreadsheet Insights", "MSME Tools", "WebLLM", "SheetJS"],
  authors: [{ name: "SheetFlow Team" }],
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SheetFlow AI | Private Excel Analytics",
    description: "Transform your spreadsheets into conversational insights without ever leaving your device.",
    url: "https://sheetflow.ai",
    siteName: "SheetFlow AI",
    images: [
      {
        url: "/assets/screenshots/hero.png",
        width: 1200,
        height: 630,
        alt: "SheetFlow AI Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SheetFlow AI | Private Excel Analytics",
    description: "Your data stays on your computer. Talk to your spreadsheets with local-first AI.",
    images: ["/assets/screenshots/hero.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SheetFlow AI",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProvider>
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
