import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

// Define the custom font
const saintRegus = localFont({
  src: "../public/fonts/SaintRegus-SemiBoldCondensed.otf",
  variable: "--font-saint-regus",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VIBE-LAB | Collectible Music Cards",
  description: "Advanced music intelligence visualization and digital collectibles.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body 
        className={`${saintRegus.variable} bg-neutral-950 text-neutral-100 antialiased selection:bg-cyan-500/30`}
      >
        {/* We set bg-neutral-950 here to prevent white flickering 
          on page transitions and ensure the "vibe" is consistent.
        */}
        {children}
      </body>
    </html>
  );
}