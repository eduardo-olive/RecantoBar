"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();

  // Pagina de login nunca mostra sidebar
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Enquanto verifica sessao, mostra loading
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-black">
        <div className="font-black uppercase italic animate-pulse text-slate-400 text-sm">Carregando...</div>
      </div>
    );
  }

  // Nao autenticado - mostra so o conteudo (middleware redireciona para login)
  if (status === "unauthenticated") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <div className="w-64 h-screen fixed left-0 top-16 z-30">
        <Sidebar />
      </div>
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <div className="fixed top-0 left-0 right-0 z-40">
          <Topbar />
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
