import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cinzel, Inter, Instrument_Serif, JetBrains_Mono, Noto_Sans_Egyptian_Hieroglyphs } from "next/font/google";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EasterEggs from "@/components/hud/EasterEggs";
import FunSystem from "@/components/fun/FunSystem";
import IntroLoader from "@/components/IntroLoader";
import { getSiteSettings } from "@/lib/siteSettings";

// Inter is bound to the existing display/sans variable names so every
// font-display / font-sans utility on the site picks it up without edits.
const interSans = Inter({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
});

const interDisplay = Inter({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["800", "900"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

// Only used in blackout "tomb" mode, so they aren't preloaded.
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["600", "800"],
  preload: false,
});

const hieroglyphs = Noto_Sans_Egyptian_Hieroglyphs({
  variable: "--font-hiero",
  subsets: ["egyptian-hieroglyphs"],
  weight: "400",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Karthik B — Full-Stack Engineer & AI/ML Researcher",
  description:
    "Portfolio of Karthik B — full-stack developer, applied AI/ML researcher, and embedded systems engineer, available for freelance projects. Building the Enrollment Governance & Management Platform, IEEE-published fog-computing research, and more.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${interSans.variable} ${interDisplay.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} ${cinzel.variable} ${hieroglyphs.variable} h-full antialiased`}
    >
      <body className="site-mono min-h-full flex flex-col bg-background text-foreground">
        <IntroLoader />
        <EasterEggs maxWarpEnabled={settings.maxWarpEnabled} />
        <FunSystem settings={settings} />
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
