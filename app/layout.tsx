import type { Metadata, Viewport } from "next";
import { Archivo_Black } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NWSL",
  description: "Your NWSL match center — scores, schedules, and standings",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NWSL",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivoBlack.variable}>
      <body style={{ margin: 0, fontFamily: "var(--font-archivo), system-ui, sans-serif" }}>
        <main style={{ paddingBottom: 64, minHeight: "100dvh" }}>
          {children}
        </main>
        <BottomNav />
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
