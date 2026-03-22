"use client";

import { useState, useEffect } from "react";
import { Printer, ArrowDownCircle, ArrowUpCircle, FileText } from "lucide-react";
import { DateRangeFilter } from "../../components/DateRangeFilter";

export default function RelatorioVendas() {
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = async (dataInicio = "", dataFim = "") => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dataInicio) params.set("dataInicio", dataInicio);
    if (dataFim) params.set("dataFim", dataFim);

    const res = await fetch(`/api/movimentacoes?${params}`);
    if (res.ok) setMovimentacoes(await res.json());
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const totalEntradas = movimentacoes
    .filter(m => m.tipo === "ENTRADA")
    .reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

  const totalSaidas = movimentacoes
    .filter(m => m.tipo === "SAIDA")
    .reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);

  const saldoGeral = totalSaidas - totalEntradas;

  const porPagamento: Record<string, number> = {};
  movimentacoes
    .filter(m => m.tipo === "SAIDA" && m.categoria === "VENDA")
    .forEach(m => {
      const pg = m.pagamento || "OUTROS";
      porPagamento[pg] = (porPagamento[pg] || 0) + Number(m.valor);
    });

  const imprimirPDF = () => {
    const agora = new Date();
    const nomeArquivo = `${String(agora.getDate()).padStart(2, '0')}${String(agora.getMonth() + 1).padStart(2, '0')}${agora.getFullYear()}-${String(agora.getHours()).padStart(2, '0')}${String(agora.getMinutes()).padStart(2, '0')}`;
    const tituloOriginal = document.title;
    document.title = nomeArquivo;
    window.print();
    setTimeout(() => { document.title = tituloOriginal; }, 1000);
  };

  return (
    <div className="space-y-8">
      <div className="print:hidden space-y-8">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Relatório Geral</h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Histórico de movimentações</p>
          </div>
          <button onClick={imprimirPDF} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
            <Printer size={18} /> Gerar PDF
          </button>
        </header>

        <DateRangeFilter onFilter={carregar} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Vendas (Faturamento)</p>
            <h2 className="text-2xl font-black text-emerald-500 italic">R$ {totalSaidas.toFixed(2)}</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Compras + Despesas</p>
            <h2 className="text-2xl font-black text-rose-500 italic">R$ {totalEntradas.toFixed(2)}</h2>
          </div>
          <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-500/20">
            <p className="text-blue-100 font-bold uppercase text-[10px] tracking-widest">Saldo</p>
            <h2 className="text-2xl font-black text-white italic">R$ {saldoGeral.toFixed(2)}</h2>
          </div>
        </div>

        {/* PAGAMENTO BREAKDOWN */}
        {Object.keys(porPagamento).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(porPagamento).map(([pg, val]) => (
              <div key={pg} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{pg}</p>
                <p className="text-lg font-black text-blue-600 italic">R$ {val.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase text-sm">
            <FileText size={20} className="text-blue-600" /> Movimentações
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="p-5">Descrição</th>
                <th className="p-5">Categoria</th>
                <th className="p-5">Pagamento</th>
                <th className="p-5 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {movimentacoes.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-5">
                    <p className="font-black text-slate-800 dark:text-white uppercase text-sm italic">{item.desc}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{new Date(item.data).toLocaleString("pt-BR")}</p>
                  </td>
                  <td className="p-5">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-full text-[9px] font-black uppercase">
                      {item.categoria || item.tipo}
                    </span>
                  </td>
                  <td className="p-5 text-[10px] font-black text-slate-500 uppercase">{item.pagamento || '-'}</td>
                  <td className={`p-5 text-right font-black ${
                    item.categoria === 'VENDA' || item.categoria === 'SUPRIMENTO' ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {item.categoria === 'VENDA' || item.categoria === 'SUPRIMENTO' ? '+' : '-'} R$ {Number(item.valor).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF */}
      <div className="hidden print:block bg-white text-black p-0 font-sans">
        <div className="mb-4">
          <h1 className="text-[22px] font-bold">Recanto Planalto - Relatório de Movimentações</h1>
          <p className="text-[14px]">Gerado em: {new Date().toLocaleString('pt-BR')} | Saldo: <span className="font-bold text-black">R$ {saldoGeral.toFixed(2)}</span></p>
        </div>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-[#2563eb] text-white">
              <th className="border border-gray-300 py-1.5 px-3 text-left font-bold text-xs uppercase">Data</th>
              <th className="border border-gray-300 py-1.5 px-3 text-left font-bold text-xs uppercase">Descrição</th>
              <th className="border border-gray-300 py-1.5 px-3 text-left font-bold text-xs uppercase">Categoria</th>
              <th className="border border-gray-300 py-1.5 px-3 text-left font-bold text-xs uppercase">Pagamento</th>
              <th className="border border-gray-300 py-1.5 px-3 text-right font-bold text-xs uppercase">Valor</th>
            </tr>
          </thead>
          <tbody>
            {movimentacoes.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-[#f3f4f6]' : 'bg-white'}>
                <td className="border border-gray-300 py-1.5 px-3 text-[12px] whitespace-nowrap">{new Date(item.data).toLocaleString("pt-BR")}</td>
                <td className="border border-gray-300 py-1.5 px-3 text-[12px] uppercase">{item.desc}</td>
                <td className="border border-gray-300 py-1.5 px-3 text-[12px]">{item.categoria || item.tipo}</td>
                <td className="border border-gray-300 py-1.5 px-3 text-[12px]">{item.pagamento || '-'}</td>
                <td className="border border-gray-300 py-1.5 px-3 text-[12px] font-bold text-right">R$ {Number(item.valor).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 flex justify-end">
          <div className="w-1/2 space-y-1 bg-gray-50 p-4 border border-gray-300">
            <h3 className="text-xs font-bold uppercase border-b border-gray-400 pb-1 mb-2">Fechamento</h3>
            <div className="flex justify-between text-xs"><span>Total Vendas:</span> <span className="font-bold text-emerald-700">R$ {totalSaidas.toFixed(2)}</span></div>
            <div className="flex justify-between text-xs"><span>Total Compras/Despesas:</span> <span className="font-bold text-rose-700">R$ {totalEntradas.toFixed(2)}</span></div>
            {Object.entries(porPagamento).map(([pg, val]) => (
              <div key={pg} className="flex justify-between text-[11px]"><span>{pg}:</span> <span>R$ {val.toFixed(2)}</span></div>
            ))}
            <div className="flex justify-between text-sm font-black border-t-2 border-black pt-1 mt-2 uppercase">
              <span>Saldo Geral:</span> <span>R$ {saldoGeral.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          aside, nav, .print\\:hidden, header, .bg-slate-900 { display: none !important; }
          .hidden.print\\:block { display: block !important; }
          main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}
