import type { Metadata, Viewport } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import MuiRegistry from "@/lib/MuiRegistry";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import Box from "@mui/material/Box";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
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
    <html lang="en" className={`${archivoBlack.variable} ${spaceGrotesk.variable}`}>
      <body style={{ margin: 0, background: "#0a0a0a", fontFamily: "var(--font-space-grotesk), system-ui, sans-serif" }}>
        <MuiRegistry>
          <Box sx={{ pb: "64px", minHeight: "100dvh", bgcolor: "background.default", position: "relative" }}>
            {/* Halftone wash — top-left corner */}
            <Box
              sx={{
                position: "fixed",
                inset: 0,
                pointerEvents: "none",
                zIndex: 0,
                backgroundImage: "radial-gradient(rgba(255,45,85,0.15) 1.3px, transparent 1.6px)",
                backgroundSize: "10px 10px",
                maskImage: "linear-gradient(135deg, #000 0%, transparent 55%)",
                WebkitMaskImage: "linear-gradient(135deg, #000 0%, transparent 55%)",
              }}
            />
            {/* Motion-line slash — right side */}
            <Box
              sx={{
                position: "fixed",
                top: -40,
                right: -60,
                width: 260,
                height: "65vh",
                pointerEvents: "none",
                zIndex: 0,
                background: "repeating-linear-gradient(-72deg, rgba(255,45,85,0.10) 0 3px, transparent 3px 9px)",
                transform: "rotate(2deg)",
              }}
            />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              {children}
            </Box>
          </Box>
          <BottomNav />
          <ServiceWorkerRegistrar />
        </MuiRegistry>
      </body>
    </html>
  );
}
