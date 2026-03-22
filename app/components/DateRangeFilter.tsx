"use client";

import { useState } from "react";
import { Calendar, RotateCcw } from "lucide-react";

interface DateRangeFilterProps {
  onFilter: (dataInicio: string, dataFim: string) => void;
}

export function DateRangeFilter({ onFilter }: DateRangeFilterProps) {
  const today = new Date().toISOString().split("T")[0];
  const [dataInicio, setDataInicio] = useState(today);
  const [dataFim, setDataFim] = useState(today);

  const aplicar = (inicio: string, fim: string) => {
    setDataInicio(inicio);
    setDataFim(fim);
    onFilter(inicio, fim);
  };

  const presets = [
    {
      label: "Hoje",
      fn: () => aplicar(today, today),
    },
    {
      label: "7 dias",
      fn: () => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        aplicar(d.toISOString().split("T")[0], today);
      },
    },
    {
      label: "30 dias",
      fn: () => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        aplicar(d.toISOString().split("T")[0], today);
      },
    },
    {
      label: "Este Mês",
      fn: () => {
        const d = new Date();
        const inicio = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
        aplicar(inicio, today);
      },
    },
    {
      label: "Tudo",
      fn: () => aplicar("", ""),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
      <Calendar size={16} className="text-blue-600" />
      <input
        type="date"
        value={dataInicio}
        onChange={(e) => setDataInicio(e.target.value)}
        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-bold outline-none"
      />
      <span className="text-slate-400 font-bold text-xs">até</span>
      <input
        type="date"
        value={dataFim}
        onChange={(e) => setDataFim(e.target.value)}
        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-bold outline-none"
      />
      <button
        onClick={() => onFilter(dataInicio, dataFim)}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
      >
        Filtrar
      </button>
      {presets.map((p) => (
        <button
          key={p.label}
          onClick={p.fn}
          className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
