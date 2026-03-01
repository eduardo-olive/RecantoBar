"use client";

import { useState, useEffect } from "react";
import { Printer, ArrowLeft, ShoppingCart, AlertCircle } from "lucide-react";
import Link from 'next/link';

export default function RelatorioCompras() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 1. BUSCAR DADOS DIRETAMENTE DA API PARA GARANTIR PRECISÃO
  async function carregarDados() {
    try {
      const res = await fetch('/api/produtos');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProdutos(data);
      }
    } catch (err) {
      console.error("Erro ao carregar relatório:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setMounted(true);
    carregarDados();
  }, []);

  // Lógica de filtragem: Estoque Atual <= Estoque Mínimo
  const itensParaRepor = produtos.filter(p => (p.estoque || 0) <= (p.estoqueMinimo || 0));

  // Cálculos para o Resumo
  const totalItensCriticos = itensParaRepor.length;
  // Cálculo baseado no campo estoqueSeguro (nível ideal de estoque)
  const totalUnidadesComprar = itensParaRepor.reduce((acc, p) => {
    const necessidade = (p.estoqueSeguro || p.estoqueMinimo) - (p.estoque || 0);
    return acc + (necessidade > 0 ? necessidade : 0);
  }, 0);

  const imprimirPDF = () => {
    const agora = new Date();
    const nomeArquivo = `COMPRAS-${String(agora.getDate()).padStart(2, '0')}${String(agora.getMonth() + 1).padStart(2, '0')}${agora.getFullYear()}`;
    const tituloOriginal = document.title;
    document.title = nomeArquivo;
    window.print();
    setTimeout(() => { document.title = tituloOriginal; }, 1000);
  };

  if (!mounted || loading) {
    return (
      <div className="p-10 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="italic opacity-50 uppercase font-black text-xs tracking-widest">Sincronizando com Banco de Dados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* TELA DO SISTEMA (OCULTA NA IMPRESSÃO) */}
      <div className="print:hidden space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Sugestão de Compras</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Reposição baseada em estoque crítico</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-all text-xs uppercase bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <ArrowLeft size={16} /> Voltar
             </Link>
             <button onClick={imprimirPDF} className="flex-1 md:flex-none bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
                <Printer size={18} /> Gerar PDF de Compra
             </button>
          </div>
        </header>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Itens Críticos</p>
            <h2 className="text-2xl font-black text-rose-500 italic mt-1">{totalItensCriticos} PRODUTOS</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Unidades a Repor</p>
            <h2 className="text-2xl font-black text-blue-500 italic mt-1">+{totalUnidadesComprar} UN</h2>
          </div>
          <div className={`p-6 rounded-3xl shadow-xl transition-colors ${totalItensCriticos > 0 ? 'bg-rose-600 shadow-rose-500/20' : 'bg-emerald-600 shadow-emerald-500/20'}`}>
            <p className="text-white/60 font-bold uppercase text-[10px] tracking-widest">Status Geral</p>
            <h2 className="text-2xl font-black text-white italic mt-1">{totalItensCriticos > 0 ? 'AÇÃO NECESSÁRIA' : 'ESTOQUE OK'}</h2>
          </div>
        </div>

        {/* Tabela de Sugestões */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase text-sm italic">
            <ShoppingCart size={20} className="text-blue-600" />
            Itens para Cotação
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <th className="p-5">Produto</th>
                  <th className="p-5 text-center">Atual</th>
                  <th className="p-5 text-center">Mínimo</th>
                  <th className="p-5 text-right">Comprar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {itensParaRepor.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center italic opacity-30 font-bold uppercase text-xs">Nenhuma reposição pendente</td>
                  </tr>
                ) : (
                  itensParaRepor.map((prod, i) => {
                    const comprar = (prod.estoqueSeguro || prod.estoqueMinimo) - (prod.estoque || 0);
                    return (
                      <tr key={prod.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-5 font-black uppercase text-sm italic">{prod.nome}</td>
                        <td className="p-5 text-center font-bold text-rose-500">{(prod.estoque || 0)}</td>
                        <td className="p-5 text-center font-bold">{(prod.estoqueMinimo)}</td>
                        <td className="p-5 text-right font-black text-emerald-500 text-lg">+{comprar}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TELA DE IMPRESSÃO (PDF) */}
      <div className="hidden print:block bg-white text-black p-4">
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">ORDEM DE COMPRA</h1>
            <p className="text-xs font-bold text-gray-600 uppercase">Recanto Planalto - Gestão de Estoque</p>
          </div>
          <div className="text-right text-[10px] font-bold uppercase text-gray-500">
            Gerado em: {new Date().toLocaleString('pt-BR')}
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-[10px] font-black uppercase border-y-2 border-black">
              <th className="py-2 px-3 text-left">Descrição do Produto</th>
              <th className="py-2 px-3 text-center">Mínimo</th>
              <th className="py-2 px-3 text-center">Saldo Atual</th>
              <th className="py-2 px-3 text-right">Qtd Sugerida</th>
            </tr>
          </thead>
          <tbody>
            {itensParaRepor.map((item, index) => {
              const comprar = (item.estoqueSeguro || item.estoqueMinimo) - (item.estoque || 0);
              return (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2 px-3 text-[12px] font-bold uppercase italic">{item.nome}</td>
                  <td className="py-2 px-3 text-[12px] text-center">{item.estoqueMinimo}</td>
                  <td className="py-2 px-3 text-[12px] text-center font-bold text-red-600">{(item.estoque || 0)}</td>
                  <td className="py-2 px-3 text-[14px] font-black text-right">+{comprar}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-8 flex justify-end">
          <div className="w-64 p-4 border-2 border-black space-y-2">
            <p className="text-[10px] font-black uppercase text-gray-500 border-b border-gray-200 pb-1">Resumo da Ordem</p>
            <div className="flex justify-between text-xs font-bold italic">
              <span>ITENS CRÍTICOS:</span>
              <span>{totalItensCriticos}</span>
            </div>
            <div className="flex justify-between text-sm font-black text-blue-700">
              <span>TOTAL UNIDADES:</span>
              <span>+{totalUnidadesComprar}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          aside, nav, .print\:hidden, header { display: none !important; }
          .hidden.print\:block { display: block !important; }
          main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          body { background: white !important; padding: 1cm !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}