"use client";

import { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Users, X, Save, Eye, ClipboardList, CreditCard, Banknote, Layers, XCircle } from "lucide-react";
import { useToast } from "../components/Toast";

interface Mesa {
  id: number;
  numero: number;
  nome: string | null;
  capacidade: number;
  status: string;
  ativa: boolean;
}

interface PedidoItem {
  id: string;
  quantidade: number;
  precoUnit: number;
  subtotal: number;
  status: string;
  produto: { nome: string };
}

interface Pedido {
  id: string;
  valorTotal: number;
  pago: boolean;
  metodoPagamento: string | null;
  criadoEm: string;
  itens: PedidoItem[];
}

interface Comanda {
  id: string;
  mesaId: number;
  status: string;
  clienteNome: string | null;
  dataAbertura: string;
  pedidos: Pedido[];
  mesa: { numero: number; nome: string | null };
}

interface Pagamento {
  valor: string;
  metodoPagamento: string;
}

export default function MesasPage() {
  const toast = useToast();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Mesa | null>(null);
  const [form, setForm] = useState({ numero: "", nome: "", capacidade: "4" });

  // Comanda states
  const [comandasPorMesa, setComandasPorMesa] = useState<Record<number, Comanda>>({});
  const [showAbrirComanda, setShowAbrirComanda] = useState<Mesa | null>(null);
  const [clienteNome, setClienteNome] = useState("");

  // Ver pedidos
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [comandaDetalhes, setComandaDetalhes] = useState<Comanda | null>(null);

  // Fechar comanda
  const [fechandoComanda, setFechandoComanda] = useState<Comanda | null>(null);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([{ valor: "", metodoPagamento: "DINHEIRO" }]);
  const [processando, setProcessando] = useState(false);

  // Criar em lote
  const [showLote, setShowLote] = useState(false);
  const [loteForm, setLoteForm] = useState({ de: "", ate: "", capacidade: "4" });

  const carregar = async () => {
    setLoading(true);
    const res = await fetch("/api/mesas");
    if (res.ok) setMesas(await res.json());
    await carregarComandas();
    setLoading(false);
  };

  const carregarComandas = async () => {
    const res = await fetch("/api/comandas?status=ABERTA");
    if (res.ok) {
      const comandas: Comanda[] = await res.json();
      const mapa: Record<number, Comanda> = {};
      comandas.forEach((c) => { mapa[c.mesaId] = c; });
      setComandasPorMesa(mapa);
    }
  };

  useEffect(() => { carregar(); }, []);

  // CRUD Mesa
  const salvar = async () => {
    const url = editando ? `/api/mesas/${editando.id}` : "/api/mesas";
    const method = editando ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numero: Number(form.numero),
        nome: form.nome || null,
        capacidade: Number(form.capacidade),
      }),
    });

    if (res.ok) {
      setShowForm(false);
      setEditando(null);
      setForm({ numero: "", nome: "", capacidade: "4" });
      carregar();
    } else {
      const err = await res.json();
      toast.error(err.error);
    }
  };

  const excluir = async (id: number) => {
    if (!confirm("Desativar esta mesa?")) return;
    const res = await fetch(`/api/mesas/${id}`, { method: "DELETE" });
    if (res.ok) carregar();
  };

  const liberarMesa = async (id: number) => {
    const res = await fetch(`/api/mesas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "LIVRE" }),
    });
    if (res.ok) carregar();
  };

  const criarEmLote = async () => {
    const de = Number(loteForm.de);
    const ate = Number(loteForm.ate);

    if (!de || !ate || de > ate) {
      toast.warning("Informe um intervalo válido (De deve ser menor ou igual a Até)");
      return;
    }

    const res = await fetch("/api/mesas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lote: { de, ate },
        capacidade: Number(loteForm.capacidade) || 4,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      toast.success(`${result.criadas} mesa(s) criada(s)${result.ignoradas > 0 ? `, ${result.ignoradas} já existia(m)` : ""}`);
      setShowLote(false);
      setLoteForm({ de: "", ate: "", capacidade: "4" });
      carregar();
    } else {
      const err = await res.json();
      toast.error(err.error);
    }
  };

  const editar = (mesa: Mesa) => {
    setEditando(mesa);
    setForm({ numero: String(mesa.numero), nome: mesa.nome || "", capacidade: String(mesa.capacidade) });
    setShowForm(true);
  };

  // Comanda
  const abrirComanda = async (mesa: Mesa) => {
    const res = await fetch("/api/comandas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mesaId: mesa.id, clienteNome: clienteNome || null }),
    });

    if (res.ok) {
      setShowAbrirComanda(null);
      setClienteNome("");
      carregar();
    } else {
      const err = await res.json();
      toast.error(err.error);
    }
  };

  const verComanda = async (comanda: Comanda, mesa: Mesa) => {
    setMesaSelecionada(mesa);
    // Recarregar detalhes frescos da comanda
    const res = await fetch(`/api/comandas/${comanda.id}`);
    if (res.ok) {
      setComandaDetalhes(await res.json());
    }
  };

  const iniciarFechamento = (comanda: Comanda) => {
    setFechandoComanda(comanda);
    setMesaSelecionada(null);
    setComandaDetalhes(null);
    const total = comanda.pedidos.reduce((acc, p) => acc + p.valorTotal, 0);
    setPagamentos([{ valor: total.toFixed(2), metodoPagamento: "DINHEIRO" }]);
  };

  const addPagamento = () => {
    setPagamentos([...pagamentos, { valor: "", metodoPagamento: "DINHEIRO" }]);
  };

  const removePagamento = (idx: number) => {
    if (pagamentos.length <= 1) return;
    setPagamentos(pagamentos.filter((_, i) => i !== idx));
  };

  const updatePagamento = (idx: number, field: keyof Pagamento, value: string) => {
    setPagamentos(pagamentos.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };

  const fecharComanda = async () => {
    if (!fechandoComanda || processando) return;

    const totalComanda = fechandoComanda.pedidos.reduce((acc, p) => acc + p.valorTotal, 0);
    const totalPagamentos = pagamentos.reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);
    const diff = Math.abs(totalComanda - totalPagamentos);

    if (diff > 0.01) {
      toast.warning(`Total dos pagamentos (R$ ${totalPagamentos.toFixed(2)}) difere do total da comanda (R$ ${totalComanda.toFixed(2)})`);
      return;
    }

    setProcessando(true);

    const res = await fetch(`/api/comandas/${fechandoComanda.id}/fechar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pagamentos: pagamentos.map((p) => ({
          valor: parseFloat(p.valor),
          metodoPagamento: p.metodoPagamento,
        })),
      }),
    });

    if (res.ok) {
      toast.success("Comanda fechada com sucesso!");
      setFechandoComanda(null);
      setPagamentos([{ valor: "", metodoPagamento: "DINHEIRO" }]);
      carregar();
    } else {
      const err = await res.json();
      toast.error(err.error);
    }
    setProcessando(false);
  };

  const cancelarItem = async (itemId: string, nomeProduto: string) => {
    if (!confirm(`Cancelar "${nomeProduto}" da comanda? O estoque será devolvido.`)) return;
    const res = await fetch(`/api/pedido-itens/${itemId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Item cancelado!");
      // Recarregar detalhes da comanda
      if (comandaDetalhes) {
        const r = await fetch(`/api/comandas/${comandaDetalhes.id}`);
        if (r.ok) setComandaDetalhes(await r.json());
      }
      carregar();
    } else {
      const err = await res.json();
      toast.error(err.error || "Erro ao cancelar item");
    }
  };

  const cancelarComanda = async (comanda: Comanda) => {
    if (!confirm("Cancelar esta comanda? Só é possível se não houver pedidos.")) return;
    const res = await fetch(`/api/comandas/${comanda.id}`, { method: "DELETE" });
    if (res.ok) {
      setMesaSelecionada(null);
      setComandaDetalhes(null);
      carregar();
    } else {
      const err = await res.json();
      toast.error(err.error);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="font-black uppercase italic animate-pulse text-slate-400">Carregando mesas...</div></div>;
  }

  return (
    <div className="space-y-5 pb-8">
      <header className="border-l-4 border-orange-600 pl-4 py-1 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Mesas</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Controle de mesas do estabelecimento</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowLote(true); setLoteForm({ de: "", ate: "", capacidade: "4" }); }}
            className="bg-slate-700 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-slate-500/20"
          >
            <Layers size={16} /> Criar Várias
          </button>
          <button
            onClick={() => { setEditando(null); setForm({ numero: "", nome: "", capacidade: "4" }); setShowForm(true); }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus size={16} /> Nova Mesa
          </button>
        </div>
      </header>

      {/* GRID DE MESAS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {mesas.map((mesa) => {
          const ocupada = mesa.status === "OCUPADA";
          const comanda = comandasPorMesa[mesa.id];
          const temComanda = !!comanda;
          const totalComanda = comanda?.pedidos?.reduce((acc, p) => acc + p.valorTotal, 0) || 0;

          return (
            <div
              key={mesa.id}
              className={`relative p-5 rounded-xl border-2 transition-all ${
                temComanda
                  ? "bg-amber-50 dark:bg-amber-950/20 border-amber-400 dark:border-amber-800"
                  : ocupada
                  ? "bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400"
              }`}
            >
              {/* Badge comanda */}
              {temComanda && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <span className="bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                    <ClipboardList size={8} /> Comanda
                  </span>
                </div>
              )}

              {/* Número grande */}
              <div className="text-center mb-3">
                <span className={`text-4xl font-black italic ${
                  temComanda ? "text-amber-500" : ocupada ? "text-orange-600" : "text-slate-300 dark:text-slate-700"
                }`}>
                  {mesa.numero}
                </span>
              </div>

              {/* Nome e capacidade */}
              <div className="text-center mb-2">
                {mesa.nome && <p className="font-black text-xs uppercase italic text-slate-600 dark:text-slate-300">{mesa.nome}</p>}
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Users size={12} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400">{mesa.capacidade}</span>
                </div>
              </div>

              {/* Total comanda */}
              {temComanda && totalComanda > 0 && (
                <div className="text-center mb-2">
                  <span className="text-sm font-black italic text-amber-600 font-mono">R$ {totalComanda.toFixed(2)}</span>
                </div>
              )}

              {/* Status badge */}
              <div className="text-center mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  temComanda
                    ? "bg-amber-500 text-white"
                    : ocupada
                    ? "bg-orange-500 text-white"
                    : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                }`}>
                  {temComanda ? "COMANDA" : mesa.status}
                </span>
              </div>

              {/* Ações */}
              <div className="flex justify-center gap-2 flex-wrap">
                {temComanda ? (
                  <>
                    <button onClick={() => verComanda(comanda, mesa)} className="text-amber-500 hover:text-amber-700 p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors" title="Ver comanda">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => iniciarFechamento(comanda)} className="text-emerald-500 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors" title="Fechar comanda">
                      <CreditCard size={14} />
                    </button>
                  </>
                ) : ocupada ? (
                  <>
                    <button onClick={() => liberarMesa(mesa.id)} className="text-emerald-500 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors" title="Liberar mesa">
                      <Users size={14} />
                    </button>
                  </>
                ) : (
                  <button onClick={() => { setShowAbrirComanda(mesa); setClienteNome(""); }} className="text-amber-500 hover:text-amber-700 p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors" title="Abrir comanda">
                    <ClipboardList size={14} />
                  </button>
                )}
                <button onClick={() => editar(mesa)} className="text-slate-400 hover:text-blue-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Editar">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => excluir(mesa.id)} className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Desativar">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {mesas.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <p className="font-black uppercase italic text-lg">Nenhuma mesa cadastrada</p>
            <p className="text-[10px] uppercase tracking-widest mt-1">Clique em "Nova Mesa" para começar</p>
          </div>
        )}
      </div>

      {/* MODAL: ABRIR COMANDA */}
      {showAbrirComanda && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase italic dark:text-white">Abrir Comanda</h2>
              <button onClick={() => setShowAbrirComanda(null)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
            </div>

            <div className="text-center mb-6">
              <span className="text-5xl font-black italic text-amber-500">{showAbrirComanda.numero}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Mesa</p>
            </div>

            <div className="mb-6">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nome do cliente (opcional)</label>
              <input
                type="text"
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-amber-500/20"
                placeholder="Ex: João"
              />
            </div>

            <button
              onClick={() => abrirComanda(showAbrirComanda)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <ClipboardList size={16} /> Abrir Comanda
            </button>
          </div>
        </div>
      )}

      {/* MODAL: FORM MESA */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase italic dark:text-white">{editando ? "Editar Mesa" : "Nova Mesa"}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Número *</label>
                <input type="number" min="1" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-black text-lg text-center outline-none focus:ring-2 ring-orange-500/20" placeholder="1" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Nome (opcional)</label>
                <input type="text" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm outline-none focus:ring-2 ring-orange-500/20" placeholder="Ex: Varanda, Salão..." />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Capacidade</label>
                <input type="number" min="1" value={form.capacidade} onChange={(e) => setForm({ ...form, capacidade: e.target.value })}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm text-center outline-none focus:ring-2 ring-orange-500/20" />
              </div>
            </div>

            <button onClick={salvar} disabled={!form.numero}
              className="w-full mt-6 bg-orange-600 hover:bg-orange-700 disabled:opacity-30 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg">
              <Save size={16} /> {editando ? "Atualizar" : "Criar Mesa"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: VER COMANDA */}
      {mesaSelecionada && comandaDetalhes && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[500px] max-h-[80vh] rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black uppercase italic dark:text-white">Comanda — Mesa {mesaSelecionada.numero}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {comandaDetalhes.clienteNome && `Cliente: ${comandaDetalhes.clienteNome} · `}
                  Aberta {new Date(comandaDetalhes.dataAbertura).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <button onClick={() => { setMesaSelecionada(null); setComandaDetalhes(null); }} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
            </div>

            {comandaDetalhes.pedidos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 font-bold uppercase text-sm">Nenhum pedido ainda</p>
                <button
                  onClick={() => cancelarComanda(comandaDetalhes)}
                  className="mt-4 text-rose-500 hover:text-rose-700 font-black uppercase text-xs underline"
                >
                  Cancelar comanda
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {comandaDetalhes.pedidos.map((pedido, idx) => (
                  <div key={pedido.id} className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Pedido #{idx + 1} · {new Date(pedido.criadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${pedido.pago ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                          {pedido.pago ? "Pago" : "Pendente"}
                        </span>
                        <span className="font-black text-sm text-emerald-600 italic font-mono">R$ {pedido.valorTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {pedido.itens.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                            {item.quantidade}x {item.produto.nome}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-500">R$ {item.subtotal.toFixed(2)}</span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                              item.status === "PENDENTE" ? "bg-red-100 text-red-600" :
                              item.status === "PREPARANDO" ? "bg-amber-100 text-amber-600" :
                              item.status === "PRONTO" ? "bg-emerald-100 text-emerald-600" :
                              "bg-slate-100 text-slate-400"
                            }`}>
                              {item.status}
                            </span>
                            {!pedido.pago && item.status !== "PREPARANDO" && (
                              <button
                                onClick={() => cancelarItem(item.id, item.produto.nome)}
                                className="text-slate-300 hover:text-rose-500 transition-colors"
                                title="Cancelar item"
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Total e botão fechar */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-black uppercase text-sm text-slate-500">Total</span>
                  <span className="text-2xl font-black italic text-amber-600 font-mono">
                    R$ {comandaDetalhes.pedidos.reduce((acc, p) => acc + p.valorTotal, 0).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => iniciarFechamento(comandaDetalhes)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <CreditCard size={16} /> Fechar Comanda
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: FECHAR COMANDA (PAGAMENTO) */}
      {fechandoComanda && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[450px] rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-black uppercase italic dark:text-white">Fechar Comanda</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Mesa {fechandoComanda.mesa?.numero}
                  {fechandoComanda.clienteNome && ` · ${fechandoComanda.clienteNome}`}
                </p>
              </div>
              <button onClick={() => setFechandoComanda(null)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
            </div>

            {/* Resumo */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-800">
              <div className="space-y-1 mb-3">
                {fechandoComanda.pedidos.map((p, i) => (
                  <div key={p.id} className="flex justify-between text-xs">
                    <span className="text-slate-500 font-bold">Pedido #{i + 1}</span>
                    <span className="font-black text-slate-700 dark:text-slate-300 font-mono">R$ {p.valorTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                <span className="font-black uppercase text-sm text-slate-500">Total</span>
                <span className="text-2xl font-black italic text-amber-600 font-mono">
                  R$ {fechandoComanda.pedidos.reduce((acc, p) => acc + p.valorTotal, 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Pagamentos */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pagamentos</span>
                <button onClick={addPagamento} className="text-blue-500 hover:text-blue-700 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                  <Plus size={12} /> Dividir
                </button>
              </div>

              {pagamentos.map((pgto, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <select
                    value={pgto.metodoPagamento}
                    onChange={(e) => updatePagamento(idx, "metodoPagamento", e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl font-black text-[10px] uppercase outline-none flex-1"
                  >
                    <option value="DINHEIRO">Dinheiro</option>
                    <option value="PIX">PIX</option>
                    <option value="DÉBITO">Débito</option>
                    <option value="CRÉDITO">Crédito</option>
                  </select>
                  <div className="relative flex-1">
                    <Banknote size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={pgto.valor}
                      onChange={(e) => updatePagamento(idx, "valor", e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 pl-9 rounded-xl font-black text-sm outline-none focus:ring-2 ring-emerald-500/20"
                      placeholder="0.00"
                    />
                  </div>
                  {pagamentos.length > 1 && (
                    <button onClick={() => removePagamento(idx)} className="text-slate-400 hover:text-rose-500 p-1">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}

              {/* Conferência */}
              {(() => {
                const totalComanda = fechandoComanda.pedidos.reduce((acc, p) => acc + p.valorTotal, 0);
                const totalPgtos = pagamentos.reduce((acc, p) => acc + (parseFloat(p.valor) || 0), 0);
                const diff = totalComanda - totalPgtos;
                if (Math.abs(diff) > 0.01) {
                  return (
                    <p className={`text-[10px] font-black uppercase ${diff > 0 ? "text-rose-500" : "text-amber-500"}`}>
                      {diff > 0 ? `Faltam R$ ${diff.toFixed(2)}` : `Excedente R$ ${Math.abs(diff).toFixed(2)}`}
                    </p>
                  );
                }
                return <p className="text-[10px] font-black uppercase text-emerald-500">Valores conferem</p>;
              })()}
            </div>

            <button
              onClick={fecharComanda}
              disabled={processando}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <CreditCard size={16} /> {processando ? "Processando..." : "Confirmar Pagamento"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR VÁRIAS MESAS */}
      {showLote && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[380px] rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase italic dark:text-white">Criar Várias Mesas</h2>
              <button onClick={() => setShowLote(false)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
            </div>

            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Informe o intervalo de números das mesas. Mesas já existentes serão ignoradas.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">De *</label>
                  <input type="number" min="1" value={loteForm.de} onChange={(e) => setLoteForm({ ...loteForm, de: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-black text-lg text-center outline-none focus:ring-2 ring-orange-500/20" placeholder="1" />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Até *</label>
                  <input type="number" min="1" value={loteForm.ate} onChange={(e) => setLoteForm({ ...loteForm, ate: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-black text-lg text-center outline-none focus:ring-2 ring-orange-500/20" placeholder="20" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Capacidade (todas)</label>
                <input type="number" min="1" value={loteForm.capacidade} onChange={(e) => setLoteForm({ ...loteForm, capacidade: e.target.value })}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold text-sm text-center outline-none focus:ring-2 ring-orange-500/20" />
              </div>
            </div>

            {loteForm.de && loteForm.ate && Number(loteForm.ate) >= Number(loteForm.de) && (
              <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3">
                {Number(loteForm.ate) - Number(loteForm.de) + 1} mesa(s) serão criadas
              </p>
            )}

            <button onClick={criarEmLote} disabled={!loteForm.de || !loteForm.ate}
              className="w-full mt-6 bg-slate-700 hover:bg-slate-800 disabled:opacity-30 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg">
              <Layers size={16} /> Criar Mesas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
