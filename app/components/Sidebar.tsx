"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, ShoppingCart, Package, Tags,
  AlertTriangle, FileText, Truck, Moon, Sun,
  ClipboardList, ChevronDown, Banknote, Coins, Wallet,
  Receipt, BarChart3, CreditCard, TrendingUp,
  Users, Settings, LogOut, User
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [openGroup, setOpenGroup] = useState("operacional");

  const permissoes: string[] = (session?.user as any)?.permissoes || [];
  const temPermissao = (p: string) => permissoes.includes(p) || permissoes.includes("admin");

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const menuGroups = [
    {
      id: "operacional",
      title: "Operacional",
      icon: LayoutDashboard,
      permissao: "vendas",
      items: [
        { name: "Vendas (PDV)", path: "/", icon: ShoppingCart },
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      ]
    },
    {
      id: "estoque",
      title: "Estoque",
      icon: Package,
      permissao: "estoque",
      items: [
        { name: 'Entrada/Compras', path: '/compras', icon: Truck },
        { name: "Produtos", path: "/produtos", icon: Package },
        { name: "Categorias", path: "/categorias", icon: Tags },
        { name: "Perdas", path: "/perdas", icon: AlertTriangle },
      ]
    },
    {
      id: "financeiro",
      title: "Financeiro",
      icon: Wallet,
      permissao: "financeiro",
      items: [
        { name: "Caixa / Fluxo", path: "/caixa", icon: Banknote },
        { name: "Abrir Caixa", path: "/caixa/saldo-inicial", icon: Coins },
        { name: "Despesas", path: "/despesas", icon: Receipt },
        { name: "Contas Pagar/Receber", path: "/contas", icon: CreditCard },
        { name: "Relatórios", path: "/dashboard/relatorios", icon: FileText },
        { name: "DRE", path: "/dashboard/relatorios/dre", icon: TrendingUp },
        { name: "Margem Produtos", path: "/dashboard/relatorios/margem", icon: BarChart3 },
        { name: "Sugestão de Compra", path: "/dashboard/relatorios/compras", icon: ClipboardList },
      ]
    },
    {
      id: "admin",
      title: "Configurações",
      icon: Settings,
      permissao: "admin",
      items: [
        { name: "Usuários", path: "/usuarios", icon: Users },
        { name: "Perfis / Cargos", path: "/configuracoes", icon: Settings },
      ]
    }
  ];

  const toggleGroup = (id: string) => {
    setOpenGroup(openGroup === id ? "" : id);
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <aside className="w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-6 transition-all overflow-hidden">
      <div className="mb-8 px-2 text-center">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
          Recanto <span className="text-blue-600">PLANALTO</span>
        </h2>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Gestão Inteligente</p>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {menuGroups.filter(g => temPermissao(g.permissao)).map((group) => (
          <div key={group.id} className="space-y-1">
            <button
              onClick={() => toggleGroup(group.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                openGroup === group.id ? "bg-slate-100 dark:bg-slate-800/50" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <group.icon size={18} className={openGroup === group.id ? "text-blue-600" : "text-slate-400"} />
                <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                  {group.title}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${openGroup === group.id ? "rotate-180 text-blue-600" : "text-slate-400"}`}
              />
            </button>

            <div className={`overflow-hidden transition-all duration-300 space-y-1 ${
              openGroup === group.id ? "max-h-[500px] opacity-100 mt-1" : "max-h-0 opacity-0"
            }`}>
              {group.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-4 ml-4 px-4 py-2.5 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "text-slate-500 dark:text-slate-400 hover:text-blue-500"
                    }`}
                  >
                    <item.icon size={14} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* USUARIO + APARENCIA */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {/* Info do usuario */}
        {session?.user && (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="bg-blue-600/10 p-1.5 rounded-lg flex-shrink-0">
                <User size={14} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-700 dark:text-white truncate">{session.user.name}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{(session.user as any).perfil}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-slate-400 hover:text-rose-500 transition-colors p-1.5 flex-shrink-0"
              title="Sair"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}

        {/* Tema */}
        <button onClick={toggleTheme} className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500">
            {mounted && (isDark ? <Sun className="text-amber-500" size={14} /> : <Moon className="text-blue-600" size={14} />)}
            Aparência
          </div>
          <div className={`w-8 h-4 rounded-full relative p-1 ${isDark ? 'bg-blue-600' : 'bg-slate-300'}`}>
            <div className={`w-2 h-2 bg-white rounded-full transition-all ${isDark ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>
    </aside>
  );
}
