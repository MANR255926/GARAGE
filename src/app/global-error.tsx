"use client";

import { useEffect } from "react";
import { Oswald, Inter, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { ErrorScene } from "@/components/shared/ErrorScene";
import "./globals.css";

const oswald = Oswald({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical root error caught by global-error.tsx:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className={`${oswald.variable} ${inter.variable} ${ibmPlexMono.variable}`}>
        <ThemeProvider>
          <ErrorScene
            code="500"
            title="Critical System Failure"
            message={
              error?.message ||
              "A critical workshop breakdown occurred. Please retry or return to the main dashboard."
            }
            primaryAction={{
              label: "Back to Home",
              href: "/",
            }}
            secondaryAction={{
              label: "Try Again",
              onClick: reset,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}