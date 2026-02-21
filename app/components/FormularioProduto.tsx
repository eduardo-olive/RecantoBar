"use client";

import { useState } from 'react';
import { PackagePlus, DollarSign, Tag, ClipboardList } from 'lucide-react';

interface Produto {
  nome: string;
  preco: string;
  categoria: string;
}

interface Props {
  categorias: string[];
  onAdicionar: (produto: Produto) => void;
}

export function FormularioProduto({ categorias, onAdicionar }: Props) {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [categoria, setCategoria] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nome && preco && categoria) {
      onAdicionar({ nome, preco, categoria });
      setNome('');
      setPreco('');
      setCategoria('');
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* NOME DO PRODUTO */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <ClipboardList size={14} /> Nome do Produto
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="EX: COCA-COLA 2L"
            className="bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500 transition-all uppercase"
          />
        </div>

        {/* PREÇO */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <DollarSign size={14} /> Preço (R$)
          </label>
          <input
            type="number"
            step="0.01"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            placeholder="0,00"
            className="bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* CATEGORIA */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
            <Tag size={14} /> Categoria
          </label>
          <select 
            value={categoria} 
            onChange={(e) => setCategoria(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 p-3 rounded-xl text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
          >
            <option value="" className="dark:bg-slate-900">SELECIONE...</option>
            {categorias.map((cat) => (
              <option key={cat} value={cat} className="dark:bg-slate-900 uppercase">
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-lg uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-3"
      >
        <PackagePlus size={24} />
        Cadastrar no Cardápio
      </button>
    </form>
  );
}