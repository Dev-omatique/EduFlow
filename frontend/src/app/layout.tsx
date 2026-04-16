"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // ❌ pages sans sidebar
  const noSidebarRoutes = ["/auth/login","/auth/register"];

  const showSidebar = !noSidebarRoutes.includes(pathname);

  return (
    <html lang="fr">
      <body>
        <div className="flex min-h-screen bg-background">
          
          {showSidebar && <Sidebar />}

          <main className={showSidebar ? "ml-[250px] w-full p-6" : "w-full"}>
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}