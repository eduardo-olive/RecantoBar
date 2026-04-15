"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("sidebarOpen");
    if (saved !== null) setSidebarOpen(saved === "true");
  }, []);

  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    localStorage.setItem("sidebarOpen", String(next));
  };

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-black">
        <div className="font-black uppercase italic animate-pulse text-slate-400 text-sm">Carregando...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <>{children}</>;
  }

  const sidebarWidth = sidebarOpen ? "w-64" : "w-16";
  const contentMargin = sidebarOpen ? "ml-64" : "ml-16";

  return (
    <div className="flex min-h-screen">
      <div className={`${sidebarWidth} h-screen fixed left-0 top-16 z-30 transition-all duration-300`}>
        <Sidebar collapsed={!sidebarOpen} />
      </div>
      <div className={`flex-1 ${contentMargin} flex flex-col min-h-screen transition-all duration-300`}>
        <div className="fixed top-0 left-0 right-0 z-40">
          <Topbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        </div>
        <main className="flex-1 mt-16 min-h-0">
          <div className="p-5 lg:p-7 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
