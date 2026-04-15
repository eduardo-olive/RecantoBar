"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, History } from "lucide-react";
import { useToast } from "../components/Toast";

export default function PerdasPage() {
  const toast = useToast();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [perdas, setPerdas] = useState<any[]>([]);
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState("VENCIMENTO");
  const [loading, setLoading] = useState(false);

  const carregar = async () => {
    const [resProd, resPerdas] = await Promise.all([
      fetch("/api/produtos"),
      fetch("/api/perdas"),
    ]);
    if (resProd.ok) setProdutos(await resProd.json());
    if (resPerdas.ok) setPerdas(await resPerdas.json());
  };

  useEffect(() => { carregar(); }, []);

  const handleConfirmarPerda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoId || !quantidade) {
      toast.warning("Selecione um produto e a quantidade!");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/perdas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produtoId, qtd: Number(quantidade), motivo }),
    });

    if (res.ok) {
      const data = await res.json();
      setProdutoId("");
      setQuantidade("");
      setMotivo("VENCIMENTO");
      carregar();
      toast.success(`Perda registrada! Valor: R$ ${data.valorPerda.toFixed(2)}`);
    } else {
      const err = await res.json();
      toast.error(err.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-5 min-h-screen pb-8">
      <header className="border-l-4 border-amber-600 dark:border-amber-500 pl-4 py-1">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-600 dark:bg-amber-500 rounded-lg shadow-lg">
            <AlertTriangle className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Registro de Perdas
          </h1>
        </div>
        <p className="text-slate-500 dark:text-gray-400 mt-0.5 text-lg font-medium italic">
          Controle de quebras, vencimentos e consumo interno
        </p>
      </header>

      <section className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
        <form onSubmit={handleConfirmarPerda} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Produto</label>
            <select
              value={produtoId}
              onChange={(e) => setProdutoId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:border-amber-500 transition-all uppercase appearance-none cursor-pointer"
            >
              <option value="">Selecione o item...</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.id}>{p.nome} (Saldo: {p.estoque})</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Quantidade</label>
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder="0"
              className="bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:border-amber-500 transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">Motivo</label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 p-4 rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:border-amber-500 transition-all cursor-pointer appearance-none uppercase"
            >
              <option value="VENCIMENTO">Vencimento</option>
              <option value="QUEBRA">Quebra/Avaria</option>
              <option value="CONSUMO">Consumo Interno</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full md:col-span-3 mt-4 bg-amber-600 hover:bg-amber-500 text-white font-black py-5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 uppercase tracking-widest text-lg disabled:opacity-50">
            <AlertTriangle size={24} />
            {loading ? "Registrando..." : "Confirmar Lançamento de Perda"}
          </button>
        </form>
      </section>

      <section className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
          <h2 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
            <History size={20} className="text-slate-400" /> Histórico de Ocorrências
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/40 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="p-6 text-center">Data</th>
                <th className="p-6">Produto</th>
                <th className="p-6 text-center">Quantidade</th>
                <th className="p-6 text-right">Valor Perdido</th>
                <th className="p-6 text-right">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {perdas.length > 0 ? (
                perdas.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="p-6 text-sm text-slate-500 font-bold text-center">
                      {new Date(p.data).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-6 font-black text-white text-lg uppercase">
                      {p.produto?.nome || "Produto Excluído"}
                    </td>
                    <td className="p-6 text-center font-black text-red-500 text-xl">-{p.qtd}</td>
                    <td className="p-6 text-right font-black text-rose-400">
                      R$ {((p.produto?.precoCusto || 0) * p.qtd).toFixed(2)}
                    </td>
                    <td className="p-6 text-right">
                      <span className="bg-amber-900/30 text-amber-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase border border-amber-800/50">
                        {p.motivo}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-600 font-bold italic">Nenhuma perda registrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
