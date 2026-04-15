"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard, ShoppingCart, Package, Tags,
  AlertTriangle, FileText, Truck,
  ClipboardList, ChevronDown, Banknote, Coins, Wallet,
  Receipt, BarChart3, CreditCard, TrendingUp, ArrowRightLeft,
  Users, Settings, ClipboardCheck, Grid3X3, UtensilsCrossed,
  BookOpen
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openGroup, setOpenGroup] = useState("operacional");

  const permissoes: string[] = (session?.user as any)?.permissoes || [];
  const temPermissao = (p: string) => permissoes.includes(p) || permissoes.includes("admin");

  const menuGroups = [
    {
      id: "operacional",
      title: "Operacional",
      icon: LayoutDashboard,
      permissao: "vendas",
      items: [
        { name: "Vendas (PDV)", path: "/", icon: ShoppingCart },
        { name: "Mesas", path: "/mesas", icon: Grid3X3 },
        { name: "Cozinha", path: "/cozinha", icon: UtensilsCrossed },
        { name: "Trocas", path: "/trocas", icon: ArrowRightLeft },
        { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      ]
    },
    {
      id: "estoque",
      title: "Estoque",
      icon: Package,
      permissao: "estoque",
      items: [
        { name: "Entrada/Compras", path: "/compras", icon: Truck },
        { name: "Produtos", path: "/produtos", icon: Package },
        { name: "Categorias", path: "/categorias", icon: Tags },
        { name: "Ajuste Estoque", path: "/ajuste-estoque", icon: ClipboardCheck },
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
        { name: "Cat. Despesas", path: "/categorias-despesa", icon: Tags },
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
        { name: "Guia do Sistema", path: "/guia", icon: BookOpen },
      ]
    }
  ];

  const toggleGroup = (id: string) => {
    setOpenGroup(openGroup === id ? "" : id);
  };

  // Verificar se algum item do grupo está ativo
  const isGroupActive = (items: { path: string }[]) =>
    items.some((item) => pathname === item.path);

  // === MODO COLAPSADO: só ícones ===
  if (collapsed) {
    return (
      <aside className="w-16 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-4 gap-1 overflow-y-auto custom-scrollbar transition-all">
        {menuGroups.filter(g => temPermissao(g.permissao)).map((group) => (
          <div key={group.id} className="flex flex-col items-center gap-1 w-full px-2">
            {group.items.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title={item.name}
                >
                  <item.icon size={18} />
                </Link>
              );
            })}
            {/* Separador entre grupos */}
            <div className="w-6 h-px bg-slate-200 dark:bg-slate-800 my-1" />
          </div>
        ))}
      </aside>
    );
  }

  // === MODO EXPANDIDO: completo ===
  return (
    <aside className="w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-5 pt-4 transition-all overflow-hidden">
      <nav className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        {menuGroups.filter(g => temPermissao(g.permissao)).map((group) => (
          <div key={group.id} className="space-y-1">
            <button
              onClick={() => toggleGroup(group.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all ${
                openGroup === group.id ? "bg-slate-100 dark:bg-slate-800/50" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <group.icon size={18} className={openGroup === group.id || isGroupActive(group.items) ? "text-blue-600" : "text-slate-400"} />
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
    </aside>
  );
}
