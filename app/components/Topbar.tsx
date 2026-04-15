"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { Moon, Sun, LogOut, User, ChevronDown } from "lucide-react";

export function Topbar() {
  const { data: session } = useSession();
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDark(false);
    } else {
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const userName = session?.user?.name || "";
  const userPerfil = (session?.user as any)?.perfil || "";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 transition-all">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
          Recanto <span className="text-blue-600">PLANALTO</span>
        </h2>
        <span className="hidden sm:block text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] border-l border-slate-200 dark:border-slate-700 pl-3">
          Gestão Inteligente
        </span>
      </div>

      {/* Usuário */}
      {session?.user && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-3 py-2 rounded-xl transition-all"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-black">{initials}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-black text-slate-800 dark:text-white leading-tight">{userName}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{userPerfil}</p>
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden z-50">
              {/* Info mobile */}
              <div className="sm:hidden p-4 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-black text-slate-800 dark:text-white">{userName}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{userPerfil}</p>
              </div>

              {/* Tema */}
              <button
                onClick={() => { toggleTheme(); setMenuOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  {mounted && (isDark ? <Sun className="text-amber-500" size={15} /> : <Moon className="text-blue-600" size={15} />)}
                  {isDark ? "Modo Claro" : "Modo Escuro"}
                </div>
                <div className={`w-8 h-4 rounded-full relative p-1 ${isDark ? "bg-blue-600" : "bg-slate-300"}`}>
                  <div className={`w-2 h-2 bg-white rounded-full transition-all ${isDark ? "translate-x-4" : "translate-x-0"}`} />
                </div>
              </button>

              {/* Sair */}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-[10px] font-black uppercase text-rose-500 tracking-widest border-t border-slate-100 dark:border-slate-800"
              >
                <LogOut size={15} />
                Sair
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
