"use client";

import { useState, useEffect } from "react";
import {
  Banknote, ArrowDownCircle, ArrowUpCircle, XCircle, CheckCircle2,
  History, AlertCircle, Minus, Plus
} from "lucide-react";
import Link from "next/link";

export default function CaixaPage() {
  const [caixaAtual, setCaixaAtual] = useState<any>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modal, setModal] = useState<"" | "sangria" | "suprimento" | "fechar">("");
  const [modalValor, setModalValor] = useState("");
  const [modalMotivo, setModalMotivo] = useState("");
  const [modalObs, setModalObs] = useState("");

  const carregar = async () => {
    setLoading(true);
    try {
      const [resCaixa, resHistorico] = await Promise.all([
        fetch("/api/caixa/abrir"),
        fetch("/api/caixa"),
      ]);
      if (resCaixa.ok) setCaixaAtual(await resCaixa.json());
      else setCaixaAtual(null);
      if (resHistorico.ok) setHistorico(await resHistorico.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const executarSangria = async () => {
    if (!modalValor || Number(modalValor) <= 0) return;
    const res = await fetch("/api/caixa/sangria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor: Number(modalValor), motivo: modalMotivo }),
    });
    if (res.ok) { setModal(""); setModalValor(""); setModalMotivo(""); carregar(); alert("Sangria realizada!"); }
    else { const err = await res.json(); alert(err.error); }
  };

  const executarSuprimento = async () => {
    if (!modalValor || Number(modalValor) <= 0) return;
    const res = await fetch("/api/caixa/suprimento", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor: Number(modalValor), motivo: modalMotivo }),
    });
    if (res.ok) { setModal(""); setModalValor(""); setModalMotivo(""); carregar(); alert("Suprimento realizado!"); }
    else { const err = await res.json(); alert(err.error); }
  };

  const executarFechamento = async () => {
    if (!modalValor) return;
    const res = await fetch("/api/caixa/fechar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ valor_fechamento: Number(modalValor), observacao: modalObs }),
    });
    if (res.ok) {
      const data = await res.json();
      setModal("");
      setModalValor("");
      setModalObs("");
      carregar();
      const dif = Number(data.resumo.diferenca);
      alert(`Caixa fechado!\nEsperado: R$ ${Number(data.resumo.valor_esperado).toFixed(2)}\nContado: R$ ${Number(data.resumo.valor_contado).toFixed(2)}\nDiferença: R$ ${dif.toFixed(2)} ${dif >= 0 ? "(sobra)" : "(falta)"}`);
    } else { const err = await res.json(); alert(err.error); }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="font-black uppercase italic animate-pulse text-slate-400">Carregando...</div></div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="border-l-4 border-blue-600 pl-6 py-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Gestão de Caixa</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Controle de abertura, fechamento, sangria e suprimento</p>
      </header>

      {/* CAIXA ATUAL */}
      {caixaAtual ? (
        <div className="bg-blue-600 p-8 rounded-[32px] shadow-lg shadow-blue-500/20 text-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-blue-200 font-black uppercase text-[10px] tracking-widest">Caixa Aberto</p>
              <p className="text-blue-100 text-xs mt-1">Aberto em: {new Date(caixaAtual.data_abertura).toLocaleString("pt-BR")}</p>
            </div>
            <Banknote size={28} />
          </div>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">Valor Inicial</p>
              <p className="text-2xl font-black italic">R$ {Number(caixaAtual.valor_inicial).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest">Saldo Atual</p>
              <p className="text-3xl font-black italic">R$ {Number(caixaAtual.valor_atual).toFixed(2)}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setModal("sangria"); setModalValor(""); setModalMotivo(""); }} className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all border border-white/10">
              <Minus size={16} /> Sangria
            </button>
            <button onClick={() => { setModal("suprimento"); setModalValor(""); setModalMotivo(""); }} className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all border border-white/10">
              <Plus size={16} /> Suprimento
            </button>
            <button onClick={() => { setModal("fechar"); setModalValor(""); setModalObs(""); }} className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 py-3 rounded-xl font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 transition-all border border-rose-500/30 text-rose-200">
              <XCircle size={16} /> Fechar Caixa
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-900 p-10 rounded-[32px] border border-slate-200 dark:border-slate-800 text-center">
          <AlertCircle size={40} className="mx-auto text-amber-500 mb-4" />
          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Nenhum Caixa Aberto</h3>
          <p className="text-slate-500 text-sm mb-6">Abra o caixa para iniciar as operações do dia</p>
          <Link href="/caixa/saldo-inicial" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all">
            Abrir Caixa
          </Link>
        </div>
      )}

      {/* HISTORICO */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <History size={18} className="text-blue-600" />
          <h2 className="font-black uppercase text-sm text-slate-800 dark:text-white tracking-tighter">Histórico de Caixas</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <th className="p-4">Abertura</th>
                <th className="p-4">Fechamento</th>
                <th className="p-4 text-right">Inicial</th>
                <th className="p-4 text-right">Final</th>
                <th className="p-4 text-right">Diferença</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {historico.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 text-xs font-bold text-slate-600 dark:text-slate-300">{new Date(c.data_abertura).toLocaleString("pt-BR")}</td>
                  <td className="p-4 text-xs font-bold text-slate-500">{c.data_fechamento ? new Date(c.data_fechamento).toLocaleString("pt-BR") : "-"}</td>
                  <td className="p-4 text-right font-black text-sm text-slate-700 dark:text-slate-200">R$ {Number(c.valor_inicial).toFixed(2)}</td>
                  <td className="p-4 text-right font-black text-sm text-slate-700 dark:text-slate-200">R$ {Number(c.valor_atual).toFixed(2)}</td>
                  <td className={`p-4 text-right font-black text-sm ${c.diferenca !== null ? (Number(c.diferenca) >= 0 ? "text-emerald-500" : "text-rose-500") : "text-slate-400"}`}>
                    {c.diferenca !== null ? `R$ ${Number(c.diferenca).toFixed(2)}` : "-"}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${c.status === "aberto" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
              {historico.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400 font-bold italic text-sm">Nenhum caixa registrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-black uppercase italic dark:text-white mb-6 text-center">
              {modal === "sangria" && "Sangria de Caixa"}
              {modal === "suprimento" && "Suprimento de Caixa"}
              {modal === "fechar" && "Fechar Caixa"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                  {modal === "fechar" ? "Valor Contado (R$)" : "Valor (R$)"}
                </label>
                <input type="number" step="0.01" value={modalValor} onChange={(e) => setModalValor(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-xl font-black text-xl outline-none focus:ring-2 ring-blue-500 mt-1" placeholder="0.00" />
              </div>

              {modal === "fechar" && caixaAtual && (
                <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Valor Esperado</p>
                  <p className="text-2xl font-black text-blue-600 italic">R$ {Number(caixaAtual.valor_atual).toFixed(2)}</p>
                  {modalValor && (
                    <p className={`text-sm font-black mt-2 ${Number(modalValor) - Number(caixaAtual.valor_atual) >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      Diferença: R$ {(Number(modalValor) - Number(caixaAtual.valor_atual)).toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">
                  {modal === "fechar" ? "Observação" : "Motivo"}
                </label>
                <input type="text"
                  value={modal === "fechar" ? modalObs : modalMotivo}
                  onChange={(e) => modal === "fechar" ? setModalObs(e.target.value) : setModalMotivo(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl font-bold outline-none focus:ring-2 ring-blue-500 mt-1 text-sm"
                  placeholder={modal === "fechar" ? "Observações do fechamento..." : "Motivo da operação..."} />
              </div>

              <button onClick={modal === "sangria" ? executarSangria : modal === "suprimento" ? executarSuprimento : executarFechamento}
                className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${
                  modal === "fechar" ? "bg-rose-500 hover:bg-rose-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}>
                <CheckCircle2 size={18} /> Confirmar
              </button>
              <button onClick={() => setModal("")} className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-rose-500 transition-colors text-center">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
