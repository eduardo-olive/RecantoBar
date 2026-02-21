"use client";

import { useState } from 'react';
import { PlusCircle } from 'lucide-react'; // Importando o ícone

interface FormProps {
  onAdicionar: (nome: string) => void;
}

export function FormularioCategoria({ onAdicionar }: FormProps) {
  const [nome, setNome] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim()) {
      onAdicionar(nome);
      setNome('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
          Nova Categoria
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Bebidas"
            className="flex-1 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-black"
          />
          <button
            type="submit"
            className="bg-emerald-600 text-white px-5 py-2 rounded-md font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Salvar
          </button>
        </div>
      </div>
    </form>
  );
}