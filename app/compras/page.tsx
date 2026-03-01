"use client";

import { useState, useEffect } from 'react';
import { 
  Search, Plus, Minus, Trash2, Package, ArrowUpCircle, Inbox 
} from 'lucide-react';

export default function EntradaCompras() {
  // --- ESTADOS DE DADOS ---
  const [produtos, setProdutos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(false);
  
  // --- ESTADOS DO CARRINHO E MODAL ---
  const [carrinho, setCarrinho] = useState<any[]>([]);
  const [produtoEmSelecao, setProdutoEmSelecao] = useState<any>(null);
  const [qtdTemp, setQtdTemp] = useState(1);
  const [custoTemp, setCustoTemp] = useState("");
  const [vendaTemp, setVendaTemp] = useState("");

  // 1. BUSCAR PRODUTOS DO BANCO AO CARREGAR
  async function carregarProdutos() {
    try {
      const res = await fetch('/api/produtos');
      const data = await res.json();
      if (Array.isArray(data)) setProdutos(data);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  const totalCompra = carrinho.reduce((acc, item) => acc + (item.precoCusto * item.qtd), 0);

  // 2. LÓGICA DO MODAL (ADICIONAR AO CARRINHO TEMPORÁRIO)
  const confirmarAdicao = () => {
    if (produtoEmSelecao && Number(custoTemp) >= 0 && Number(vendaTemp) > 0) {
      setCarrinho([...carrinho, { 
        produtoId: produtoEmSelecao.id, 
        nome: produtoEmSelecao.nome, 
        qtd: qtdTemp, 
        precoCusto: Number(custoTemp),
        precoVenda: Number(vendaTemp)
      }]);
      fecharModal();
    } else {
      alert("Informe os valores de custo e venda!");
    }
  };

  const fecharModal = () => {
    setProdutoEmSelecao(null);
    setCustoTemp("");
    setVendaTemp("");
    setQtdTemp(1);
  };

  // 3. PERSISTÊNCIA FINAL: ENVIAR LOTE PARA O SQLITE
  const finalizarEntrada = async () => {
    if (carrinho.length === 0 || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/movimentacoes/lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carrinho),
      });

      if (response.ok) {
        setCarrinho([]);
        alert("✅ ESTOQUE E PREÇOS ATUALIZADOS NO BANCO!");
        carregarProdutos(); // Atualiza os saldos na lista de busca
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro na API");
      }
    } catch (err: any) {
      alert(`❌ Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full pb-10">
      
      {/* LADO ESQUERDO: SELEÇÃO DE PRODUTOS */}
      <div className="lg:col-span-6 space-y-6">
        <header className="border-l-4 border-emerald-500 pl-6 py-2">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Entrada de Estoque</h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Reposição e atualização de valores</p>
        </header>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="PESQUISAR PARA ENTRADA..." 
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 pl-12 rounded-2xl font-bold uppercase italic outline-none focus:ring-2 ring-emerald-500/20 text-slate-800 dark:text-white"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {produtos?.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase())).map(p => (
            <button 
              key={p.id}
              onClick={() => { 
                setProdutoEmSelecao(p); 
                setCustoTemp(p.precoCusto || ""); 
                setVendaTemp(p.precoVenda || ""); 
              }}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-left hover:border-emerald-500 transition-all flex justify-between items-center group"
            >
              <div>
                <h3 className="font-black text-slate-800 dark:text-white uppercase italic text-sm">{p.nome}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Saldo Atual: {p.estoque || 0}</p>
              </div>
              <Plus size={20} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* LADO DIREITO: CARRINHO DE ENTRADA (DARK) */}
      <div className="lg:col-span-6">
        <div className="bg-[#0f172a] rounded-[40px] p-8 text-white h-full flex flex-col shadow-2xl border border-white/5 relative overflow-hidden min-h-[600px]">
          <header className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">LISTA DE ENTRADA</h2>
            <span className="text-[10px] font-black text-slate-500 uppercase italic">{carrinho.length} ITENS</span>
          </header>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {carrinho.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20">
                <Package size={48} className="mb-2" />
                <p className="text-[10px] font-black uppercase">Carrinho Vazio</p>
              </div>
            ) : (
              carrinho.map((item, idx) => (
                <div key={idx} className="bg-slate-800/40 p-4 rounded-2xl border border-white/5 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-500 p-2 rounded-xl text-slate-900"><Package size={18} /></div>
                    <div>
                      <h4 className="font-black text-xs uppercase italic leading-tight">{item.nome}</h4>
                      <p className="text-[9px] text-emerald-500 font-black uppercase mt-0.5">
                        {item.qtd} UN x R$ {item.precoCusto.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setCarrinho(carrinho.filter((_, i) => i !== idx))} className="text-rose-500/50 hover:text-rose-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 space-y-6">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Investimento Total</p>
              <h3 className="text-4xl font-black italic text-emerald-500 tracking-tighter">
                R$ {totalCompra.toFixed(2)}
              </h3>
            </div>

            <button 
              onClick={finalizarEntrada}
              disabled={carrinho.length === 0 || loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-20 text-slate-950 py-5 rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/20"
            >
              <ArrowUpCircle size={22} /> {loading ? "GRAVANDO..." : "CONFIRMAR ENTRADA"}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE VALORES */}
      {produtoEmSelecao && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 text-slate-900 dark:text-white">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] p-10 shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic mb-8 text-center">{produtoEmSelecao.nome}</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <button onClick={() => setQtdTemp(Math.max(1, qtdTemp - 1))} className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm"><Minus size={18} /></button>
                <span className="text-4xl font-black italic">{qtdTemp}</span>
                <button onClick={() => setQtdTemp(qtdTemp + 1)} className="bg-emerald-500 p-3 rounded-xl text-white shadow-lg"><Plus size={18} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-2 italic">Custo Unitário</label>
                  <input 
                    type="number" value={custoTemp} onChange={(e) => setCustoTemp(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl font-bold outline-none focus:ring-2 ring-emerald-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase text-blue-500 ml-2 italic">Novo Preço Venda</label>
                  <input 
                    type="number" value={vendaTemp} onChange={(e) => setVendaTemp(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl font-bold outline-none focus:ring-2 ring-blue-500 border-2 border-blue-500/20"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button onClick={confirmarAdicao} className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:opacity-90 transition-all">
                ADICIONAR À LISTA
              </button>
              <button onClick={fecharModal} className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-rose-500 transition-colors">CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}