"use client";

import { useState, useEffect } from "react";
import { Receipt, Plus, History } from "lucide-react";

const SUBCATEGORIAS = [
  "ALUGUEL", "LUZ", "AGUA", "INTERNET", "SALARIOS",
  "FORNECEDORES", "MANUTENCAO", "LIMPEZA", "OUTROS"
];

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<any[]>([]);
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [subcategoria, setSubcategoria] = useState("OUTROS");
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    const res = await fetch("/api/movimentacoes?categoria=DESPESA");
    if (res.ok) setDespesas(await res.json());
  };

  useEffect(() => { carregar(); }, []);

  const registrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valor || !descricao) { alert("Preencha todos os campos!"); return; }
    setLoading(true);

    const res = await fetch("/api/movimentacoes/despesa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor: Number(valor), descricao, subcategoria }),
    });

    if (res.ok) {
      setValor(""); setDescricao(""); setSubcategoria("OUTROS");
      carregar();
      alert("Despesa registrada!");
    } else {
      const err = await res.json();
      alert(err.error);
    }
    setLoading(false);
  };

  const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);

  return (
    <div className="space-y-8 pb-10">
      <header className="border-l-4 border-rose-500 pl-6 py-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Despesas Operacionais</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Registre aluguel, contas, salários e outras despesas</p>
      </header>

      {/* FORMULARIO */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={registrar} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Categoria</label>
            <select value={subcategoria} onChange={(e) => setSubcategoria(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl font-bold uppercase text-sm outline-none appearance-none cursor-pointer">
              {SUBCATEGORIAS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Descrição</label>
            <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl font-bold outline-none text-sm"
              placeholder="Ex: Conta de luz março" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Valor (R$)</label>
            <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl font-bold outline-none text-sm"
              placeholder="0.00" />
          </div>
          <button type="submit" disabled={loading}
            className="bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50">
            <Plus size={16} /> Registrar
          </button>
        </form>
      </section>

      {/* RESUMO */}
      <div className="bg-rose-500 p-6 rounded-[32px] shadow-lg shadow-rose-500/20 text-white flex justify-between items-center">
        <div>
          <p className="text-rose-200 font-black uppercase text-[10px] tracking-widest">Total de Despesas</p>
          <p className="text-3xl font-black italic">R$ {totalDespesas.toFixed(2)}</p>
        </div>
        <Receipt size={32} className="text-rose-200" />
      </div>

      {/* HISTORICO */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <History size={18} className="text-rose-500" />
          <h2 className="font-black uppercase text-sm text-slate-800 dark:text-white tracking-tighter">Histórico de Despesas</h2>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <th className="p-4">Data</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Descrição</th>
              <th className="p-4 text-right">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {despesas.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="p-4 text-xs font-bold text-slate-500">{new Date(d.data).toLocaleDateString("pt-BR")}</td>
                <td className="p-4"><span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-3 py-1 rounded-full text-[9px] font-black uppercase">{d.subcategoria || "OUTROS"}</span></td>
                <td className="p-4 font-bold text-sm text-slate-700 dark:text-slate-200 uppercase italic">{d.desc}</td>
                <td className="p-4 text-right font-black text-rose-500">R$ {d.valor.toFixed(2)}</td>
              </tr>
            ))}
            {despesas.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400 font-bold italic">Nenhuma despesa registrada</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
