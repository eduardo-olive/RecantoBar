"use client";

import { Plus, Tag, Box, AlertTriangle, Inbox, TrendingUp, Trash2, Pencil, X } from 'lucide-react'; 
import { useState, useEffect } from 'react';

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // ESTADO PARA CONTROLE DE EDIÇÃO
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    estoqueMinimo: "",
    estoqueSeguro: "", 
    categoriaId: "" 
  });

  async function carregarDados() {
    try {
      const [resP, resC] = await Promise.all([
        fetch('/api/produtos'),
        fetch('/api/categorias')
      ]);
      const dataP = await resP.json();
      const dataC = await resC.json();
      if (Array.isArray(dataP)) setProdutos(dataP);
      if (Array.isArray(dataC)) setCategorias(dataC);
    } catch (err) {
      console.error("Erro ao sincronizar dados:", err);
    }
  }

  useEffect(() => { carregarDados(); }, []);

  // FUNÇÃO PARA PREPARAR A EDIÇÃO
  const handlePrepareEdit = (prod: any) => {
    setEditandoId(prod.id);
    setNovoProduto({
      nome: prod.nome,
      estoqueMinimo: prod.estoqueMinimo.toString(),
      estoqueSeguro: prod.estoqueSeguro.toString(),
      categoriaId: prod.categoriaId
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // FUNÇÃO PARA CANCELAR EDIÇÃO
  const handleCancelEdit = () => {
    setEditandoId(null);
    setNovoProduto({ nome: "", estoqueMinimo: "", estoqueSeguro: "", categoriaId: "" });
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`DESEJA REALMENTE EXCLUIR O PRODUTO: ${nome}?`)) return;

    try {
      const response = await fetch(`/api/produtos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        carregarDados();
      } else {
        alert("Erro ao excluir produto.");
      }
    } catch (err) {
      console.error("Erro ao deletar:", err);
      alert("Erro na comunicação com o servidor.");
    }
  };

  // SUBMIT HÍBRIDO (ADD OU EDIT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoProduto.nome || !novoProduto.categoriaId || loading) return;

    setLoading(true);
    try {
      const url = editandoId ? `/api/produtos/${editandoId}` : '/api/produtos';
      const method = editandoId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: novoProduto.nome.toUpperCase(),
          categoriaId: novoProduto.categoriaId,
          estoqueMinimo: Number(novoProduto.estoqueMinimo) || 0,
          estoqueSeguro: Number(novoProduto.estoqueSeguro) || 0,
          // Mantém valores padrão apenas se for criação nova
          ...(editandoId ? {} : { estoque: 0, precoVenda: 0, precoCusto: 0 })
        }),
      });

      if (response.ok) {
        handleCancelEdit(); // Limpa form e estado de edição
        carregarDados();
      } else {
        const erro = await response.json();
        alert(erro.error || "Erro na operação.");
      }
    } catch (err) {
      alert("Erro ao processar produto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="border-l-4 border-emerald-500 pl-6 py-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
          {editandoId ? "Editar Produto" : "Produtos"}
        </h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Definição de Itens e Metas de Inventário</p>
      </header>

      {/* FORMULÁRIO */}
      <section className={`transition-all duration-300 p-8 rounded-[32px] border ${editandoId ? 'bg-blue-50/50 border-blue-200' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <input 
              type="text" 
              placeholder="NOME DO PRODUTO" 
              value={novoProduto.nome}
              onChange={(e) => setNovoProduto({...novoProduto, nome: e.target.value})}
              className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-sm font-black uppercase outline-none dark:text-white border border-transparent focus:border-emerald-500 transition-all"
              required
            />
            
            <select 
              value={novoProduto.categoriaId}
              onChange={(e) => setNovoProduto({...novoProduto, categoriaId: e.target.value})}
              className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-sm font-black uppercase outline-none dark:text-white cursor-pointer border border-transparent focus:border-emerald-500"
              required
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
            </div>

            <div className="relative">
              <input 
                type="number" 
                placeholder="CAPACIDADE MÁXIMA" 
                value={novoProduto.estoqueSeguro}
                onChange={(e) => setNovoProduto({...novoProduto, estoqueSeguro: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-sm font-black uppercase outline-none dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <button 
                type="submit" 
                disabled={loading}
                className={`flex-1 ${editandoId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white p-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50`}
              >
                {editandoId ? <Pencil size={18} /> : <Plus size={18} />} 
                {loading ? "Gravando..." : editandoId ? "Salvar Alterações" : "Registrar Item"}
              </button>

              {editandoId && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 p-4 rounded-2xl hover:bg-slate-300 transition-all"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>
        </form>
      </section>

      {/* LISTAGEM */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="p-6">Produto / Identificação</th>
              <th className="p-6">Categoria</th>
              <th className="p-6">Meta de Estoque (Min/Máx)</th>
              <th className="p-6 text-right">Saldo em Tempo Real</th>
              <th className="p-6 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {produtos.length === 0 ? (
               <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase text-xs">Nenhum produto no banco</td></tr>
            ) : (
              produtos.map((prod) => {
                const saldo = prod.estoque || 0;
                const isCritico = saldo <= prod.estoqueMinimo;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="p-6">
                      <p className="font-black text-slate-800 dark:text-white uppercase text-sm italic">{prod.nome}</p>
                    </td>
                    <td className="p-6">
                      <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                        {prod.categoria?.nome || "NÃO DEFINIDO"}
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
                        {saldo} <span className="text-[10px] uppercase not-italic ml-1">UN</span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handlePrepareEdit(prod)}
                          className="text-slate-300 hover:text-blue-500 transition-colors p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(prod.id, prod.nome)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}