"use client";

import { useData } from '../DataContext';
import { Plus, Tag, Box, AlertTriangle, BarChart3, TrendingUp } from 'lucide-react'; 
import { useState } from 'react';

export default function ProdutosPage() {
  const { categorias, produtos, adicionarProduto } = useData();
  
  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    estoqueMinimo: "",
    estoqueSeguro: "", // Estoque Máximo/Alvo
    categoriaId: "" 
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoProduto.nome || !novoProduto.categoriaId) return;

    adicionarProduto({
      nome: novoProduto.nome.toUpperCase(),
      categoriaId: Number(novoProduto.categoriaId),
      estoqueMinimo: Number(novoProduto.estoqueMinimo),
      estoqueSeguro: Number(novoProduto.estoqueSeguro),
      // Inicializamos valores técnicos como zero para não quebrar outras telas,
      // mas eles não aparecem nesta interface.
      preco: 0,
      precoCusto: 0
    });

    setNovoProduto({ nome: "", estoqueMinimo: "", estoqueSeguro: "", categoriaId: "" });
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="border-l-4 border-emerald-500 pl-6 py-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Produtos</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Definição de Itens e Metas de Inventário</p>
      </header>

      {/* FORMULÁRIO - Focado apenas em Identificação e Estoque */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input 
              type="text" 
              placeholder="NOME DO PRODUTO (EX: CERVEJA LATA 350ML)" 
              value={novoProduto.nome}
              onChange={(e) => setNovoProduto({...novoProduto, nome: e.target.value})}
              className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-sm font-black uppercase outline-none dark:text-white border border-transparent focus:border-emerald-500 transition-all"
            />
            
            <select 
              value={novoProduto.categoriaId}
              onChange={(e) => setNovoProduto({...novoProduto, categoriaId: e.target.value})}
              className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-sm font-black uppercase outline-none dark:text-white cursor-pointer border border-transparent focus:border-emerald-500"
            >
              <option value="">SELECIONE A CATEGORIA</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input 
                type="number" 
                placeholder="LIMITE MÍNIMO" 
                value={novoProduto.estoqueMinimo}
                onChange={(e) => setNovoProduto({...novoProduto, estoqueMinimo: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-sm font-black uppercase outline-none dark:text-white"
              />
              <AlertTriangle className="absolute right-4 top-4 text-amber-500 opacity-20" size={18} />
            </div>

            <div className="relative">
              <input 
                type="number" 
                placeholder="CAPACIDADE MÁXIMA" 
                value={novoProduto.estoqueSeguro}
                onChange={(e) => setNovoProduto({...novoProduto, estoqueSeguro: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-sm font-black uppercase outline-none dark:text-white"
              />
              <TrendingUp className="absolute right-4 top-4 text-emerald-500 opacity-20" size={18} />
            </div>

            <button type="submit" className="bg-emerald-600 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
              <Plus size={18} /> Registrar Item
            </button>
          </div>
        </form>
      </section>

      {/* LISTAGEM - Visualização de Fluxo de Estoque */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="p-6">Produto / Identificação</th>
              <th className="p-6">Categoria</th>
              <th className="p-6">Meta de Estoque (Min/Máx)</th>
              <th className="p-6 text-right">Saldo em Tempo Real</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {produtos.map((prod) => {
              const cat = categorias.find(c => c.id === prod.categoriaId);
              const saldo = prod.estoque || 0;
              const isCritico = saldo <= prod.estoqueMinimo;

              return (
                <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-6">
                    <p className="font-black text-slate-800 dark:text-white uppercase text-sm italic">{prod.nome}</p>
                  </td>
                  <td className="p-6">
                    <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                      {cat ? cat.nome : "NÃO DEFINIDO"}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
                      <span className="text-amber-600">{prod.estoqueMinimo}</span>
                      <span>/</span>
                      <span className="text-emerald-600">{prod.estoqueSeguro}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className={`inline-flex items-center gap-2 font-black italic text-lg ${isCritico ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {isCritico && <AlertTriangle size={14} className="animate-pulse" />}
                      {saldo} <span className="text-[10px] uppercase not-italic ml-1">UN</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}