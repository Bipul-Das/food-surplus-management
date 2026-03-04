// client/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Food Surplus Management",
  description: "Enterprise platform for redistributing food surplus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-brand-light text-brand-dark`}>
        {/* Global Toast Provider replaces all alert() needs */}
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}