"use client";

import {
  Plus,
  Tag,
  Box,
  AlertTriangle,
  Inbox,
  TrendingUp,
  Trash2,
  Pencil,
  X,
  Search,
  ChefHat,
  Printer
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ProdutosPage() {
  const toast = useToast();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");
  
  // ESTADO PARA CONTROLE DE EDIÇÃO
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [novoProduto, setNovoProduto] = useState({
    nome: "",
    estoqueMinimo: "",
    estoqueSeguro: "",
    categoriaId: "",
    requerPreparo: false
  });

  // CARREGAR DADOS COM ORDENAÇÃO ALFABÉTICA
  async function carregarDados() {
    try {
      const [resP, resC] = await Promise.all([
        fetch('/api/produtos'),
        fetch('/api/categorias')
      ]);
      const dataP = await resP.json();
      const dataC = await resC.json();

      if (Array.isArray(dataP)) {
        // Ordena A-Z por nome
        const ordenados = dataP.sort((a, b) => a.nome.localeCompare(b.nome));
        setProdutos(ordenados);
      }
      if (Array.isArray(dataC)) {
        const catsOrdenadas = dataC.sort((a, b) => a.nome.localeCompare(b.nome));
        setCategorias(catsOrdenadas);
      }
    } catch (err) {
      console.error("Erro ao sincronizar dados:", err);
    }
  }

  useEffect(() => { carregarDados(); }, []);

  // LÓGICA DE PESQUISA EM TEMPO REAL
  const produtosFiltrados = produtos.filter(prod => 
    prod.nome.toLowerCase().includes(busca.toLowerCase())
  );

  // PREPARAR EDIÇÃO (CARREGA NO FORM E SOBE A TELA)
  const handlePrepareEdit = (prod: any) => {
    setEditandoId(prod.id);
    setNovoProduto({
      nome: prod.nome,
      estoqueMinimo: prod.estoqueMinimo.toString(),
      estoqueSeguro: prod.estoqueSeguro.toString(),
      categoriaId: prod.categoriaId,
      requerPreparo: prod.requerPreparo || false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditandoId(null);
    setNovoProduto({ nome: "", estoqueMinimo: "", estoqueSeguro: "", categoriaId: "", requerPreparo: false });
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`DESEJA REALMENTE EXCLUIR O PRODUTO: ${nome}?`)) return;
    try {
      const response = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
      if (response.ok) { carregarDados(); toast.success("Produto excluído!"); }
      else toast.error("Erro ao excluir produto.");
    } catch (err) {
      toast.error("Erro na comunicação com o servidor.");
    }
  };

  const imprimirConferencia = () => {
    if (produtos.length === 0) {
      toast.warning("Nenhum produto para imprimir.");
      return;
    }

    const doc = new jsPDF();
    const dataAtual = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("RECANTO BAR", 14, 15);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Lista de Produtos para Conferência — ${dataAtual}`, 14, 22);

    // Agrupar por categoria
    const porCategoria: Record<string, any[]> = {};
    produtos.forEach((prod) => {
      const cat = prod.categoria?.nome || "SEM CATEGORIA";
      if (!porCategoria[cat]) porCategoria[cat] = [];
      porCategoria[cat].push(prod);
    });

    // Ordenar categorias e produtos
    const categoriasOrdenadas = Object.keys(porCategoria).sort((a, b) => a.localeCompare(b));
    categoriasOrdenadas.forEach((cat) => {
      porCategoria[cat].sort((a: any, b: any) => a.nome.localeCompare(b.nome));
    });

    let startY = 28;

    categoriasOrdenadas.forEach((cat) => {
      const prods = porCategoria[cat];

      autoTable(doc, {
        startY,
        head: [[{ content: cat, colSpan: 5, styles: { fillColor: [30, 30, 30], fontSize: 9, fontStyle: "bold" } }]],
        body: prods.map((p: any) => [
          p.nome,
          `R$ ${(p.precoVenda || 0).toFixed(2)}`,
          `R$ ${(p.precoCusto || 0).toFixed(2)}`,
          `${p.estoque || 0}`,
          `${p.estoqueMinimo || 0} / ${p.estoqueSeguro || 0}`,
        ]),
        columns: [
          { header: "Produto", dataKey: "0" },
          { header: "Preço Venda", dataKey: "1" },
          { header: "Preço Custo", dataKey: "2" },
          { header: "Estoque", dataKey: "3" },
          { header: "Mín / Máx", dataKey: "4" },
        ],
        headStyles: { fillColor: [30, 30, 30], fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: "auto" },
          1: { halign: "right", cellWidth: 28 },
          2: { halign: "right", cellWidth: 28 },
          3: { halign: "center", cellWidth: 22 },
          4: { halign: "center", cellWidth: 28 },
        },
        theme: "grid",
        margin: { left: 14, right: 14 },
        didParseCell: (data: any) => {
          if (data.section === "body" && data.column.index === 3) {
            const estoque = prods[data.row.index]?.estoque || 0;
            const min = prods[data.row.index]?.estoqueMinimo || 0;
            if (estoque <= min) {
              data.cell.styles.textColor = [220, 38, 38];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
      });

      startY = (doc as any).lastAutoTable.finalY + 4;
    });

    // Rodapé com total
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(`Total: ${produtos.length} produtos em ${categoriasOrdenadas.length} categorias`, 14, startY + 4);

    doc.save(`produtos-conferencia-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF gerado com sucesso!");
  };

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
          requerPreparo: novoProduto.requerPreparo,
          ...(editandoId ? {} : { estoque: 0, precoVenda: 0, precoCusto: 0 })
        }),
      });

      if (response.ok) {
        handleCancelEdit();
        carregarDados();
      } else {
        const erro = await response.json();
        toast.error(erro.error || "Erro na operação.");
      }
    } catch (err) {
      toast.error("Erro ao processar produto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="border-l-4 border-emerald-500 pl-6 py-2 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
            {editandoId ? "Editar Produto" : "Produtos"}
          </h1>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Gestão de Inventário e Metas</p>
        </div>
        <button
          onClick={imprimirConferencia}
          className="bg-slate-700 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-slate-500/20"
        >
          <Printer size={16} /> Imprimir Lista
        </button>
      </header>

      {/* FORMULÁRIO DE CADASTRO/EDIÇÃO */}
      <section className={`transition-all duration-300 p-8 rounded-[32px] border ${editandoId ? 'bg-blue-50/50 border-blue-200 shadow-inner' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'}`}>
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
            <input 
              type="number" 
              placeholder="LIMITE MÍNIMO" 
              value={novoProduto.estoqueMinimo}
              onChange={(e) => setNovoProduto({...novoProduto, estoqueMinimo: e.target.value})}
              className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-sm font-black uppercase outline-none dark:text-white"
            />
            <input 
              type="number" 
              placeholder="CAPACIDADE MÁXIMA" 
              value={novoProduto.estoqueSeguro}
              onChange={(e) => setNovoProduto({...novoProduto, estoqueSeguro: e.target.value})}
              className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-sm font-black uppercase outline-none dark:text-white"
            />

            <label
              className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl cursor-pointer border border-transparent hover:border-amber-500 transition-all"
              title="Produtos que precisam ser preparados na cozinha"
            >
              <input
                type="checkbox"
                checked={novoProduto.requerPreparo}
                onChange={(e) => setNovoProduto({...novoProduto, requerPreparo: e.target.checked})}
                className="sr-only peer"
              />
              <div className={`w-10 h-5 rounded-full transition-all relative ${novoProduto.requerPreparo ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${novoProduto.requerPreparo ? 'left-5' : 'left-0.5'}`} />
              </div>
              <ChefHat size={16} className={novoProduto.requerPreparo ? 'text-amber-500' : 'text-slate-400'} />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Preparo Cozinha</span>
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 ${editandoId ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'} text-white p-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50`}
              >
                {editandoId ? <Pencil size={18} /> : <Plus size={18} />} 
                {loading ? "PROCESSANDO..." : editandoId ? "SALVAR ALTERAÇÕES" : "REGISTRAR ITEM"}
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

      {/* BARRA DE PESQUISA */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="text-slate-400" size={18} />
        </div>
        <input
          type="text"
          placeholder="PESQUISAR PRODUTO NA LISTA..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 p-4 pl-12 rounded-2xl text-[10px] font-black uppercase outline-none border border-slate-200 dark:border-slate-800 focus:border-emerald-500 transition-all shadow-sm dark:text-white"
        />
      </div>

      {/* LISTAGEM EM TABELA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="p-6">Produto / Identificação</th>
              <th className="p-6">Categoria</th>
              <th className="p-6">Metas (Min/Máx)</th>
              <th className="p-6 text-right">Saldo Atual</th>
              <th className="p-6 text-center">Gerenciar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {produtosFiltrados.length === 0 ? (
               <tr>
                 <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase text-xs">
                    <Inbox size={48} className="mx-auto mb-4 opacity-20" />
                    Nenhum produto encontrado
                 </td>
               </tr>
            ) : (
              produtosFiltrados.map((prod) => {
                const saldo = prod.estoque || 0;
                const isCritico = saldo <= prod.estoqueMinimo;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-slate-800 dark:text-white uppercase text-sm italic">{prod.nome}</p>
                        {prod.requerPreparo && <span title="Requer preparo na cozinha"><ChefHat size={14} className="text-amber-500" /></span>}
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                        {prod.categoria?.nome || "GERAL"}
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
                    <td className="p-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handlePrepareEdit(prod)}
                          className="text-slate-300 hover:text-blue-500 transition-colors p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-500/10"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(prod.id, prod.nome)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10"
                          title="Excluir"
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