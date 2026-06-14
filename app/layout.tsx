import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { themeInitScript } from "@/components/layout/ThemeToggle";

// Body text — Inter is the de-facto professional UI typeface.
const sans = Inter({
  variable: "--font-sans-src",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});
// Headings / wordmark — gives the UI a distinct, modern character.
const display = Plus_Jakarta_Sans({
  variable: "--font-display-src",
  subsets: ["latin"],
  display: "swap",
  fallback: ["system-ui", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
});
// Code / monospace surfaces.
const mono = JetBrains_Mono({
  variable: "--font-mono-src",
  subsets: ["latin"],
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
});

export const metadata: Metadata = {
  title: {
    default: "ToolNook — A quiet workspace of professional tools",
    template: "%s — ToolNook",
  },
  description:
    "Focused browser-native tools for developers and writers. Everything runs client-side — your data never leaves the tab.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${sans.variable} ${display.variable} ${mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
