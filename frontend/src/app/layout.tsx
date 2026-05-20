"use client";

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <main className="min-h-screen w-full bg-background">
          {children}
        </main>
      </body>
    </html>
  );
}