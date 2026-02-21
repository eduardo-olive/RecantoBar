"use client";

import { useData } from '../DataContext';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Package, 
  AlertCircle, 
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';

export default function Dashboard() {
  const { movimentacoes, produtos } = useData();

  // --- CÁLCULOS DINÂMICOS ---
  const vendas = movimentacoes.filter(m => m.tipo === 'ENTRADA');
  const totalEntradas = vendas.reduce((acc, curr) => acc + curr.valor, 0);

  const totalSaidas = movimentacoes
    .filter(m => m.tipo === 'SAIDA')
    .reduce((acc, curr) => acc + curr.valor, 0);

  const saldoCaixa = totalEntradas - totalSaidas;

  // Cálculo do Ticket Médio (Total de Entradas / Número de Vendas)
  const ticketMedio = vendas.length > 0 ? totalEntradas / vendas.length : 0;

  const alertasEstoque = produtos.filter(p => p.estoque < p.estoqueMinimo);

  return (
    <div className="space-y-10 pb-10">
      {/* CABEÇALHO */}
      <header className="border-l-4 border-blue-600 pl-6 py-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
          Visão Geral
        </h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
          Monitoramento em tempo real do fluxo de caixa e estoque
        </p>
      </header>

      {/* CARDS FINANCEIROS (GRID DE 4 COLUNAS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ENTRADAS */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">Faturamento</p>
            <ArrowUpCircle className="text-emerald-500" size={20} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white italic mt-4 relative z-10">
            R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>

        {/* SAÍDAS */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">Saídas/Perdas</p>
            <ArrowDownCircle className="text-rose-500" size={20} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white italic mt-4 relative z-10">
            R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>

        {/* TICKET MÉDIO */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">Ticket Médio</p>
            <Target className="text-amber-500" size={20} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white italic mt-4 relative z-10">
            R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>

        {/* SALDO EM CAIXA */}
        <div className="bg-blue-600 p-6 rounded-[32px] shadow-lg shadow-blue-500/20 relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10 text-white/70">
            <p className="font-black uppercase text-[9px] tracking-[0.2em]">Saldo Atual</p>
            <Wallet className="text-white" size={20} />
          </div>
          <h2 className="text-2xl font-black text-white italic mt-4 relative z-10">
            R$ {saldoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FLUXO RECENTE */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-black uppercase text-xs text-slate-800 dark:text-white tracking-tighter">
              <Clock size={16} className="text-blue-600" /> Fluxo de Caixa
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {movimentacoes.slice(-5).reverse().map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-5 font-bold text-xs uppercase italic text-slate-700 dark:text-slate-300">{m.desc}</td>
                    <td className={`p-5 text-right font-black italic ${m.tipo === 'ENTRADA' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {m.tipo === 'ENTRADA' ? '+' : '-'} R$ {m.valor.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ALERTA DE REPOSIÇÃO */}
        <section className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
          <h2 className="font-black uppercase text-sm mb-6 flex items-center gap-2 tracking-widest relative z-10 text-amber-500">
            <AlertCircle size={18} /> Alerta de Reposição
          </h2>
          <div className="space-y-4 relative z-10">
            {alertasEstoque.map(p => (
              <div key={p.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-amber-500/50 transition-colors group">
                <div>
                  <span className="font-black text-xs uppercase italic tracking-tight block text-slate-200 group-hover:text-white">{p.nome}</span>
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">Estoque Crítico</span>
                </div>
                <span className="bg-rose-500/20 text-rose-500 px-4 py-1.5 rounded-full text-[10px] font-black border border-rose-500/30">
                  {p.estoque} UNID
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}