import "./globals.css";
import { Cormorant_Garamond, Great_Vibes } from "next/font/google";
import type { ReactNode } from "react";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes"
});

export const metadata = {
  title: "N&D Wedding",
  description: "Celebrate with us — wedding details, RSVP, and memories on a single page."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${cormorant.className} ${greatVibes.variable}`}>{children}</body>
    </html>
  );
}

