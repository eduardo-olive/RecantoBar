"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();

  const isLoginPage = pathname === "/login";
  const isAuthenticated = status === "authenticated";

  // Na pagina de login, renderiza so o conteudo
  if (isLoginPage || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-72 h-screen fixed left-0 top-0 z-40">
        <Sidebar />
      </div>
      <main className="flex-1 ml-72 min-h-screen">
        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
