"use client";

import { useState, useEffect } from "react";
import { Search, Save, Package, RotateCcw, ClipboardCheck } from "lucide-react";

interface Ajuste {
  novoEstoque?: number;
  precoCusto?: number;
  precoVenda?: number;
}

export default function AjusteEstoquePage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [ajustes, setAjustes] = useState<Record<string, Ajuste>>({});
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setLoading(true);
    const res = await fetch("/api/produtos");
    if (res.ok) setProdutos(await res.json());
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const setValor = (id: string, campo: keyof Ajuste, valor: number, valorOriginal: number) => {
    setAjustes(prev => {
      const atual = prev[id] || {};
      const novo = { ...atual, [campo]: valor };

      // Se todos os campos voltaram ao original, remove o ajuste
      const p = produtos.find(p => p.id === id);
      if (!p) return prev;

      const estoqueIgual = (novo.novoEstoque ?? p.estoque) === p.estoque;
      const custoIgual = (novo.precoCusto ?? p.precoCusto) === p.precoCusto;
      const vendaIgual = (novo.precoVenda ?? p.precoVenda) === p.precoVenda;

      if (estoqueIgual && custoIgual && vendaIgual) {
        const semEste = { ...prev };
        delete semEste[id];
        return semEste;
      }

      return { ...prev, [id]: novo };
    });
  };

  const totalAlterados = Object.keys(ajustes).length;

  const salvarTodos = async () => {
    if (totalAlterados === 0) return;
    setSalvando(true);

    const lista = Object.entries(ajustes).map(([produtoId, a]) => ({
      produtoId,
      ...a,
    }));

    const res = await fetch("/api/produtos/ajuste-estoque", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ajustes: lista }),
    });

    if (res.ok) {
      setAjustes({});
      carregar();
      alert(`${lista.length} produto(s) atualizado(s)!`);
    } else {
      const err = await res.json();
      alert(err.error);
    }
    setSalvando(false);
  };

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="font-black uppercase italic animate-pulse text-slate-400">Carregando produtos...</div></div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="border-l-4 border-indigo-600 pl-6 py-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Ajuste de Estoque</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Corrija estoque, preço de custo e preço de venda</p>
      </header>

      {/* BARRA DE BUSCA + SALVAR */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="PESQUISAR PRODUTO..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 pl-11 rounded-2xl text-[11px] font-black uppercase italic outline-none focus:ring-2 ring-indigo-500/20 shadow-sm"
          />
        </div>
        {totalAlterados > 0 && (
          <div className="flex items-center gap-3">
            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
              {totalAlterados} alterado(s)
            </span>
            <button onClick={() => setAjustes({})} className="text-slate-400 hover:text-rose-500 transition-colors p-2" title="Limpar alterações">
              <RotateCcw size={16} />
            </button>
            <button
              onClick={salvarTodos}
              disabled={salvando}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              <Save size={16} /> {salvando ? "Salvando..." : "Salvar Tudo"}
            </button>
          </div>
        )}
      </div>

      {/* TABELA */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <ClipboardCheck size={18} className="text-indigo-600" />
          <h2 className="font-black uppercase text-sm text-slate-800 dark:text-white tracking-tighter">Produtos ({produtosFiltrados.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="p-4">Produto</th>
                <th className="p-4 text-center">Estoque</th>
                <th className="p-4 text-center">Custo (R$)</th>
                <th className="p-4 text-center">Venda (R$)</th>
                <th className="p-4 text-center">Margem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {produtosFiltrados.map((p) => {
                const ajuste = ajustes[p.id];
                const ajustado = !!ajuste;

                const estoque = ajuste?.novoEstoque ?? p.estoque;
                const custo = ajuste?.precoCusto ?? p.precoCusto;
                const venda = ajuste?.precoVenda ?? p.precoVenda;
                const margem = venda > 0 ? (((venda - custo) / venda) * 100) : 0;

                return (
                  <tr key={p.id} className={`transition-colors ${ajustado ? "bg-indigo-50/50 dark:bg-indigo-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}>
                    <td className="p-4">
                      <p className="font-black text-sm uppercase italic text-slate-800 dark:text-white">{p.nome}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{p.categoria?.nome || ""}</p>
                    </td>
                    <td className="p-4 text-center">
                      <input
                        type="number" min="0"
                        value={estoque}
                        onChange={(e) => setValor(p.id, "novoEstoque", parseInt(e.target.value) || 0, p.estoque)}
                        className={`w-20 text-center bg-slate-50 dark:bg-slate-950 border rounded-lg p-2 font-black text-sm outline-none transition-all ${
                          ajuste?.novoEstoque !== undefined && ajuste.novoEstoque !== p.estoque
                            ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-200 dark:border-slate-800"
                        }`}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <input
                        type="number" min="0" step="0.01"
                        value={custo}
                        onChange={(e) => setValor(p.id, "precoCusto", parseFloat(e.target.value) || 0, p.precoCusto)}
                        className={`w-24 text-center bg-slate-50 dark:bg-slate-950 border rounded-lg p-2 font-bold text-sm outline-none transition-all ${
                          ajuste?.precoCusto !== undefined && ajuste.precoCusto !== p.precoCusto
                            ? "border-indigo-500 ring-2 ring-indigo-500/20" : "border-slate-200 dark:border-slate-800"
                        }`}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <input
                        type="number" min="0" step="0.01"
                        value={venda}
                        onChange={(e) => setValor(p.id, "precoVenda", parseFloat(e.target.value) || 0, p.precoVenda)}
                        className={`w-24 text-center bg-slate-50 dark:bg-slate-950 border rounded-lg p-2 font-bold text-sm outline-none transition-all ${
                          ajuste?.precoVenda !== undefined && ajuste.precoVenda !== p.precoVenda
                            ? "border-blue-500 ring-2 ring-blue-500/20" : "border-slate-200 dark:border-slate-800"
                        }`}
                      />
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-black text-sm ${margem >= 50 ? "text-emerald-500" : margem >= 30 ? "text-blue-500" : margem >= 15 ? "text-amber-500" : "text-rose-500"}`}>
                        {margem.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
