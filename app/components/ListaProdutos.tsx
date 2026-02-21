"use client";

import { Trash2, Tag, DollarSign, Package } from 'lucide-react';

interface Produto {
  nome: string;
  preco: string;
  categoria: string;
}

interface Props {
  produtos: Produto[];
  onExcluir: (index: number) => void;
}

export function ListaProdutos({ produtos, onExcluir }: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* CABEÇALHO DA LISTA (MESMO PADRÃO CATEGORIAS) */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
        <Package size={20} className="text-slate-400" />
        <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">
          Produtos no Sistema
        </h2>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-950/50 text-slate-400 text-xs uppercase font-black tracking-widest">
            <th className="p-6">Produto</th>
            <th className="p-6">Categoria</th>
            <th className="p-6 text-center">Preço Unitário</th>
            <th className="p-6 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {produtos.map((produto, index) => (
            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <td className="p-6 font-black text-slate-800 dark:text-white uppercase">
                {produto.nome}
              </td>
              <td className="p-6">
                <span className="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 uppercase">
                  <Tag size={12} /> {produto.categoria}
                </span>
              </td>
              <td className="p-6 text-center font-mono font-bold text-slate-900 dark:text-white">
                R$ {Number(produto.preco).toFixed(2)}
              </td>
              <td className="p-6 text-right">
                <button 
                  onClick={() => onExcluir(index)}
                  className="text-red-400 hover:text-red-600 transition-colors p-2"
                >
                  <Trash2 size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {produtos.length === 0 && (
        <div className="p-10 text-center text-slate-500 italic font-bold uppercase tracking-widest">
          Nenhum produto cadastrado
        </div>
      )}
    </div>
  );
}