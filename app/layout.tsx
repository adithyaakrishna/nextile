import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.PUBLIC_ORIGIN ?? "http://localhost:3000"),
  title: "Nextile: a daily sixty-second puzzle",
  description: "One visual logic puzzle a day. Find the pattern, pick what comes next. Sixty seconds, one try.",
  openGraph: { type: "website", siteName: "Nextile" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#cddfd2" },
    { media: "(prefers-color-scheme: dark)", color: "#183528" },
  ],
};

// Applies saved theme and color-assist preferences before first paint, so nothing flashes
const PREFS_SCRIPT = `try{var s=JSON.parse(localStorage.getItem("nextile")||"null");var p=s&&s.prefs;var r=document.documentElement;if(p&&(p.theme==="light"||p.theme==="dark"))r.dataset.theme=p.theme;r.dataset.colorAssist=p&&p.colorAssist?"on":"off";}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={archivo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body className="antialiased">
        <a href="#main" className="btn press sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
