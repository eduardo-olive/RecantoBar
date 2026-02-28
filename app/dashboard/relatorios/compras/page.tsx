"use client";

import { useState, useEffect } from "react";
import { useData } from '../../../DataContext'; 
import { Printer, ArrowLeft, ShoppingCart } from "lucide-react";
import Link from 'next/link';

export default function RelatorioCompras() {
  const { produtos } = useData();
  const [mounted, setMounted] = useState(false);

  // 1. Corrige o erro de Hidratação: garante que datas e estados do navegador
  // só sejam renderizados após o componente "montar" no cliente.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lógica de filtragem
  const itensParaRepor = produtos.filter(p => (p.estoque || 0) <= p.estoqueMinimo);

  // Cálculos para o Resumo
  const totalItensCriticos = itensParaRepor.length;
  const totalUnidadesComprar = itensParaRepor.reduce((acc, p) => acc + (p.estoqueSeguro - (p.estoque || 0)), 0);

  const imprimirPDF = () => {
    const agora = new Date();
    const nomeArquivo = `COMPRAS-${String(agora.getDate()).padStart(2, '0')}${String(agora.getMonth() + 1).padStart(2, '0')}${agora.getFullYear()}-${String(agora.getHours()).padStart(2, '0')}${String(agora.getMinutes()).padStart(2, '0')}`;
    const tituloOriginal = document.title;
    document.title = nomeArquivo;
    window.print();
    setTimeout(() => { document.title = tituloOriginal; }, 1000);
  };

  // Se não estiver montado, renderiza um estado vazio para evitar conflito SSR/Client
  if (!mounted) return <div className="p-8 italic opacity-50 uppercase font-black text-xs">Carregando Relatório...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ==========================================================
          CONTEÚDO DA TELA (VISUAL DO SISTEMA)
          ========================================================== */}
      <div className="print:hidden space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Sugestão de Compras</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Reposição de estoque inteligente</p>
          </div>
          <div className="flex gap-3">
             <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-all text-xs uppercase">
                <ArrowLeft size={16} /> Voltar
             </Link>
             <button onClick={imprimirPDF} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
                <Printer size={18} /> Gerar PDF de Compra
             </button>
          </div>
        </header>

        {/* Cards de Resumo na Tela */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Itens Críticos</p>
            <h2 className="text-2xl font-black text-rose-500 italic">{totalItensCriticos}</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Qtd. Total Reposição</p>
            <h2 className="text-2xl font-black text-blue-500 italic">+{totalUnidadesComprar} UN</h2>
          </div>
          <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-500/20">
            <p className="text-blue-100 font-bold uppercase text-[10px] tracking-widest">Prioridade</p>
            <h2 className="text-2xl font-black text-white italic">MÁXIMA</h2>
          </div>
        </div>

        {/* TABELA NA TELA */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase text-sm italic">
            <ShoppingCart size={20} className="text-blue-600" />
            Lista de Necessidades
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="p-5">Produto</th>
                <th className="p-5 text-center">Estoque Atual</th>
                <th className="p-5 text-center">Mínimo</th>
                <th className="p-5 text-right">Sugestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {itensParaRepor.map((prod, i) => {
                 const comprar = prod.estoqueSeguro - (prod.estoque || 0);
                 return (
                    <tr key={prod.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-5 font-black uppercase text-sm italic">{prod.nome}</td>
                      <td className="p-5 text-center font-bold text-rose-500">{(prod.estoque || 0)} UN</td>
                      <td className="p-5 text-center font-bold">{(prod.estoqueMinimo)} UN</td>
                      <td className="p-5 text-right font-black text-emerald-500 text-lg">+{comprar}</td>
                    </tr>
                 )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================================
          CONTEÚDO EXCLUSIVO DO PDF (ESTILO RELATÓRIO MOVIMENTAÇÃO)
          ========================================================== */}
      <div className="hidden print:block bg-white text-black p-0">
        <div className="mb-4">
          <h1 className="text-[22px] font-bold">Recanto Planalto - Sugestão de Compras</h1>
          <p className="text-[14px]">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
        </div>

        <table className="w-full border-collapse border border-gray-400">
          <thead>
            <tr className="bg-[#2563eb] text-white">
              <th className="border border-gray-300 py-1.5 px-3 text-left font-bold text-xs uppercase">Descrição</th>
              <th className="border border-gray-300 py-1.5 px-3 text-center font-bold text-xs uppercase">Mínimo</th>
              <th className="border border-gray-300 py-1.5 px-3 text-center font-bold text-xs uppercase">Atual</th>
              <th className="border border-gray-300 py-1.5 px-3 text-right font-bold text-xs uppercase">Comprar</th>
            </tr>
          </thead>
          <tbody>
            {itensParaRepor.map((item, index) => {
              const comprar = item.estoqueSeguro - (item.estoque || 0);
              return (
                <tr key={index} className={index % 2 === 0 ? 'bg-[#f3f4f6]' : 'bg-white'}>
                  <td className="border border-gray-300 py-1.5 px-3 text-[12px] font-bold uppercase">{item.nome}</td>
                  <td className="border border-gray-300 py-1.5 px-3 text-[12px] text-center">{item.estoqueMinimo}</td>
                  <td className="border border-gray-300 py-1.5 px-3 text-[12px] text-center text-rose-600 font-bold">{(item.estoque || 0)}</td>
                  <td className="border border-gray-300 py-1.5 px-3 text-[12px] font-black text-right bg-blue-50">+{comprar}</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-1/2 space-y-1 bg-gray-50 p-4 border border-gray-300">
            <h3 className="text-xs font-bold uppercase border-b border-gray-400 pb-1 mb-2">Fechamento de Compra</h3>
            <div className="flex justify-between text-xs"><span>Itens Críticos:</span> <span className="font-bold">{totalItensCriticos}</span></div>
            <div className="flex justify-between text-xs"><span>Total Unidades:</span> <span className="font-bold text-blue-700">+{totalUnidadesComprar}</span></div>
            <div className="flex justify-between text-sm font-black border-t-2 border-black pt-1 mt-2 uppercase">
              <span>Situação:</span> <span className="text-rose-600 italic">Estoque Crítico</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          aside, nav, .print\:hidden, header { display: none !important; }
          .hidden.print\:block { display: block !important; }
          main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}