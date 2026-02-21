"use client";

import { useData } from './DataContext';
import { useState } from 'react';
import { 
  Search, Plus, Minus, Trash2, CheckCircle2, X, ShoppingCart, Package, AlertTriangle 
} from 'lucide-react';

export default function VendasPDV() {
  const { produtos, venderProduto } = useData();
  const [busca, setBusca] = useState("");
  const [carrinho, setCarrinho] = useState<{ produtoId: number; nome: string; preco: number; qtd: number }[]>([]);
  const [produtoEmSelecao, setProdutoEmSelecao] = useState<any>(null);
  const [quantidadeTemp, setQuantidadeTemp] = useState(1);
  const [metodoPagamento, setMetodoPagamento] = useState("PIX");

  const totalCarrinho = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);

  const abrirModal = (produto: any) => {
    // Regra: Se o estoque for 0 ou menor, nem abre o modal
    if (produto.estoque <= 0) return;
    setProdutoEmSelecao(produto);
    setQuantidadeTemp(1);
  };

  const confirmarAdicaoAoCarrinho = () => {
    if (produtoEmSelecao) {
      const itemExistente = carrinho.find(c => c.produtoId === produtoEmSelecao.id);
      const qtdNoCarrinho = itemExistente ? itemExistente.qtd : 0;
      
      // Validação final: Garantir que a soma (carrinho + nova qtd) não exceda o estoque
      if (qtdNoCarrinho + quantidadeTemp > produtoEmSelecao.estoque) {
        alert("Quantidade total excede o estoque disponível!");
        return;
      }

      if (itemExistente) {
        setCarrinho(carrinho.map(c => c.produtoId === produtoEmSelecao.id ? { ...c, qtd: c.qtd + quantidadeTemp } : c));
      } else {
        setCarrinho([...carrinho, { produtoId: produtoEmSelecao.id, nome: produtoEmSelecao.nome, preco: produtoEmSelecao.preco, qtd: quantidadeTemp }]);
      }
      setProdutoEmSelecao(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full p-2">
      <header className="border-l-4 border-blue-600 pl-6">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Vendas PDV</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA PRODUTOS */}
        <section className="lg:col-span-7 space-y-6">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="PESQUISAR PRODUTO..." 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 pl-14 rounded-3xl text-sm font-black uppercase italic outline-none focus:ring-2 ring-blue-500 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[650px] overflow-y-auto pr-2 custom-scrollbar">
            {produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase())).map(p => {
              const semEstoque = p.estoque <= 0;
              return (
                <button
                  key={p.id}
                  disabled={semEstoque}
                  onClick={() => abrirModal(p)}
                  className={`group flex flex-col justify-between p-6 min-h-[140px] rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all shadow-sm ${semEstoque ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:border-blue-500'}`}
                >
                  <div className="text-left w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="font-black text-lg uppercase italic text-slate-800 dark:text-white leading-tight mb-2">
                        {p.nome}
                      </h3>
                      {semEstoque && <AlertTriangle size={18} className="text-rose-500" />}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${semEstoque ? 'text-rose-500' : 'text-slate-400'}`}>
                      {semEstoque ? 'SEM ESTOQUE' : `Estoque: ${p.estoque}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-4 w-full">
                    <span className="text-2xl font-black text-blue-600 italic">R$ {p.preco.toFixed(2)}</span>
                    {!semEstoque && (
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Plus size={20} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* COLUNA CARRINHO */}
        <section className="lg:col-span-5 bg-[#0f172a] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden flex flex-col h-[650px] border border-white/5">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter">CARRINHO</h2>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{carrinho.length} itens</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
              {carrinho.map(item => (
                <div key={item.produtoId} className="bg-slate-800/40 p-5 rounded-[24px] border border-white/5 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-500 p-2.5 rounded-xl text-slate-900">
                      <Package size={18} />
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase italic truncate w-32 leading-none">{item.nome}</h4>
                      <p className="text-[10px] text-emerald-500 font-black uppercase mt-1 tracking-wider">
                        {item.qtd} UNIDADE(S)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-xl font-black italic text-emerald-400 font-mono">
                      R${(item.preco * item.qtd).toFixed(2)}
                    </p>
                    <button onClick={() => setCarrinho(carrinho.filter(c => c.produtoId !== item.produtoId))} className="text-rose-500/30 hover:text-rose-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-white/10 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Total da Venda</p>
                  <h3 className="text-5xl font-black italic text-emerald-500 tracking-tighter font-mono leading-none">
                    R$ {totalCarrinho.toFixed(2)}
                  </h3>
                </div>
              </div>
              
              <div className="flex gap-2">
                {['DINHEIRO', 'PIX', 'DÉBITO', 'CRÉDITO'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetodoPagamento(m)}
                    className={`flex-1 py-3 rounded-2xl text-[9px] font-black border transition-all ${
                      metodoPagamento === m ? 'border-emerald-500 bg-emerald-500 text-slate-900' : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => { venderProduto(carrinho.map(c => ({ produtoId: c.produtoId, qtd: c.qtd })), metodoPagamento); setCarrinho([]); alert("Venda Finalizada!"); }}
                disabled={carrinho.length === 0}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-20 text-slate-900 py-5 rounded-3xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-lg shadow-emerald-500/10"
              >
                <CheckCircle2 size={24} /> FINALIZAR VENDA
              </button>
            </div>
          </div>
          <ShoppingCart className="absolute -right-20 -bottom-20 text-white/[0.02] pointer-events-none" size={300} />
        </section>
      </div>

      {/* MODAL DE QUANTIDADE COM VALIDAÇÃO DE ESTOQUE NO BOTÃO + */}
      {produtoEmSelecao && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[45px] p-10 shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic dark:text-white mb-4 text-center leading-tight">{produtoEmSelecao.nome}</h2>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Disponível: {produtoEmSelecao.estoque}</p>
            
            <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-950 p-6 rounded-3xl mb-10">
              <button 
                onClick={() => setQuantidadeTemp(Math.max(1, quantidadeTemp - 1))} 
                className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm text-slate-900 dark:text-white active:scale-90 transition-transform"
              >
                <Minus />
              </button>
              
              <span className="text-6xl font-black italic dark:text-white">{quantidadeTemp}</span>
              
              <button 
                onClick={() => {
                  // Bloquear incremento se atingir o estoque
                  if (quantidadeTemp < produtoEmSelecao.estoque) {
                    setQuantidadeTemp(quantidadeTemp + 1);
                  }
                }} 
                className={`p-4 rounded-xl text-white shadow-lg transition-all active:scale-90 ${quantidadeTemp >= produtoEmSelecao.estoque ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 shadow-blue-600/30'}`}
              >
                <Plus />
              </button>
            </div>

            <button onClick={confirmarAdicaoAoCarrinho} className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white p-6 rounded-3xl font-black uppercase tracking-widest transition-transform active:scale-95">
              ADICIONAR R$ {(produtoEmSelecao.preco * quantidadeTemp).toFixed(2)}
            </button>
            <button onClick={() => setProdutoEmSelecao(null)} className="w-full mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-rose-500 transition-colors">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}