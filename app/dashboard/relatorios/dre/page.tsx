"use client";

import { useState, useEffect } from "react";
import { FileText, TrendingUp, TrendingDown } from "lucide-react";
import { DateRangeFilter } from "../../../components/DateRangeFilter";

export default function DREPage() {
  const [dre, setDre] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const carregar = async (dataInicio = "", dataFim = "") => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dataInicio) params.set("dataInicio", dataInicio);
    if (dataFim) params.set("dataFim", dataFim);

    const res = await fetch(`/api/relatorios/dre?${params}`);
    if (res.ok) setDre(await res.json());
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  if (loading || !dre) {
    return <div className="flex h-full items-center justify-center"><div className="font-black uppercase italic animate-pulse text-slate-400">Carregando DRE...</div></div>;
  }

  const LinhaItem = ({ label, valor, bold, indent, negative }: { label: string; valor: number; bold?: boolean; indent?: boolean; negative?: boolean }) => (
    <div className={`flex justify-between items-center py-3 px-4 ${bold ? "border-t-2 border-slate-300 dark:border-slate-600" : "border-b border-slate-100 dark:border-slate-800"} ${indent ? "ml-6" : ""}`}>
      <span className={`${bold ? "font-black text-sm uppercase" : "font-bold text-sm"} ${indent ? "text-slate-500" : "text-slate-700 dark:text-slate-200"}`}>{label}</span>
      <span className={`font-black text-sm italic ${negative ? "text-rose-500" : valor >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
        {negative ? "- " : ""}R$ {Math.abs(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </span>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      <header className="border-l-4 border-violet-600 pl-6 py-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">DRE - Demonstrativo de Resultado</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Visão completa da performance financeira</p>
      </header>

      <DateRangeFilter onFilter={carregar} />

      {/* CARDS RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-500 p-6 rounded-[32px] shadow-lg text-white">
          <p className="text-emerald-100 font-black uppercase text-[10px] tracking-widest">Receita Bruta</p>
          <p className="text-3xl font-black italic mt-2">R$ {dre.receitaBruta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          <TrendingUp className="mt-2 text-emerald-200" size={20} />
        </div>
        <div className={`p-6 rounded-[32px] shadow-lg text-white ${dre.resultadoLiquido >= 0 ? "bg-blue-600" : "bg-rose-500"}`}>
          <p className="font-black uppercase text-[10px] tracking-widest opacity-70">Resultado Líquido</p>
          <p className="text-3xl font-black italic mt-2">R$ {dre.resultadoLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
          {dre.resultadoLiquido >= 0 ? <TrendingUp className="mt-2 opacity-50" size={20} /> : <TrendingDown className="mt-2 opacity-50" size={20} />}
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Margens</p>
          <div className="mt-3 space-y-2">
            <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Bruta:</span><span className="font-black text-sm text-blue-600">{dre.margemBruta}%</span></div>
            <div className="flex justify-between"><span className="text-xs font-bold text-slate-500">Líquida:</span><span className={`font-black text-sm ${Number(dre.margemLiquida) >= 0 ? "text-emerald-500" : "text-rose-500"}`}>{dre.margemLiquida}%</span></div>
          </div>
        </div>
      </div>

      {/* DRE DETALHADO */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <FileText size={18} className="text-violet-600" />
          <h2 className="font-black uppercase text-sm text-slate-800 dark:text-white tracking-tighter">Demonstrativo Detalhado</h2>
        </div>
        <div className="p-4">
          <LinhaItem label="RECEITA BRUTA (Vendas)" valor={dre.receitaBruta} />
          <LinhaItem label="(-) CMV - Custo da Mercadoria" valor={dre.cmv} indent negative />
          <LinhaItem label="= LUCRO BRUTO" valor={dre.lucroBruto} bold />

          <div className="mt-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Despesas Operacionais</p>
            {Object.entries(dre.despesasOperacionais.porCategoria || {}).map(([cat, val]) => (
              <LinhaItem key={cat} label={cat} valor={val as number} indent negative />
            ))}
            {dre.despesasOperacionais.total === 0 && (
              <p className="text-xs text-slate-400 italic px-10 py-2">Nenhuma despesa no período</p>
            )}
            <LinhaItem label="Total Despesas Operacionais" valor={dre.despesasOperacionais.total} indent negative />
          </div>

          <LinhaItem label="(-) Perdas" valor={dre.perdas} indent negative />
          <LinhaItem label="= RESULTADO LÍQUIDO" valor={dre.resultadoLiquido} bold />

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Outras Movimentações</p>
            <LinhaItem label="Sangrias" valor={dre.sangrias} indent negative />
            <LinhaItem label="Suprimentos" valor={dre.suprimentos} indent />
          </div>
        </div>
      </section>
    </div>
  );
}
