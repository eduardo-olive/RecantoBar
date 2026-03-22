"use client";

import { useState, useEffect } from 'react';
import {
  ArrowUpCircle, ArrowDownCircle, Wallet, AlertCircle,
  Clock, Target, Receipt, AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resProd, resMov, resStats] = await Promise.all([
        fetch('/api/produtos'),
        fetch('/api/movimentacoes'),
        fetch('/api/dashboard/starts'),
      ]);

      if (resProd.ok) setProdutos(await resProd.json());
      if (resMov.ok) setMovimentacoes(await resMov.json());
      if (resStats.ok) setStats(await resStats.json());
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const vendas = movimentacoes.filter((m: any) => m.categoria === 'VENDA' || (m.tipo === 'SAIDA' && !m.categoria));
  const totalVendas = stats?.totalVendas || vendas.reduce((acc: number, m: any) => acc + m.valor, 0);
  const ticketMedio = vendas.length > 0 ? totalVendas / vendas.length : 0;

  const alertasEstoque = produtos
    .filter(p => p.estoque < p.estoqueMinimo)
    .sort((a, b) => (a.estoque - a.estoqueMinimo) - (b.estoque - b.estoqueMinimo))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="font-black uppercase italic animate-pulse text-slate-400">Sincronizando Banco de Dados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <header className="border-l-4 border-blue-600 pl-6 py-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Visão Geral</h1>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Monitoramento em tempo real do fluxo de caixa e estoque</p>
      </header>

      {/* CARDS FINANCEIROS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start"><p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">Faturamento</p><ArrowUpCircle className="text-emerald-500" size={20} /></div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white italic mt-4">R$ {(stats?.totalVendas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start"><p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">Compras/Estoque</p><ArrowDownCircle className="text-rose-500" size={20} /></div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white italic mt-4">R$ {(stats?.totalCompras || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start"><p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">Ticket Médio</p><Target className="text-amber-500" size={20} /></div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white italic mt-4">R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
        </div>
        <div className="bg-blue-600 p-6 rounded-[32px] shadow-lg shadow-blue-500/20 relative overflow-hidden">
          <div className="flex justify-between items-start text-white/70"><p className="font-black uppercase text-[9px] tracking-[0.2em]">Saldo Caixa</p><Wallet className="text-white" size={20} /></div>
          <h2 className="text-2xl font-black text-white italic mt-4">
            R$ {stats?.caixa ? stats.caixa.valor_atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
          </h2>
          {!stats?.caixa && <p className="text-[9px] text-blue-200 font-bold mt-1 uppercase">Caixa fechado</p>}
        </div>
      </div>

      {/* CARDS SECUNDARIOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start"><p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">Despesas Operacionais</p><Receipt className="text-rose-400" size={18} /></div>
          <h2 className="text-xl font-black text-rose-500 italic mt-3">R$ {(stats?.totalDespesas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start"><p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">Perdas</p><AlertTriangle className="text-amber-400" size={18} /></div>
          <h2 className="text-xl font-black text-amber-500 italic mt-3">R$ {(stats?.totalPerdas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
        </div>
        <div className={`p-5 rounded-[24px] shadow-sm ${(stats?.lucroLiquido || 0) >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800'}`}>
          <p className="text-slate-400 font-black uppercase text-[9px] tracking-[0.2em]">Lucro Líquido</p>
          <h2 className={`text-xl font-black italic mt-3 ${(stats?.lucroLiquido || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            R$ {(stats?.lucroLiquido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FLUXO RECENTE */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 font-black uppercase text-xs text-slate-800 dark:text-white tracking-tighter">
            <Clock size={16} className="text-blue-600" /> Fluxo de Caixa (Últimos 5)
          </div>
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {movimentacoes.slice(0, 5).map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-5 font-bold text-xs uppercase italic text-slate-700 dark:text-slate-300">
                    {m.desc}
                    <span className="block text-[9px] text-slate-400 mt-0.5">{m.categoria}</span>
                  </td>
                  <td className={`p-5 text-right font-black italic ${
                    m.categoria === 'VENDA' || m.categoria === 'SUPRIMENTO' ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {m.categoria === 'VENDA' || m.categoria === 'SUPRIMENTO' ? '+' : '-'} R$ {m.valor.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ALERTA DE REPOSICAO */}
        <section className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
          <h2 className="font-black uppercase text-sm mb-6 flex items-center gap-2 tracking-widest relative z-10 text-amber-500">
            <AlertCircle size={18} /> Alerta de Reposição
          </h2>
          <div className="space-y-4 relative z-10">
            {alertasEstoque.length > 0 ? (
              alertasEstoque.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-amber-500/50 transition-colors group">
                  <div>
                    <span className="font-black text-xs uppercase italic tracking-tight block text-slate-200 group-hover:text-white">{p.nome}</span>
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest italic">Estoque Crítico</span>
                  </div>
                  <span className="bg-rose-500/20 text-rose-500 px-4 py-1.5 rounded-full text-[10px] font-black border border-rose-500/30">{p.estoque} UNID</span>
                </div>
              ))
            ) : (
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic text-center py-10">Nenhum item abaixo do estoque mínimo</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
