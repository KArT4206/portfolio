import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, Space_Mono, JetBrains_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HudCursor from "@/components/hud/HudCursor";
import MatrixField from "@/components/hud/MatrixField";
import ScanLine from "@/components/hud/ScanLine";
import BootSequence from "@/components/hud/BootSequence";
import HudTelemetry from "@/components/hud/HudTelemetry";
import EasterEggs from "@/components/hud/EasterEggs";
import FunSystem from "@/components/fun/FunSystem";
import { getSiteSettings } from "@/lib/siteSettings";

// GT Planar (the real, paid Grilli Type face this system is built around)
// isn't licensed here — using the fallback stack the design system itself
// specifies: Space Grotesk for body through mid-display, Space Mono for the
// largest display sizes, JetBrains Mono for tabular/data contexts.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Karthik B — Full-Stack Engineer & AI/ML Researcher",
  description:
    "Portfolio of Karthik B — full-stack developer, applied AI/ML researcher, and embedded systems engineer. Building the Enrollment Governance & Management Platform, IEEE-published fog-computing research, and more.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <MatrixField interactionEnabled={settings.matrixInteractionEnabled} />
        <BootSequence />
        <ScanLine />
        <HudCursor />
        <HudTelemetry />
        <EasterEggs maxWarpEnabled={settings.maxWarpEnabled} />
        <FunSystem settings={settings} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
