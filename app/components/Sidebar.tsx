"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Tags, 
  AlertTriangle, 
  FileText,
  Truck,
  Moon, 
  Sun 
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Garante que o código do tema só rode no navegador (Client Side)
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const menuItems = [
    { name: "Vendas (PDV)", path: "/", icon: ShoppingCart },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: 'Entrada/Compras', path: '/compras', icon: Truck },
    { name: "Produtos", path: "/produtos", icon: Package },
    { name: "Categorias", path: "/categorias", icon: Tags },
    { name: "Perdas", path: "/perdas", icon: AlertTriangle },
    { name: "Relatórios", path: "/dashboard/relatorios", icon: FileText },
  ];

  return (
    <aside className="w-72 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 transition-colors">
      {/* LOGOTIPO */}
      <div className="mb-10 px-2">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
          Premium<span className="text-blue-600">POS</span>
        </h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Gestão Inteligente</p>
      </div>

      {/* LINKS DE NAVEGAÇÃO */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* BOTÃO DE TROCA DE TEMA (MODERNO E DISCRETO) */}
      <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-all group"
        >
          <div className="flex items-center gap-3">
            {/* O ícone só aparece após o mounted para evitar o erro de hidratação */}
            {mounted && (
              isDark ? <Sun className="text-amber-500" size={18} /> : <Moon className="text-blue-600" size={18} />
            )}
            <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
              Aparência
            </span>
          </div>
          
          {/* Switch Visual */}
          <div className="w-10 h-5 bg-slate-200 dark:bg-slate-800 rounded-full relative p-1">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${isDark ? 'translate-x-5 bg-blue-500' : 'translate-x-0 bg-slate-400'}`} />
          </div>
        </button>
      </div>
    </aside>
  );
}