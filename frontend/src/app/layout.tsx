"use client";

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <main className="min-h-screen w-full bg-background">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}