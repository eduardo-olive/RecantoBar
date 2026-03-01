"use client";

import { Tag, Trash2, FolderPlus, Inbox } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. BUSCAR DADOS DA API (Substitui o que vinha do context)
  async function carregarCategorias() {
    try {
      const res = await fetch('/api/categorias');
      const data = await res.json();
      if (Array.isArray(data)) setCategorias(data);
    } catch (err) {
      console.error("Erro ao carregar:", err);
    }
  }

  useEffect(() => { carregarCategorias(); }, []);

  // 2. GRAVAR NA API
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCategoria.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novaCategoria }),
      });

      if (response.ok) {
        setNovaCategoria("");
        carregarCategorias(); // Recarrega a lista do banco
      }
    } catch (err) {
      alert("Erro ao salvar categoria no banco.");
    } finally {
      setLoading(false);
    }
  };

  // 3. EXCLUIR NA API (Opcional, se você quiser já deixar pronto)
  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Deseja excluir ${nome}?`)) return;

    try {
      await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
      carregarCategorias();
    } catch (err) {
      alert("Erro ao excluir.");
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <header className="border-l-4 border-indigo-600 pl-6 py-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Categorias</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Gerencie os dados dinâmicos do sistema</p>
      </header>

      {/* FORMULÁRIO */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
        <form onSubmit={handleAdd} className="flex gap-4">
          <input 
            type="text" 
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            placeholder={loading ? "GRAVANDO..." : "DIGITE A NOVA CATEGORIA..."} 
            disabled={loading}
            className="flex-1 bg-slate-50 dark:bg-slate-950 border-none p-4 rounded-2xl text-sm font-black uppercase outline-none dark:text-white focus:ring-2 ring-indigo-500/20 transition-all disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all flex items-center gap-2 disabled:bg-slate-500"
          >
            <FolderPlus size={18} /> {loading ? "Aguarde..." : "Adicionar"}
          </button>
        </form>
      </section>

      {/* LISTAGEM DINÂMICA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px]">
            <Inbox size={48} className="mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">Nenhuma categoria cadastrada</p>
          </div>
        ) : (
          categorias.map((cat) => (
            <div key={cat.id} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-600 transition-all">
              <div className="flex items-center gap-4">
                <Tag className="text-indigo-600" size={20} />
                <h3 className="font-black text-slate-800 dark:text-white uppercase italic">{cat.nome}</h3>
              </div>
              <button 
                onClick={() => handleExcluir(cat.id, cat.nome)}
                className="text-slate-300 hover:text-rose-500 transition-colors p-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}