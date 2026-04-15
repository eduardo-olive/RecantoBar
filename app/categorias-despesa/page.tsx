"use client";

import { Tag, Trash2, FolderPlus, Inbox } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "../components/Toast";

export default function CategoriasDespesaPage() {
  const toast = useToast();
  const [categorias, setCategorias] = useState<any[]>([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [loading, setLoading] = useState(false);

  async function carregar() {
    try {
      const res = await fetch("/api/categorias-despesa");
      const data = await res.json();
      if (Array.isArray(data)) setCategorias(data);
    } catch {
      toast.error("Erro ao carregar categorias.");
    }
  }

  useEffect(() => { carregar(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCategoria.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/categorias-despesa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novaCategoria }),
      });

      if (res.ok) {
        setNovaCategoria("");
        carregar();
        toast.success("Categoria criada!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao criar categoria.");
      }
    } catch {
      toast.error("Erro ao salvar categoria.");
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: string, nome: string) => {
    if (!confirm(`Deseja excluir a categoria "${nome}"?`)) return;

    try {
      const res = await fetch(`/api/categorias-despesa/${id}`, { method: "DELETE" });
      if (res.ok) {
        carregar();
        toast.success("Categoria excluída!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Erro ao excluir.");
      }
    } catch {
      toast.error("Erro ao excluir.");
    }
  };

  return (
    <div className="space-y-10 pb-10">
      <header className="border-l-4 border-rose-500 pl-6 py-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Categorias de Despesa</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Gerencie as categorias usadas nas despesas operacionais</p>
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
            className="flex-1 bg-slate-50 dark:bg-slate-950 border-none p-4 rounded-2xl text-sm font-black uppercase outline-none dark:text-white focus:ring-2 ring-rose-500/20 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-rose-600 transition-all flex items-center gap-2 disabled:bg-slate-500"
          >
            <FolderPlus size={18} /> {loading ? "Aguarde..." : "Adicionar"}
          </button>
        </form>
      </section>

      {/* LISTAGEM */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categorias.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px]">
            <Inbox size={48} className="mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">Nenhuma categoria cadastrada</p>
          </div>
        ) : (
          categorias.map((cat) => (
            <div key={cat.id} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-rose-500 transition-all">
              <div className="flex items-center gap-4">
                <Tag className="text-rose-500" size={20} />
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
