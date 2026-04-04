"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, ChefHat, CheckCircle2, Truck, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface ItemCozinha {
  id: string;
  quantidade: number;
  status: string;
  mesaNumero: number | null;
  observacao: string | null;
  criadoEm: string;
  produto: { nome: string };
  pedido: { id: string; criadoEm: string };
}

export default function CozinhaPage() {
  const [itens, setItens] = useState<ItemCozinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState<string | null>(null);
  const [showEntregues, setShowEntregues] = useState(false);
  const [entregues, setEntregues] = useState<ItemCozinha[]>([]);

  const carregar = useCallback(async () => {
    const res = await fetch("/api/cozinha");
    if (res.ok) {
      const todos = await res.json();
      setItens(todos);
    }
    setLoading(false);
  }, []);

  const carregarEntregues = useCallback(async () => {
    const res = await fetch("/api/cozinha?entregues=true");
    if (res.ok) {
      const todos: ItemCozinha[] = await res.json();
      setEntregues(todos.filter((i) => i.status === "ENTREGUE"));
    }
  }, []);

  useEffect(() => {
    carregar();
    const interval = setInterval(carregar, 10000); // refresh a cada 10s
    return () => clearInterval(interval);
  }, [carregar]);

  const atualizarStatus = async (itemId: string, novoStatus: string) => {
    setAtualizando(itemId);
    const res = await fetch("/api/cozinha", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, status: novoStatus }),
    });
    if (res.ok) await carregar();
    setAtualizando(null);
  };

  const tempoDecorrido = (data: string) => {
    const diff = Date.now() - new Date(data).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "agora";
    if (min < 60) return `${min}min`;
    return `${Math.floor(min / 60)}h${min % 60}min`;
  };

  // Agrupar por mesa
  const porMesa = itens.reduce<Record<string, ItemCozinha[]>>((acc, item) => {
    const key = item.mesaNumero ? `Mesa ${item.mesaNumero}` : "Balcão";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const toggleEntregues = () => {
    const novo = !showEntregues;
    setShowEntregues(novo);
    if (novo) carregarEntregues();
  };

  const pendentes = itens.filter((i) => i.status === "PENDENTE");
  const preparando = itens.filter((i) => i.status === "PREPARANDO");
  const prontos = itens.filter((i) => i.status === "PRONTO");

  const entreguesPorMesa = entregues.reduce<Record<string, ItemCozinha[]>>((acc, item) => {
    const key = item.mesaNumero ? `Mesa ${item.mesaNumero}` : "Balcão";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="font-black uppercase italic animate-pulse text-slate-400">Carregando cozinha...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* HEADER */}
      <header className="border-l-4 border-amber-600 pl-6 py-2 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Cozinha</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Painel de preparo</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Contadores */}
          <div className="flex gap-2">
            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
              {pendentes.length} pendente{pendentes.length !== 1 && "s"}
            </span>
            <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
              {preparando.length} preparando
            </span>
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-black uppercase">
              {prontos.length} pronto{prontos.length !== 1 && "s"}
            </span>
          </div>
          <button onClick={carregar} className="text-slate-400 hover:text-blue-500 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Atualizar">
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {itens.length === 0 ? (
        <div className="text-center py-20">
          <ChefHat size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
          <p className="font-black uppercase italic text-lg text-slate-400">Nenhum pedido na cozinha</p>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Novos pedidos aparecerão aqui automaticamente</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Object.entries(porMesa).map(([mesa, mesaItens]) => (
            <div
              key={mesa}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden shadow-sm"
            >
              {/* Header da mesa */}
              <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-black uppercase italic text-sm text-slate-800 dark:text-white tracking-tighter">{mesa}</h3>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {mesaItens.length} ite{mesaItens.length !== 1 ? "ns" : "m"}
                </span>
              </div>

              {/* Itens */}
              <div className="p-4 space-y-3">
                {mesaItens.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      item.status === "PENDENTE"
                        ? "border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20"
                        : item.status === "PREPARANDO"
                        ? "border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20"
                        : "border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20"
                    }`}
                  >
                    {/* Produto + quantidade */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-black text-base uppercase italic text-slate-800 dark:text-white leading-tight">
                          {item.quantidade}x {item.produto.nome}
                        </h4>
                        {item.observacao && (
                          <p className="text-[10px] text-slate-500 font-bold mt-1">OBS: {item.observacao}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock size={12} />
                        <span className="text-[10px] font-bold">{tempoDecorrido(item.criadoEm)}</span>
                      </div>
                    </div>

                    {/* Status badge + botão de ação */}
                    <div className="flex items-center justify-between mt-3">
                      <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        item.status === "PENDENTE" ? "bg-red-500 text-white" :
                        item.status === "PREPARANDO" ? "bg-amber-500 text-white" :
                        "bg-emerald-500 text-white"
                      }`}>
                        {item.status}
                      </span>

                      <div className="flex gap-2">
                        {item.status === "PENDENTE" && (
                          <button
                            onClick={() => atualizarStatus(item.id, "PREPARANDO")}
                            disabled={atualizando === item.id}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 transition-all disabled:opacity-50"
                          >
                            <ChefHat size={12} /> Preparar
                          </button>
                        )}
                        {item.status === "PREPARANDO" && (
                          <button
                            onClick={() => atualizarStatus(item.id, "PRONTO")}
                            disabled={atualizando === item.id}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 transition-all disabled:opacity-50"
                          >
                            <CheckCircle2 size={12} /> Pronto
                          </button>
                        )}
                        {item.status === "PRONTO" && (
                          <button
                            onClick={() => atualizarStatus(item.id, "ENTREGUE")}
                            disabled={atualizando === item.id}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase flex items-center gap-1 transition-all disabled:opacity-50"
                          >
                            <Truck size={12} /> Entregue
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEÇÃO DE ENTREGUES */}
      <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
        <button
          onClick={toggleEntregues}
          className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Truck size={16} className="text-blue-500" />
            <span className="font-black uppercase italic text-sm text-slate-600 dark:text-slate-300 tracking-tighter">Entregues Hoje</span>
            {entregues.length > 0 && (
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-black">
                {entregues.length}
              </span>
            )}
          </div>
          {showEntregues ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>

        {showEntregues && (
          <div className="mt-4">
            {entregues.length === 0 ? (
              <p className="text-center text-slate-400 font-bold uppercase text-xs py-8">Nenhum item entregue hoje</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {Object.entries(entreguesPorMesa).map(([mesa, mesaItens]) => (
                  <div
                    key={mesa}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden shadow-sm opacity-70"
                  >
                    <div className="bg-slate-50 dark:bg-slate-950 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <h3 className="font-black uppercase italic text-sm text-slate-800 dark:text-white tracking-tighter">{mesa}</h3>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {mesaItens.length} ite{mesaItens.length !== 1 ? "ns" : "m"}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      {mesaItens.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900"
                        >
                          <span className="font-black text-sm uppercase italic text-slate-600 dark:text-slate-300">
                            {item.quantidade}x {item.produto.nome}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400">{tempoDecorrido(item.criadoEm)}</span>
                            <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase">Entregue</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
