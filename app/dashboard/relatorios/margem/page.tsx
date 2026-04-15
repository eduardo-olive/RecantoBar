"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Package, BarChart3 } from "lucide-react";

export default function MargemPage() {
  const [dados, setDados] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ordenar, setOrdenar] = useState<"margem" | "nome" | "potencial">("margem");

  const carregar = async () => {
    const res = await fetch("/api/relatorios/margem");
    if (res.ok) setDados(await res.json());
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  if (loading || !dados) {
    return <div className="flex h-full items-center justify-center"><div className="font-black uppercase italic animate-pulse text-slate-400">Calculando margens...</div></div>;
  }

  const produtosOrdenados = [...dados.produtos].sort((a: any, b: any) => {
    if (ordenar === "margem") return b.margemPercentual - a.margemPercentual;
    if (ordenar === "potencial") return b.potencialLucro - a.potencialLucro;
    return a.nome.localeCompare(b.nome);
  });

  const corMargem = (margem: number) => {
    if (margem >= 50) return "text-emerald-500";
    if (margem >= 30) return "text-blue-500";
    if (margem >= 15) return "text-amber-500";
    return "text-rose-500";
  };

  const bgMargem = (margem: number) => {
    if (margem >= 50) return "bg-emerald-100 dark:bg-emerald-900/30";
    if (margem >= 30) return "bg-blue-100 dark:bg-blue-900/30";
    if (margem >= 15) return "bg-amber-100 dark:bg-amber-900/30";
    return "bg-rose-100 dark:bg-rose-900/30";
  };

  return (
    <div className="space-y-5 pb-8">
      <header className="border-l-4 border-emerald-500 pl-4 py-1">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Margem por Produto</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Analise a rentabilidade de cada produto</p>
      </header>

      {/* RESUMO POR CATEGORIA */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {dados.categorias.map((cat: any) => (
          <div key={cat.nome} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cat.nome}</p>
            <p className={`text-2xl font-black italic mt-1 ${corMargem(cat.margemMedia)}`}>{cat.margemMedia}%</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1">{cat.totalProdutos} produtos | Potencial: R$ {cat.potencialLucro.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* ORDENACAO */}
      <div className="flex gap-2">
        {[
          { key: "margem", label: "Maior Margem" },
          { key: "potencial", label: "Maior Potencial" },
          { key: "nome", label: "A-Z" },
        ].map((o) => (
          <button key={o.key} onClick={() => setOrdenar(o.key as any)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${ordenar === o.key ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
            {o.label}
          </button>
        ))}
      </div>

      {/* TABELA DE PRODUTOS */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <BarChart3 size={18} className="text-emerald-500" />
          <h2 className="font-black uppercase text-sm text-slate-800 dark:text-white tracking-tighter">Detalhamento por Produto</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="p-4">Produto</th>
                <th className="p-4">Categoria</th>
                <th className="p-4 text-right">Custo</th>
                <th className="p-4 text-right">Venda</th>
                <th className="p-4 text-right">Margem R$</th>
                <th className="p-4 text-center">Margem %</th>
                <th className="p-4 text-right">Estoque</th>
                <th className="p-4 text-right">Potencial Lucro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {produtosOrdenados.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-black text-sm uppercase italic text-slate-800 dark:text-white">{p.nome}</td>
                  <td className="p-4 text-xs font-bold text-slate-500 uppercase">{p.categoria}</td>
                  <td className="p-4 text-right text-sm font-bold text-slate-500">R$ {p.precoCusto.toFixed(2)}</td>
                  <td className="p-4 text-right text-sm font-bold text-slate-700 dark:text-slate-200">R$ {p.precoVenda.toFixed(2)}</td>
                  <td className="p-4 text-right font-black text-sm text-emerald-500">R$ {p.margemAbsoluta.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${bgMargem(p.margemPercentual)} ${corMargem(p.margemPercentual)}`}>
                      {p.margemPercentual}%
                    </span>
                  </td>
                  <td className="p-4 text-right text-sm font-bold text-slate-500">{p.estoque}</td>
                  <td className="p-4 text-right font-black text-sm text-blue-500">R$ {p.potencialLucro.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
