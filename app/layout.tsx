import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import MuiRegistry from "@/lib/MuiRegistry";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import Box from "@mui/material/Box";

const roboto = Roboto({ subsets: ["latin"], weight: ["300", "400", "500", "700"] });

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
  themeColor: "#1a1a2e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={roboto.className} style={{ margin: 0 }}>
        <MuiRegistry>
          <Box sx={{ pb: "56px", minHeight: "100dvh", bgcolor: "background.default" }}>
            {children}
          </Box>
          <BottomNav />
          <ServiceWorkerRegistrar />
        </MuiRegistry>
      </body>
    </html>
  );
}
