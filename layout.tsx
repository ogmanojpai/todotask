
import type { Metadata } from "next";
import { Geist, Geist_Mono, Pacifico } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Tasks - Smart Todo App",
  description: "A beautiful and smart todo application with real-time sync, priority management, and intelligent notifications. Stay organized and never miss important tasks.",
  keywords: "todo, tasks, productivity, organizer, planner, reminders",
  authors: [{ name: "Todo App" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <link 
          href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" 
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geist.variable} ${geistMono.variable} ${pacifico.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
