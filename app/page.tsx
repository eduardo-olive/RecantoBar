"use client";

import { useState, useEffect } from 'react';
import {
  Search, Plus, Minus, Trash2, CheckCircle2, ShoppingCart, Package, MapPin, X, ClipboardList, Send
} from 'lucide-react';
import { useToast } from './components/Toast';

export default function VendasPDV() {
  const toast = useToast();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [produtoEmSelecao, setProdutoEmSelecao] = useState<any>(null);
  const [quantidadeTemp, setQuantidadeTemp] = useState(1);
  const [metodoPagamento, setMetodoPagamento] = useState("PIX");
  const [loading, setLoading] = useState(false);
  const [mesas, setMesas] = useState<any[]>([]);
  const [mesaSelecionada, setMesaSelecionada] = useState<any>(null);
  const [showMesas, setShowMesas] = useState(false);
  const [comandaAberta, setComandaAberta] = useState<any>(null);

  // CARREGAR PRODUTOS E MESAS
  const carregarProdutos = async () => {
    try {
      const res = await fetch('/api/produtos');
      const data = await res.json();
      if (Array.isArray(data)) setProdutos(data);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    }
  };

  const carregarMesas = async () => {
    try {
      const res = await fetch('/api/mesas');
      const data = await res.json();
      if (Array.isArray(data)) setMesas(data);
    } catch (err) {
      console.error("Erro ao carregar mesas:", err);
    }
  };

  useEffect(() => { carregarProdutos(); carregarMesas(); }, []);

  // Ao selecionar mesa, verificar se tem comanda aberta
  const selecionarMesa = async (mesa: any) => {
    setMesaSelecionada(mesa);
    setShowMesas(false);

    try {
      const res = await fetch(`/api/comandas?mesaId=${mesa.id}&status=ABERTA`);
      const comandas = await res.json();
      if (Array.isArray(comandas) && comandas.length > 0) {
        setComandaAberta(comandas[0]);
      } else {
        setComandaAberta(null);
      }
    } catch {
      setComandaAberta(null);
    }
  };

  const limparMesa = () => {
    setMesaSelecionada(null);
    setComandaAberta(null);
  };

  const temComanda = !!comandaAberta;
  const temMesa = !!mesaSelecionada;
  const modoMesa = temMesa || temComanda;

  const totalCarrinho = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);

  const confirmarAdicaoAoCarrinho = () => {
    if (produtoEmSelecao) {
      const itemExistente = carrinho.find(c => c.produtoId === produtoEmSelecao.id);
      const qtdNoCarrinho = itemExistente ? itemExistente.qtd : 0;

      if (qtdNoCarrinho + quantidadeTemp > produtoEmSelecao.estoque) {
        toast.warning("Quantidade excede o estoque!");
        return;
      }

      if (itemExistente) {
        setCarrinho(carrinho.map(c => c.produtoId === produtoEmSelecao.id
          ? { ...c, qtd: c.qtd + quantidadeTemp } : c));
      } else {
        setCarrinho([...carrinho, {
          produtoId: produtoEmSelecao.id,
          nome: produtoEmSelecao.nome,
          preco: produtoEmSelecao.precoVenda,
          qtd: quantidadeTemp
        }]);
      }
      setProdutoEmSelecao(null);
    }
  };

  const finalizarVenda = async () => {
    if (carrinho.length === 0 || loading) return;
    setLoading(true);

    try {
      const body: any = {
        itens: carrinho.map(item => ({
          produtoId: item.produtoId,
          qtd: item.qtd,
          nome: item.nome,
          total: item.preco * item.qtd
        })),
      };

      if (modoMesa) {
        // Com mesa: abrir comanda automaticamente se não tiver
        let comandaId = comandaAberta?.id;

        if (!comandaId && mesaSelecionada) {
          const resComanda = await fetch('/api/comandas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mesaId: mesaSelecionada.id }),
          });
          if (resComanda.ok) {
            const novaComanda = await resComanda.json();
            comandaId = novaComanda.id;
          } else {
            const err = await resComanda.json();
            toast.error(err.error || "Erro ao abrir comanda.");
            setLoading(false);
            return;
          }
        }

        body.comandaId = comandaId;
        body.mesaId = mesaSelecionada?.id || null;
      } else {
        // Venda normal sem mesa — paga na hora
        body.metodoPagamento = metodoPagamento;
      }

      const res = await fetch('/api/movimentacoes/venda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        setCarrinho([]);
        setMesaSelecionada(null);
        setComandaAberta(null);
        setBusca("");
        carregarProdutos();
        carregarMesas();

        if (modoMesa) {
          toast.success("Pedido enviado para a mesa!");
        } else {
          setMetodoPagamento("PIX");
          toast.success("Venda finalizada!");
        }
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao processar.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full p-1">
      <header className="border-l-4 border-blue-600 pl-4 py-1">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Vendas PDV</h1>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Terminal de Saída</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* SELEÇÃO DE PRODUTOS */}
        <section className="lg:col-span-7 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="PESQUISAR..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 pl-11 rounded-2xl text-[11px] font-black uppercase italic outline-none focus:ring-2 ring-blue-500 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
            {produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase())).map(p => {
              const semEstoque = p.estoque <= 0;
              return (
                <button
                  key={p.id}
                  disabled={semEstoque}
                  onClick={() => { setProdutoEmSelecao(p); setQuantidadeTemp(1); }}
                  className={`group flex flex-col justify-between p-4 min-h-[110px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all ${semEstoque ? 'opacity-40 grayscale' : 'hover:border-blue-500 active:scale-[0.98]'}`}
                >
                  <div className="text-left w-full">
                    <h3 className="font-black text-sm uppercase italic text-slate-800 dark:text-white leading-tight mb-1">{p.nome}</h3>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${semEstoque ? 'text-rose-500' : 'text-slate-400'}`}>
                      {semEstoque ? 'INDISPONÍVEL' : `STOCK: ${p.estoque}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 w-full">
                    <span className="text-lg font-black text-blue-600 italic">R$ {p.precoVenda.toFixed(2)}</span>
                    {!semEstoque && <div className="bg-blue-600/10 text-blue-600 p-1.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors"><Plus size={14} /></div>}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* CARRINHO DARK COMPACTO */}
        <section className={`lg:col-span-5 rounded-3xl p-5 text-white shadow-2xl relative overflow-hidden flex flex-col h-[600px] border ${modoMesa ? 'bg-[#1a1000] border-orange-500/20' : 'bg-[#0f172a] border-white/5'}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black uppercase italic tracking-tighter">
                {modoMesa ? "PEDIDO" : "CARRINHO"}
              </h2>
              {mesaSelecionada && (
                <span className="bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full text-[8px] font-black uppercase flex items-center gap-1">
                  <ClipboardList size={10} /> Mesa {mesaSelecionada.numero}
                  {temComanda && <span className="text-orange-300/70 ml-1">• COMANDA</span>}
                </span>
              )}
            </div>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{carrinho.length} ITENS</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 mb-4 pr-1 custom-scrollbar">
            {carrinho.map(item => (
              <div key={item.produtoId} className="bg-slate-800/30 p-3 rounded-[18px] border border-white/5 flex justify-between items-center group transition-all hover:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${modoMesa ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}><Package size={14} /></div>
                  <div className="flex flex-col">
                    <h4 className="font-black text-xs uppercase italic truncate w-32 leading-none tracking-tighter">{item.nome}</h4>
                    <p className={`text-[9px] font-black uppercase mt-1 tracking-widest ${modoMesa ? 'text-orange-400' : 'text-blue-400'}`}>
                      {item.qtd} UN <span className="text-slate-600 mx-1">|</span> R$ {item.preco.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <p className="text-base font-black italic text-emerald-400 font-mono tracking-tighter">R$ {(item.preco * item.qtd).toFixed(2)}</p>
                  <button onClick={() => setCarrinho(carrinho.filter(c => c.produtoId !== item.produtoId))} className="text-rose-500/20 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto space-y-4 pt-4 border-t border-white/10">
            {/* SELETOR DE MESA */}
            <div className="relative">
              <span className="text-[9px] font-black text-slate-500 uppercase italic mb-1.5 block">Mesa (opcional)</span>
              {mesaSelecionada ? (
                <div className={`flex items-center gap-2 p-2.5 rounded-xl border ${temComanda ? 'bg-orange-500/15 border-orange-500/40' : 'bg-orange-500/10 border-orange-500/30'}`}>
                  <MapPin size={14} className="text-orange-400" />
                  <span className="text-xs font-black text-orange-400 uppercase flex-1">
                    Mesa {mesaSelecionada.numero}
                    {temComanda && <span className="text-[8px] ml-2 text-orange-300/70">COMANDA ABERTA</span>}
                  </span>
                  <button onClick={limparMesa} className="text-orange-400/50 hover:text-orange-400"><X size={14} /></button>
                </div>
              ) : (
                <button
                  onClick={() => setShowMesas(!showMesas)}
                  className="w-full flex items-center gap-2 bg-slate-800/50 border border-slate-700 p-2.5 rounded-xl text-slate-500 hover:text-white hover:border-slate-600 transition-colors"
                >
                  <MapPin size={14} />
                  <span className="text-[10px] font-black uppercase">Selecionar Mesa</span>
                </button>
              )}
              {showMesas && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-xl max-h-[200px] overflow-y-auto z-10">
                  {mesas.length === 0 ? (
                    <p className="text-[10px] text-slate-500 font-bold text-center py-2">Nenhuma mesa cadastrada</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5">
                      {mesas.map(m => (
                        <button
                          key={m.id}
                          onClick={() => selecionarMesa(m)}
                          className={`p-2 rounded-lg text-xs font-black transition-colors ${
                            m.status === "OCUPADA"
                              ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30"
                              : "bg-slate-700/50 hover:bg-orange-500/20 hover:text-orange-400 text-white"
                          }`}
                        >
                          {m.numero}
                          {m.status === "OCUPADA" && <span className="block text-[7px] mt-0.5 opacity-70">OCUP.</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* TOTAL */}
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase italic mb-1">
                {modoMesa ? "TOTAL DO PEDIDO" : "TOTAL A PAGAR"}
              </span>
              <h3 className={`text-4xl font-black italic tracking-tighter font-mono leading-none ${modoMesa ? 'text-orange-400' : 'text-emerald-500'}`}>
                R$ {totalCarrinho.toFixed(2)}
              </h3>
            </div>

            {/* PAGAMENTO — só mostra se NÃO tiver mesa selecionada */}
            {!modoMesa && (
              <div className="flex gap-1.5">
                {['DINHEIRO', 'PIX', 'DÉBITO', 'CRÉDITO'].map((m) => (
                  <button key={m} onClick={() => setMetodoPagamento(m)} className={`flex-1 py-2.5 rounded-xl text-[8px] font-black border transition-all ${metodoPagamento === m ? 'border-emerald-500 bg-emerald-500 text-slate-900' : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-white'}`}>{m}</button>
                ))}
              </div>
            )}

            {/* BOTÃO DE AÇÃO */}
            <button
              onClick={finalizarVenda}
              disabled={carrinho.length === 0 || loading}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-20 ${
                modoMesa
                  ? 'bg-orange-500 hover:bg-orange-400 text-slate-900 shadow-orange-500/10'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-emerald-500/10'
              }`}
            >
              {modoMesa ? (
                <><Send size={18} /> {loading ? "ENVIANDO..." : "ENVIAR PEDIDO"}</>
              ) : (
                <><CheckCircle2 size={18} /> {loading ? "GRAVANDO..." : "FINALIZAR VENDA"}</>
              )}
            </button>
          </div>
          <ShoppingCart className="absolute -right-16 -bottom-16 text-white/[0.02] pointer-events-none" size={240} />
        </section>
      </div>

      {/* MODAL QUANTIDADE */}
      {produtoEmSelecao && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-[320px] rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-black uppercase italic dark:text-white mb-2 text-center leading-tight">{produtoEmSelecao.nome}</h2>
            <p className="text-center text-[9px] font-bold text-slate-400 mb-6 uppercase tracking-widest italic">ESTOQUE DISPONÍVEL: {produtoEmSelecao.estoque}</p>

            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl mb-8">
              <button onClick={() => setQuantidadeTemp(Math.max(1, quantidadeTemp - 1))} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm text-slate-900 dark:text-white"><Minus size={16} /></button>
              <span className="text-5xl font-black italic dark:text-white font-mono">{quantidadeTemp}</span>
              <button onClick={() => { if (quantidadeTemp < produtoEmSelecao.estoque) setQuantidadeTemp(quantidadeTemp + 1); }} className={`p-3 rounded-xl text-white ${quantidadeTemp >= produtoEmSelecao.estoque ? 'bg-slate-300' : 'bg-blue-600 shadow-lg'}`}><Plus size={16} /></button>
            </div>

            <button onClick={confirmarAdicaoAoCarrinho} className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-[11px] active:scale-95 transition-transform shadow-xl">
              CONFIRMAR R$ {(produtoEmSelecao.precoVenda * quantidadeTemp).toFixed(2)}
            </button>
            <button onClick={() => setProdutoEmSelecao(null)} className="w-full mt-4 text-slate-400 font-bold uppercase text-[9px] text-center tracking-widest hover:text-rose-500 transition-colors">VOLTAR</button>
          </div>
        </div>
      )}
    </div>
  );
}
