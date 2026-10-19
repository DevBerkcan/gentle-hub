import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: {
    default: "GentleHub",
    template: "%s · GentleHub",
  },
  description: "Apps, Kundenprojekte und Zugänge der Gentle Group.",
  applicationName: "GentleHub",
  robots: { index: false, follow: false, nocache: true },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${inter.variable} ${geist.variable}`}>
      <body>{children}</body>
    </html>
  );
}
