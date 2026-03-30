import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alpha System v5 - Election Witness Management",
  description: "Comprehensive election witness management system with performance-based payment module. Manage saksi, TPS, check-ins, vote input, and payments.",
  keywords: ["Alpha System", "Election", "Saksi", "TPS", "Vote Management", "Payment System"],
  authors: [{ name: "Alpha System Team" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Alpha System v5",
    description: "Election Witness Management System",
    url: "https://alpha-system.vercel.app",
    siteName: "Alpha System v5",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alpha System v5",
    description: "Election Witness Management System",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
