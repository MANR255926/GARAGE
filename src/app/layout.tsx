import type { Metadata } from "next";
import { Oswald, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";

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

export const metadata: Metadata = {
  title: "Allyan Garage Admin",
  description: "Workshop management dashboard for Allyan Garage",
};

// Blocking inline script — runs before paint to eliminate FOUC.
// Reads localStorage first, then falls back to prefers-color-scheme.
const themeScript = `
(function(){
  try{
    var saved=localStorage.getItem('ag-theme');
    if(saved==='dark'||(!saved&&window.matchMedia('(prefers-color-scheme:dark)').matches)){
      document.documentElement.classList.add('dark');
    }
  }catch(e){}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${oswald.variable} ${inter.variable} ${ibmPlexMono.variable} theme-transition`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
